
import React, { useState, useEffect } from 'react';
import { Screen, ImpactData, FootprintResult, LocationData, User, NotificationSettings, AppNotification } from './types';
import Dashboard from './screens/Dashboard';
import Calculator from './screens/Calculator';
import Results from './screens/Results';
import Settings from './screens/Settings';
import MapScreen from './screens/MapScreen';
import Profile from './screens/Profile';
import Auth from './screens/Auth';
import CommunityScreen from './screens/CommunityScreen';
import StudyScreen from './screens/StudyScreen';
import GameScreen from './screens/GameScreen';
import AdminDashboard from './screens/AdminDashboard';
import EmergencyOverlay from './screens/EmergencyOverlay';
import BottomNav from './components/BottomNav';
import NotificationSystem from './components/NotificationSystem';
import ChatBot from './components/ChatBot';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [showEmergency, setShowEmergency] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { ...notif, id, timestamp: Date.now() }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const [user, setUser] = useState<User>({
    name: 'Guest',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
    isLoggedIn: false,
    notificationSettings: {
      emergencyAlerts: true,
      aqiChanges: true,
      carbonMilestones: true,
      weeklyReports: true,
      healthTips: false,
      quietHours: {
        enabled: true,
        from: '22:00',
        to: '07:00'
      },
      alertSound: 'Siren'
    }
  });

  const [results, setResults] = useState<FootprintResult | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Offline Caching
  useEffect(() => {
    if (results) {
      localStorage.setItem('lastFootprintResult', JSON.stringify(results));
    }
  }, [results]);

  useEffect(() => {
    const cached = localStorage.getItem('lastFootprintResult');
    if (cached && !results) {
      setResults(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        } else {
          // Create default profile if not exists
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
            isLoggedIn: true,
            notificationSettings: {
              emergencyAlerts: true,
              aqiChanges: true,
              carbonMilestones: true,
              weeklyReports: true,
              healthTips: true,
              quietHours: { enabled: true, from: '22:00', to: '07:00' },
              alertSound: 'Chime'
            }
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(prev => ({ ...prev, isLoggedIn: false }));
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateNotificationSettings = async (settings: NotificationSettings) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, { notificationSettings: settings }, { merge: true });
    setUser(prev => ({
      ...prev,
      notificationSettings: settings
    }));
  };

  const [location, setLocation] = useState<LocationData>({
    name: 'San Francisco, CA',
    aqi: 42,
    pm25: 12.4,
    no2: 8.2,
    lat: 37.7749,
    lng: -122.4194
  });

  const [impactData, setImpactData] = useState<ImpactData>({
    acUnits: 2,
    fanUsage: 8,
    energySource: 'Main Grid (Coal/Gas)',
    co2Rate: 0.45,
    gasLevels: 0
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(prev => ({
            ...prev,
            name: `Detected Area (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            lat: latitude,
            lng: longitude,
          }));
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (location.aqi >= 200) {
      setShowEmergency(true);
    }
  }, [location.aqi]);

  const handleCalculate = (data: ImpactData) => {
    setImpactData(data);
    // Calculations for daily footprint in kgCO2
    const acImpact = data.acUnits * 1.5 * data.co2Rate;
    const fanImpact = data.fanUsage * 0.1 * data.co2Rate;
    const gasImpact = data.gasLevels * 2.1; // Average kgCO2 per unit of gas
    const baseImpact = 2.0; // Base daily impact (food, waste, etc.)
    
    const total = baseImpact + acImpact + fanImpact + gasImpact;
    
    setResults({
      totalTons: parseFloat(total.toFixed(2)), // Showing as kg for daily, or keep as "units"
      breakdown: {
        acUsage: Math.round((acImpact / total) * 100),
        gasEmissions: Math.round((gasImpact / total) * 100),
        energySource: 100 - (Math.round((acImpact / total) * 100) + Math.round((gasImpact / total) * 100))
      }
    });
    setCurrentScreen(Screen.RESULTS);
  };

  const handleLocationChange = (newLocation: LocationData) => {
    setLocation(newLocation);
  };

  const handleLogin = (userData: User) => {
    // This is now handled by onAuthStateChanged
    addNotification({
      type: 'success',
      title: 'Welcome!',
      message: `Logged in as ${userData.name}. Your health profile is active.`
    });
    setCurrentScreen(Screen.DASHBOARD);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentScreen(Screen.AUTH);
  };

  const renderScreen = () => {
    if (!user.isLoggedIn) {
      if (currentScreen === Screen.STUDY) return <StudyScreen onBack={() => setCurrentScreen(Screen.AUTH)} />;
      if (currentScreen === Screen.GAME) return <GameScreen onBack={() => setCurrentScreen(Screen.AUTH)} />;
      return <Auth 
        onLogin={handleLogin} 
        onNavigateToStudy={() => setCurrentScreen(Screen.STUDY)}
        onNavigateToGame={() => setCurrentScreen(Screen.GAME)}
      />;
    }

    switch (currentScreen) {
      case Screen.DASHBOARD:
        return <Dashboard 
          user={user}
          location={location}
          onLocationChange={handleLocationChange}
          onShowEmergency={() => setShowEmergency(true)} 
          onViewImpact={() => setCurrentScreen(results ? Screen.RESULTS : Screen.CALCULATOR)}
          onProfileClick={() => setCurrentScreen(Screen.PROFILE)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onAddNotification={addNotification}
        />;
      case Screen.MAP:
        return <MapScreen 
          currentLocation={location}
          onLocationSelect={(newLoc) => {
            handleLocationChange(newLoc);
            setCurrentScreen(Screen.DASHBOARD);
          }}
          onAddNotification={addNotification}
        />;
      case Screen.CALCULATOR:
        return <Calculator 
          currentLocationName={location.name}
          initialData={impactData} 
          onCalculate={handleCalculate}
          onLocationChange={handleLocationChange}
          onNavigateToMap={() => setCurrentScreen(Screen.MAP)}
        />;
      case Screen.RESULTS:
        return <Results result={results} onBack={() => setCurrentScreen(Screen.DASHBOARD)} />;
      case Screen.SETTINGS:
        return <Settings 
          settings={user.notificationSettings} 
          onUpdate={handleUpdateNotificationSettings} 
          onBack={() => setCurrentScreen(Screen.DASHBOARD)}
        />;
      case Screen.PROFILE:
        return <Profile 
          user={user} 
          onBack={() => setCurrentScreen(Screen.DASHBOARD)} 
          onLogout={handleLogout}
          onAddNotification={addNotification}
        />;
      case Screen.COMMUNITY:
        return <CommunityScreen 
          user={user}
          onAddNotification={addNotification}
        />;
      case Screen.STUDY:
        return <StudyScreen onBack={() => setCurrentScreen(Screen.DASHBOARD)} />;
      case Screen.GAME:
        return <GameScreen onBack={() => setCurrentScreen(Screen.DASHBOARD)} />;
      case Screen.ADMIN:
        return <AdminDashboard onBack={() => setCurrentScreen(Screen.DASHBOARD)} />;
      default:
        return <Dashboard 
          user={user}
          location={location}
          onLocationChange={handleLocationChange}
          onShowEmergency={() => setShowEmergency(true)} 
          onViewImpact={() => setCurrentScreen(results ? Screen.RESULTS : Screen.CALCULATOR)} 
          onProfileClick={() => setCurrentScreen(Screen.PROFILE)}
          onAdminClick={() => setCurrentScreen(Screen.ADMIN)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onAddNotification={addNotification}
        />;
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8fafc] max-w-md mx-auto shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden font-sans selection:bg-primary/20 cursor-none">
      {/* Custom Cursor */}
      <motion.div 
        animate={{ x: mousePos.x - 8, y: mousePos.y - 8 }}
        transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
        className="fixed top-0 left-0 w-4 h-4 bg-primary/40 rounded-full pointer-events-none z-[9999] backdrop-blur-sm border border-white/50"
      />
      <motion.div 
        animate={{ x: mousePos.x - 2, y: mousePos.y - 2 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.2 }}
        className="fixed top-0 left-0 w-1 h-1 bg-primary rounded-full pointer-events-none z-[9999]"
      />

      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 60, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-blue-400/5 rounded-full blur-3xl"
        />
      </div>

      <main className="flex-1 overflow-y-auto hide-scrollbar pb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen + (user.isLoggedIn ? 'auth' : 'unauth')}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {user.isLoggedIn && currentScreen !== Screen.RESULTS && !showEmergency && currentScreen !== Screen.PROFILE && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
        >
          <BottomNav 
            currentScreen={currentScreen} 
            onNavigate={setCurrentScreen} 
          />
        </motion.div>
      )}

      {user.isLoggedIn && <ChatBot />}

      {showEmergency && (
        <EmergencyOverlay 
          aqi={location.aqi} 
          locationName={location.name} 
          onClose={() => setShowEmergency(false)} 
        />
      )}

      <NotificationSystem 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </div>
  );
};

export default App;
