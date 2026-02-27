
import React, { useState } from 'react';
import { User, PollutionReport, AppNotification } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, MapPin, Camera, Send, AlertTriangle, User as UserIcon } from 'lucide-react';

interface CommunityScreenProps {
  user: User;
  onAddNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ user, onAddNotification }) => {
  const [reports, setReports] = useState<PollutionReport[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Chen',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
      locationName: 'Industrial Zone, East Side',
      lat: 37.78,
      lng: -122.40,
      description: 'Heavy black smoke coming from the factory chimneys this morning. The air smells like sulfur.',
      imageUrl: 'https://images.unsplash.com/photo-1521490683712-35a1cb235d1c?auto=format&fit=crop&q=80&w=800',
      timestamp: Date.now() - 3600000,
      likes: 24,
      comments: [
        { id: 'c1', userId: 'user2', userName: 'John D.', text: 'I noticed this too. It is getting worse every week.', timestamp: Date.now() - 1800000 }
      ]
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'Marcus Wu',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
      locationName: 'Downtown Intersection',
      lat: 37.77,
      lng: -122.42,
      description: 'Traffic congestion is causing visible smog today. Avoid walking through here if you have asthma.',
      timestamp: Date.now() - 7200000,
      likes: 12,
      comments: []
    }
  ]);

  const [newReportText, setNewReportText] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleLike = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, likes: r.likes + 1 } : r));
  };

  const handleAddReport = () => {
    if (!newReportText.trim()) return;

    const newReport: PollutionReport = {
      id: Math.random().toString(36).substring(7),
      userId: 'current-user',
      userName: user.name,
      userAvatar: user.avatar,
      locationName: 'Current Location',
      lat: 0,
      lng: 0,
      description: newReportText,
      timestamp: Date.now(),
      likes: 0,
      comments: []
    };

    setReports([newReport, ...reports]);
    setNewReportText('');
    setIsReporting(false);
    onAddNotification({
      type: 'success',
      title: 'Report Published',
      message: 'Your pollution report has been shared with the community.'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 leading-none">Community Hub</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Report & Share Pollution Data</p>
      </header>

      {/* Quick Report Box */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 mb-8"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
            <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <textarea 
              placeholder="What's the air like in your area?"
              value={newReportText}
              onChange={(e) => setNewReportText(e.target.value)}
              onFocus={() => setIsReporting(true)}
              className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
            />
            <AnimatePresence>
              {isReporting && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center justify-between mt-4"
                >
                  <div className="flex gap-2">
                    <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={handleAddReport}
                    disabled={!newReportText.trim()}
                    className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                  >
                    Post <Send className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Feed */}
      <div className="space-y-6">
        {reports.map((report, idx) => (
          <motion.div 
            key={report.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100">
                  <img src={report.userAvatar} alt={report.userName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{report.userName}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Pollution Alert</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-primary">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">{report.locationName}</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {report.description}
            </p>

            {report.imageUrl && (
              <div className="rounded-3xl overflow-hidden mb-4 border border-slate-100">
                <img src={report.imageUrl} alt="Pollution" className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleLike(report.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${report.likes > 24 ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="text-xs font-bold">{report.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold">{report.comments.length}</span>
                </button>
              </div>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityScreen;
