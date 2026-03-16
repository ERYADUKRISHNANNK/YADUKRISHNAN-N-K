
import React from 'react';
import { motion } from 'motion/react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-pale-blue-100 px-4 pt-3 pb-8 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[60]">
      <NavButton 
        icon="home" 
        label="HOME" 
        isActive={currentScreen === Screen.DASHBOARD} 
        onClick={() => onNavigate(Screen.DASHBOARD)} 
      />
      <NavButton 
        icon="map" 
        label="MAP" 
        isActive={currentScreen === Screen.MAP} 
        onClick={() => onNavigate(Screen.MAP)} 
      />
      <NavButton 
        icon="analytics" 
        label="STATS" 
        isActive={currentScreen === Screen.CALCULATOR} 
        onClick={() => onNavigate(Screen.CALCULATOR)} 
      />
      <NavButton 
        icon="book" 
        label="STUDY" 
        isActive={currentScreen === Screen.STUDY} 
        onClick={() => onNavigate(Screen.STUDY)} 
      />
      <NavButton 
        icon="sports_esports" 
        label="GAME" 
        isActive={currentScreen === Screen.GAME} 
        onClick={() => onNavigate(Screen.GAME)} 
      />
      <NavButton 
        icon="groups" 
        label="COMMUNITY" 
        isActive={currentScreen === Screen.COMMUNITY} 
        onClick={() => onNavigate(Screen.COMMUNITY)} 
      />
      <NavButton 
        icon="settings" 
        label="SETTINGS" 
        isActive={currentScreen === Screen.SETTINGS} 
        onClick={() => onNavigate(Screen.SETTINGS)} 
      />
    </nav>
  );
};

const NavButton: React.FC<{ icon: string, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all relative px-2 py-1 rounded-xl ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {isActive && (
      <motion.div 
        layoutId="activeTab"
        className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className={`material-symbols-outlined ${isActive ? 'fill-icon scale-110' : 'scale-100'} transition-transform`}>{icon}</span>
    <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    {isActive && (
      <motion.div 
        layoutId="activeUnderline"
        className="absolute -bottom-1 w-4 h-0.5 bg-primary rounded-full"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
);

export default BottomNav;
