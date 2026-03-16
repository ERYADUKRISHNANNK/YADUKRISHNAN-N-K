
import React, { useState, useEffect } from 'react';
import { LocationData, User } from '../types';
import { GoogleGenAI } from "@google/genai";
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Wind, ShieldAlert, Activity, Droplets, Thermometer, MapPin, Search, Navigation, Mic, Moon, Sun, Shield } from 'lucide-react';
import { AppNotification } from '../types';

interface DashboardProps {
  user: User;
  location: LocationData;
  onLocationChange: (loc: LocationData) => void;
  onShowEmergency: () => void;
  onViewImpact: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAddNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
}

interface SearchResult {
  title: string;
  uri: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  location, 
  onLocationChange, 
  onShowEmergency, 
  onViewImpact, 
  onProfileClick,
  onAdminClick,
  isDarkMode,
  onToggleDarkMode,
  onAddNotification
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      // Trigger search after a short delay to let the user see the text
      setTimeout(() => {
        handleSearch();
      }, 500);
    };
    recognition.start();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simulating data for current location
        setTimeout(() => {
          onLocationChange({
            name: `Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            lat: latitude,
            lng: longitude,
            aqi: Math.floor(Math.random() * 60) + 10,
            pm25: parseFloat((Math.random() * 15 + 5).toFixed(1)),
            no2: parseFloat((Math.random() * 10 + 2).toFixed(1))
          });
          setIsLocating(false);
          setSearchQuery('');
          setShowResults(false);
        }, 1500);
      },
      (error) => {
        setIsLocating(false);
        alert('Unable to retrieve your location. ' + error.message);
      }
    );
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLocating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-2.5-flash as it's the required model for googleMaps grounding.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Locate precise coordinates and place info for: "${searchQuery}". 
                   Return in format: "LOCATION: [Name] | COORDS: [LAT, LNG]"`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedResults: SearchResult[] = chunks
        .filter(c => c.maps)
        .map(c => ({
          title: c.maps.title || "Target Area",
          uri: c.maps.uri
        }));

      setSearchResults(extractedResults);
      setShowResults(extractedResults.length > 0);

      const coordMatch = response.text.match(/COORDS:\s*\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]/i);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        onLocationChange({
          name: searchQuery,
          lat,
          lng,
          aqi: Math.floor(Math.random() * 180) + 20,
          pm25: parseFloat((Math.random() * 40 + 5).toFixed(1)),
          no2: parseFloat((Math.random() * 30 + 5).toFixed(1))
        });
        if (extractedResults.length === 0) setShowResults(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLocating(false);
    }
  };

  const selectResult = async (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery(result.title);
    setIsLocating(true);
    
    try {
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(result.title)}`);
      const geoData = await geoResponse.json();
      if (geoData?.[0]) {
        onLocationChange({
          name: result.title,
          lat: parseFloat(geoData[0].lat),
          lng: parseFloat(geoData[0].lon),
          aqi: Math.floor(Math.random() * 180) + 20,
          pm25: parseFloat((Math.random() * 40 + 5).toFixed(1)),
          no2: parseFloat((Math.random() * 30 + 5).toFixed(1))
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocating(false);
    }
  };

  const aqiColorClass = location.aqi <= 50 ? 'text-aqi-good' : 
                        location.aqi <= 100 ? 'text-aqi-moderate' : 
                        location.aqi <= 200 ? 'text-aqi-unhealthy' : 'text-aqi-severe';

  const aqiBgClass = location.aqi <= 50 ? 'bg-aqi-good/20' : 
                     location.aqi <= 100 ? 'bg-aqi-moderate/20' : 
                     location.aqi <= 200 ? 'bg-aqi-unhealthy/20' : 'bg-aqi-severe/20';

  const aqiBorderClass = location.aqi <= 50 ? 'border-aqi-good/30' : 
                         location.aqi <= 100 ? 'border-aqi-moderate/30' : 
                         location.aqi <= 200 ? 'border-aqi-unhealthy/30' : 'border-aqi-severe/30';

  const aqiLabel = location.aqi <= 50 ? 'Healthy' : 
                   location.aqi <= 100 ? 'Moderate' : 
                   location.aqi <= 200 ? 'Unhealthy' : 'Hazardous';

  const aqiStrokeColor = location.aqi <= 50 ? '#13ec5b' : 
                         location.aqi <= 100 ? '#fde047' : 
                         location.aqi <= 200 ? '#fb923c' : '#ef4444';

  const isHazardous = location.aqi >= 200;

  const calculateRiskScore = () => {
    if (!user.healthDetails) return location.aqi / 5;
    
    const { hasAsthma, pollutionSensitivity } = user.healthDetails;
    let baseScore = location.aqi / 3;
    
    if (hasAsthma) baseScore += 20;
    if (pollutionSensitivity === 'High') baseScore += 15;
    if (pollutionSensitivity === 'Medium') baseScore += 5;
    
    return Math.min(100, Math.round(baseScore));
  };

  useEffect(() => {
    // Simulate push notifications
    const interval = setInterval(() => {
      if (location.aqi > 100) {
        onAddNotification({
          type: 'warning',
          title: 'Air Quality Alert',
          message: `AQI in ${location.name} is ${location.aqi}. Please take precautions.`
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [location.aqi, location.name, onAddNotification]);

  const riskScore = calculateRiskScore();

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-500';
    if (score < 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getPersonalizedAdvice = () => {
    if (!user.healthDetails) return "Stay informed about your local air quality.";
    
    const { hasAsthma, pollutionSensitivity, respiratoryConditions } = user.healthDetails;
    
    if (location.aqi > 100) {
      if (hasAsthma || pollutionSensitivity === 'High' || respiratoryConditions.length > 0) {
        return "Critical: High risk for your respiratory profile. Stay indoors and use air purifiers.";
      }
      return "Unhealthy air detected. Sensitive groups should limit outdoor exertion.";
    }
    
    if (location.aqi > 50) {
      if (hasAsthma || pollutionSensitivity === 'High') {
        return "Moderate AQI: You may experience sensitivity. Keep rescue inhaler nearby.";
      }
      return "Air quality is acceptable. Enjoy outdoor activities with caution.";
    }
    
    return "Excellent air quality! Perfect for outdoor exercise and deep breathing.";
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent p-4 relative dark:text-slate-100">
      {/* Dynamic Hazardous Banner */}
      <AnimatePresence>
        {isHazardous && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onClick={onShowEmergency}
            className="bg-rose-600 text-white p-3 rounded-2xl mb-4 flex items-center gap-3 shadow-lg shadow-rose-200 cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest">Hazardous Air Quality Detected</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Search */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Good Morning</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{user.name}</h1>
            </div>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleDarkMode}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onProfileClick}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </motion.button>
            {user.role === 'admin' && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAdminClick}
                className="w-12 h-12 rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center border border-primary transition-colors"
                title="Admin Control"
              >
                <Shield className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative group flex-1"
          >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search city or region..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="w-full pl-12 pr-24 py-4 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-slate-800 dark:text-white transition-all placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startVoiceSearch}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Voice Search"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
            {isLocating && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
              />
            )}
          </div>
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 z-50 max-h-64 overflow-y-auto"
              >
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectResult(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{result.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Location</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetLocation}
          className="p-4 bg-white rounded-[1.5rem] shadow-xl border border-slate-100 flex items-center justify-center text-primary"
          title="Use Live Location"
        >
          <Navigation className="w-5 h-5" />
        </motion.button>
      </div>
    </header>

      {/* Main Stats Card - 3D Effect */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative bg-white dark:bg-slate-800 rounded-[3rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 overflow-hidden group"
      >
        {/* Background Image based on AQI */}
        <div className="absolute inset-0 opacity-5 pointer-events-none transition-opacity duration-1000 group-hover:opacity-10">
          <img 
            src={location.aqi <= 50 ? "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800" : 
                 location.aqi <= 100 ? "https://images.unsplash.com/photo-1534088568595-a066f7104218?auto=format&fit=crop&q=80&w=800" : 
                 "https://images.unsplash.com/photo-1590069230002-70cc2045de05?auto=format&fit=crop&q=80&w=800"} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated Background Particles (Pollution Drift) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                x: [Math.random() * 400, -100],
                y: [Math.random() * 400, Math.random() * 400],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-primary rounded-full"
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{location.name}</span>
          </div>
          
          <div className="relative mt-4 mb-4">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter"
            >
              {location.aqi}
            </motion.div>
            <div className="absolute -top-2 -right-6">
              <span className="text-xs font-black text-primary uppercase tracking-widest">AQI</span>
            </div>
          </div>

          <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-8 ${
            location.aqi <= 50 ? 'bg-emerald-100 text-emerald-600' :
            location.aqi <= 100 ? 'bg-amber-100 text-amber-600' :
            'bg-rose-100 text-rose-600'
          }`}>
            {location.aqi <= 50 ? 'Healthy Air' : location.aqi <= 100 ? 'Moderate' : 'Unhealthy'}
          </div>

          <div className="grid grid-cols-3 gap-8 w-full border-t border-slate-50 dark:border-slate-700 pt-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-2">
                <Droplets className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">42%</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mb-2">
                <Thermometer className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temp</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">24°C</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-2">
                <Wind className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wind</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">12m/s</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personalized Risk Score - 3D Card */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-slate-900 dark:text-white font-black text-lg leading-tight">Personal Risk Score</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Based on your profile</p>
          </div>
          <div className={`text-3xl font-black ${getRiskColor(riskScore)}`}>
            {riskScore}<span className="text-xs opacity-50 ml-1">/100</span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              riskScore < 30 ? 'bg-emerald-500' : 
              riskScore < 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
        </div>
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
          Your risk is <span className="font-bold text-slate-700 dark:text-slate-200">{riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High'}</span> today. {getPersonalizedAdvice()}
        </p>
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <motion.button 
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewImpact}
          className="bg-primary text-white p-6 rounded-[2.5rem] shadow-xl shadow-primary/20 flex flex-col gap-3 group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Impact</p>
            <p className="text-sm font-black">Daily Footprint</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowEmergency}
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3 group"
        >
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency</p>
            <p className="text-sm font-black">Safety Protocol</p>
          </div>
        </motion.button>
      </div>

      {/* Floating Navigation Hint */}
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mt-8 flex flex-col items-center opacity-30"
      >
        <Navigation className="w-4 h-4 text-slate-400" />
        <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-2">Scroll for more</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
