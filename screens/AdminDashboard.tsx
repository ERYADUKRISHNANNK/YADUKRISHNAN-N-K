
import React, { useState, useEffect } from 'react';
import { User, Screen } from '../types';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Shield, 
  Trash2, 
  UserPlus, 
  ArrowLeft, 
  Search, 
  Filter, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Megaphone,
  BarChart3,
  Activity as ActivityIcon,
  Send,
  Bell
} from 'lucide-react';
import { addDoc, serverTimestamp } from 'firebase/firestore';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'broadcast' | 'system'>('users');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'adminBroadcasts'), {
        title: broadcastTitle,
        message: broadcastMessage,
        target: 'all',
        timestamp: Date.now(),
        sentBy: auth.currentUser?.email || 'Admin'
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      alert('Broadcast sent successfully!');
    } catch (error) {
      console.error("Error sending broadcast:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => doc.data() as User);
      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleRole = async (user: User) => {
    if (!user.uid) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!user.uid) return;
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      // Note: This only deletes the Firestore doc, not the Auth user.
      // In a real app, you'd use a Cloud Function to delete the Auth user too.
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Control</h1>
        </div>
        <div className="size-10" />
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {(['users', 'broadcast', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</p>
                <p className="text-2xl font-black text-slate-900">{users.length}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admins</p>
                <p className="text-2xl font-black text-primary">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</p>
                <p className="text-2xl font-black text-emerald-500">{users.filter(u => u.isLoggedIn).length}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Users...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <div key={user.uid} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} alt={user.name} className="size-12 rounded-2xl object-cover border border-slate-100" />
                        <div>
                          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                            {user.name}
                            {user.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleRole(user)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            user.role === 'admin' 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400">No users found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Push Notification</h2>
                  <p className="text-xs font-bold text-slate-400">Send a system-wide broadcast to all users</p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Title</label>
                  <input 
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., High Pollution Alert"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Message</label>
                  <textarea 
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Describe the alert or announcement..."
                    rows={4}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSending || !broadcastTitle || !broadcastMessage}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-4">Recent Broadcasts</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">System Update</span>
                    <span className="text-[9px] font-bold text-slate-400">2 hours ago</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">New features added to the community map!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                  <p className="text-lg font-black text-emerald-500">All Systems Go</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version</p>
                  <p className="text-lg font-black text-slate-900">v2.4.0-pro</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Security & Maintenance
              </h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Database Backup</span>
                  </div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Run Now</span>
                </button>
                <button className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Audit Logs</span>
                  </div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">View</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-sm font-black mb-4">Owner Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Primary Email</p>
                    <p className="text-xs font-bold">eryadukrishnannnk@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Emergency Contact</p>
                    <p className="text-xs font-bold">+919207736483</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
