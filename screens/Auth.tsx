
import React, { useState, useEffect, useRef } from 'react';
import { User, HealthDetails, Screen } from '../types';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Shield, Mail, Lock, User as UserIcon, ArrowLeft, Camera, CheckCircle2, MapPin, Navigation, Book, Gamepad2, Volume2, VolumeX } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigateToStudy?: () => void;
  onNavigateToGame?: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'ADMIN_PORTAL';

const Auth: React.FC<AuthProps> = ({ onLogin, onNavigateToStudy, onNavigateToGame }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [step, setStep] = useState(1);
  const [pollutionLevel, setPollutionLevel] = useState(0.3);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loginError, setLoginError] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150');
  
  // Health States
  const [hasAsthma, setHasAsthma] = useState(false);
  const [respiratoryConditions, setRespiratoryConditions] = useState<string[]>([]);
  const [pollutionSensitivity, setPollutionSensitivity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ageGroup, setAgeGroup] = useState('Adult (18-64)');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize ambient audio
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Industrial hum placeholder
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    
    try {
      // Check for specific admin credentials if in admin portal
      if (view === 'ADMIN_PORTAL') {
        if (email === 'eryadukrishnannnk@gmail.com' && password === 'yadu9645@') {
          // Proceed with standard login but we know it's the admin
        } else {
          alert('Invalid Admin Credentials');
          return;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsSuccess(true);
      setPollutionLevel(0);
      
      const successAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      successAudio.play().catch(() => {});

      // App.tsx onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error(error);
      setLoginError(true);
      setPollutionLevel(prev => Math.min(1, prev + 0.2));
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsSuccess(true);
      setPollutionLevel(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: avatar
      });

      const newUser: User = {
        uid: firebaseUser.uid,
        name,
        email,
        avatar,
        isLoggedIn: true,
        location,
        healthDetails: {
          hasAsthma,
          respiratoryConditions,
          pollutionSensitivity,
          ageGroup
        },
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

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      // App.tsx onAuthStateChanged will handle the rest
    } catch (error) {
      console.error(error);
    }
  };

  const renderLogin = () => (
    <motion.div 
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="flex flex-col p-6 h-full justify-center relative z-10"
    >
      <div className="mb-10 text-center">
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
            boxShadow: isSuccess ? "0 0 50px rgba(74, 222, 128, 0.5)" : "0 0 30px rgba(59, 130, 246, 0.2)"
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl shadow-2xl mb-6 border border-white/20 transition-colors duration-1000 ${isSuccess ? 'bg-emerald-500/20' : ''}`}
        >
          <ShieldCheck className={`w-12 h-12 ${isSuccess ? 'text-emerald-400' : 'text-primary'}`} />
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">AirGuard</h1>
        <p className="text-white/60 font-black uppercase tracking-[0.4em] text-[10px]">Protecting your breath</p>
      </div>

      <div className={`bg-white/10 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/20 shadow-2xl transition-all duration-500 ${loginError ? 'ring-4 ring-rose-500/50 scale-105' : ''}`}>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-white placeholder:text-white/30"
              placeholder="Email Address"
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-white placeholder:text-white/30"
              placeholder="Password"
            />
          </div>
          <div className="text-right">
            <button 
              type="button"
              onClick={() => setView('FORGOT_PASSWORD')}
              className="text-[10px] font-black text-white/60 uppercase tracking-widest hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <button 
            type="submit"
            disabled={isSuccess}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all mt-6 flex items-center justify-center gap-2 ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Authorized
              </>
            ) : 'Sign In'}
          </button>

          <button 
            type="button"
            onClick={() => {
              setEmail('eryadukrishnannk@gmail.com');
              setPassword('yadu9645@');
            }}
            className="w-full py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all mt-2"
          >
            Fill Admin Credentials
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="px-4 bg-transparent text-white/40 font-black">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Google Account
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={onNavigateToStudy}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all group"
            title="Study Environment"
          >
            <Book className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={onNavigateToGame}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all group"
            title="Eco Game"
          >
            <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all group"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="mt-12 text-center flex flex-col gap-4">
        <p className="text-white/40 text-xs font-bold">
          New to AirGuard? {' '}
          <button 
            onClick={() => { setView('REGISTER'); setStep(1); }}
            className="text-primary font-black uppercase tracking-widest ml-2 hover:underline"
          >
            Create Account
          </button>
        </p>
        <button 
          onClick={() => setView('ADMIN_PORTAL')}
          className="text-white/20 hover:text-white/40 text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
        >
          Admin Portal
        </button>
      </div>
    </motion.div>
  );

  const renderRegister = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col p-6 h-full relative z-10"
    >
      <div className="flex items-center mb-10">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : setView('LOGIN')}
          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-4">
          <h2 className="text-2xl font-black text-slate-900 leading-none">Create Account</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Step {step} of 3</p>
        </div>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (step < 3) setStep(step + 1);
        else handleRegister(e);
      }} className="flex-1 flex flex-col">
        
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatar(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Profile Photo</p>
            </div>

            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-700"
                placeholder="Full Name"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-700"
                placeholder="Email Address"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-700"
                placeholder="Password"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-2">Health Profile</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Personalized Safety Alerts</p>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                <div>
                  <p className="font-black text-slate-800 text-sm">Asthma Condition</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sensitivity alerts</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setHasAsthma(!hasAsthma)}
                  className={`w-14 h-7 rounded-full transition-colors relative ${hasAsthma ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ x: hasAsthma ? 28 : 4 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Pollution Sensitivity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPollutionSensitivity(level)}
                      className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        pollutionSensitivity === level 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-slate-50 border border-slate-100 text-slate-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Respiratory Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {['COPD', 'Bronchitis', 'Sinusitis'].map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => {
                        if (respiratoryConditions.includes(condition)) {
                          setRespiratoryConditions(respiratoryConditions.filter(c => c !== condition));
                        } else {
                          setRespiratoryConditions([...respiratoryConditions, condition]);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        respiratoryConditions.includes(condition)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-slate-50 border border-slate-100 text-slate-400'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-2">Primary Location</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Default Monitoring Area</p>
              
              <div className="relative group flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  className="p-4 bg-primary text-white rounded-2xl shadow-lg hover:bg-primary/90 transition-colors"
                  title="Use Live Location"
                >
                  <Navigation className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">Ready to Protect</h4>
                  <p className="text-[10px] text-emerald-700 leading-relaxed font-bold uppercase tracking-tighter">
                    Your profile is complete. We'll monitor local air quality and notify you of any risks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
          <button 
            type="submit"
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {step === 3 ? 'Finish Setup' : 'Next Step'}
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderForgotPassword = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col p-6 h-full justify-center relative z-10"
    >
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white shadow-2xl mb-6 border border-slate-50">
          <Lock className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Reset Password</h1>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Enter your email to continue</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setView('LOGIN'); }} className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="email" 
            required
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-700"
            placeholder="Email Address"
          />
        </div>
        <button 
          type="submit"
          className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
        >
          Send Reset Link
        </button>
      </form>

      <div className="mt-12 text-center">
        <button 
          onClick={() => setView('LOGIN')}
          className="text-primary font-black uppercase tracking-widest text-xs"
        >
          Back to Login
        </button>
      </div>
    </motion.div>
  );

  const renderAdminPortal = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col p-6 h-full justify-center relative z-10"
    >
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-primary/20 backdrop-blur-2xl shadow-2xl mb-6 border border-primary/30">
          <Shield className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Admin Portal</h1>
        <p className="text-primary/60 font-black uppercase tracking-[0.4em] text-[10px]">Restricted Access Only</p>
      </div>

      <div className="bg-white/10 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/20 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-white placeholder:text-white/30"
              placeholder="Admin Email"
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-white placeholder:text-white/30"
              placeholder="Admin Password"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
          >
            Authenticate Admin
          </button>
          <button 
            type="button"
            onClick={() => setView('LOGIN')}
            className="w-full py-4 text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
          >
            Return to User Login
          </button>
        </form>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full bg-slate-950 relative overflow-hidden">
      <ThreeBackground pollutionLevel={pollutionLevel} isSuccess={isSuccess} />

      {/* Real-time AQI Meter */}
      <div className="absolute top-6 right-6 z-20">
        <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-3">
          <div className={`size-2 rounded-full animate-pulse ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Global AQI: {Math.floor(pollutionLevel * 500)}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'LOGIN' && <div key="login" className="h-full">{renderLogin()}</div>}
        {view === 'REGISTER' && <div key="register" className="h-full">{renderRegister()}</div>}
        {view === 'FORGOT_PASSWORD' && <div key="forgot" className="h-full">{renderForgotPassword()}</div>}
        {view === 'ADMIN_PORTAL' && <div key="admin" className="h-full">{renderAdminPortal()}</div>}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
