
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Factory, Cloud, Trash2, Trophy, RefreshCw, ChevronLeft } from 'lucide-react';

const GameScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [pollution, setPollution] = useState(50);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [objects, setObjects] = useState<{ id: number, type: 'SMOKE' | 'TREE', x: number, y: number }[]>([]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      const type: 'SMOKE' | 'TREE' = Math.random() > 0.7 ? 'TREE' : 'SMOKE';
      const newObj = {
        id: Date.now(),
        type,
        x: Math.random() * 80 + 10,
        y: -10
      };
      setObjects(prev => [...prev, newObj]);
      
      if (type === 'SMOKE') {
        setPollution(p => Math.min(100, p + 2));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const moveInterval = setInterval(() => {
      setObjects(prev => prev.map(obj => ({ ...obj, y: obj.y + 2 })).filter(obj => obj.y < 110));
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameState]);

  useEffect(() => {
    if (pollution >= 100) setGameState('GAMEOVER');
  }, [pollution]);

  const handleObjectClick = (id: number, type: 'SMOKE' | 'TREE') => {
    if (type === 'SMOKE') {
      setScore(s => s + 10);
      setPollution(p => Math.max(0, p - 5));
    } else {
      setScore(s => Math.max(0, s - 20));
      setPollution(p => Math.min(100, p + 10));
    }
    setObjects(prev => prev.filter(obj => obj.id !== id));
  };

  const startGame = () => {
    setScore(0);
    setPollution(50);
    setObjects([]);
    setGameState('PLAYING');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 overflow-hidden relative">
      <header className="flex items-center justify-between mb-8 relative z-10">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-tighter">Eco Defender</h1>
          <p className="text-[8px] font-black text-primary uppercase tracking-widest">Clean the Atmosphere</p>
        </div>
        <div className="w-10" />
      </header>

      {gameState === 'START' && (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8"
          >
            <Wind className="w-24 h-24 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-black mb-4">Save the Sky!</h2>
          <p className="text-sm text-white/60 mb-8 max-w-xs">
            Tap the smoke clouds to clean the air. Don't tap the trees! If pollution reaches 100%, the game is over.
          </p>
          <button 
            onClick={startGame}
            className="bg-primary text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/40 active:scale-95 transition-all"
          >
            Start Mission
          </button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Score</span>
              <span className="text-2xl font-black text-primary">{score}</span>
            </div>
            <div className="flex flex-col items-end flex-1 ml-8">
              <div className="flex justify-between w-full mb-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pollution</span>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{pollution}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: `${pollution}%` }}
                  className={`h-full ${pollution > 80 ? 'bg-rose-500' : pollution > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
              </div>
            </div>
          </div>

          <div className="relative h-[60vh] w-full">
            <AnimatePresence>
              {objects.map(obj => (
                <motion.button
                  key={obj.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleObjectClick(obj.id, obj.type)}
                  className="absolute p-4 rounded-full backdrop-blur-md"
                  style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
                >
                  {obj.type === 'SMOKE' ? (
                    <div className="relative">
                      <Cloud className="w-12 h-12 text-slate-400" />
                      <Factory className="w-6 h-6 text-slate-600 absolute -bottom-2 -right-2" />
                    </div>
                  ) : (
                    <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin-slow" />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <Trophy className="w-20 h-20 text-amber-500 mb-6" />
          <h2 className="text-3xl font-black mb-2">Mission Over</h2>
          <p className="text-xl font-bold text-primary mb-8">Final Score: {score}</p>
          <button 
            onClick={startGame}
            className="bg-white text-slate-900 px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
