
import React, { useState, useEffect } from 'react';
import { User, PollutionReport, AppNotification, Comment } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, MapPin, Camera, Send, AlertTriangle, User as UserIcon, X, Image as ImageIcon } from 'lucide-react';

interface CommunityScreenProps {
  user: User;
  onAddNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ user, onAddNotification }) => {
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [newReportText, setNewReportText] = useState('');
  const [newReportImage, setNewReportImage] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'pollutionReports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PollutionReport[];
      setReports(reportsData);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (reportId: string) => {
    try {
      const reportRef = doc(db, 'pollutionReports', reportId);
      await updateDoc(reportRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (reportId: string) => {
    if (!commentText.trim()) return;

    try {
      const reportRef = doc(db, 'pollutionReports', reportId);
      const newComment: Comment = {
        id: Math.random().toString(36).substring(7),
        userId: auth.currentUser?.uid || 'anonymous',
        userName: user.name,
        text: commentText,
        timestamp: Date.now()
      };

      await updateDoc(reportRef, {
        comments: arrayUnion(newComment)
      });

      setCommentText('');
      setActiveCommentId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddReport = async () => {
    if (!newReportText.trim()) return;

    try {
      const newReport: Omit<PollutionReport, 'id'> = {
        userId: auth.currentUser?.uid || 'anonymous',
        userName: user.name,
        userAvatar: user.avatar,
        locationName: user.location || 'Unknown Location',
        lat: 0,
        lng: 0,
        description: newReportText,
        imageUrl: newReportImage || undefined,
        timestamp: Date.now(),
        likes: 0,
        comments: []
      };

      await addDoc(collection(db, 'pollutionReports'), newReport);
      
      setNewReportText('');
      setNewReportImage('');
      setIsReporting(false);
      onAddNotification({
        type: 'success',
        title: 'Report Published',
        message: 'Your pollution report has been shared with the community.'
      });
    } catch (error) {
      console.error(error);
    }
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
                  className="space-y-4 mt-4"
                >
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Paste image URL (optional)"
                      value={newReportImage}
                      onChange={(e) => setNewReportImage(e.target.value)}
                      className="bg-transparent text-xs font-medium text-slate-600 outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors">
                        <Camera className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors">
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsReporting(false)}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddReport}
                        disabled={!newReportText.trim()}
                        className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                      >
                        Post <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
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
                  <Heart className={`w-4 h-4 ${report.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="text-xs font-bold">{report.likes}</span>
                </button>
                <button 
                  onClick={() => setActiveCommentId(activeCommentId === report.id ? null : report.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold">{report.comments.length}</span>
                </button>
              </div>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {activeCommentId === report.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-slate-50 space-y-4"
                >
                  <div className="space-y-3">
                    {report.comments.map(comment => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-900">{comment.userName}</span>
                            <span className="text-[8px] text-slate-400">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      onClick={() => handleAddComment(report.id)}
                      className="p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityScreen;
