import React, { useState, useEffect } from 'react';
import { User, Screen, AdminBroadcast, AISettings } from '../types';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Shield, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Filter, 
  Settings, 
  AlertTriangle,
  Megaphone,
  BarChart3,
  Activity as ActivityIcon,
  Send,
  Bell,
  LayoutDashboard,
  UserCheck,
  UserX,
  Ban,
  Cpu,
  Globe,
  MoreVertical,
  Plus,
  UserPlus,
  Save
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'notifications' | 'ai' | 'system'>('overview');
  const [isSending, setIsSending] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' as const });
  
  // Broadcast State
  const [broadcast, setBroadcast] = useState<Partial<AdminBroadcast>>({
    title: '',
    message: '',
    target: 'all'
  });

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>({
    modelName: 'gemini-3.1-pro-preview',
    temperature: 0.7,
    maxTokens: 2048,
    systemInstruction: 'You are an environmental health expert.',
    enableGrounding: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      setUsers(usersList);
      setLoading(false);
    });

    // Fetch AI Settings
    const fetchAISettings = async () => {
      const settingsDoc = await getDoc(doc(db, 'system', 'aiSettings'));
      if (settingsDoc.exists()) {
        setAiSettings(settingsDoc.data() as AISettings);
      }
    };
    fetchAISettings();

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = async (uid: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'adminBroadcasts'), {
        ...broadcast,
        timestamp: Date.now(),
        sentBy: auth.currentUser?.email || 'Admin'
      });
      setBroadcast({ title: '', message: '', target: 'all' });
      alert('Broadcast sent successfully!');
    } catch (error) {
      console.error("Error sending broadcast:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveAISettings = async () => {
    try {
      await setDoc(doc(db, 'system', 'aiSettings'), aiSettings);
      alert('AI Settings updated!');
    } catch (error) {
      console.error("Error saving AI settings:", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`,
        createdAt: Date.now(),
        notificationSettings: {
          emergencyAlerts: true,
          aqiChanges: true,
          carbonMilestones: true,
          weeklyReports: true,
          healthTips: true,
          quietHours: { enabled: true, from: '22:00', to: '07:00' },
          alertSound: 'Chime'
        }
      });
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'user' });
      alert('User added successfully to database');
    } catch (error) {
      console.error(error);
      alert('Error adding user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Alerts', value: 12, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'System Health', value: '98%', icon: ActivityIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'AI Requests', value: '1.2k', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const chartData = [
    { name: 'Mon', users: 400, alerts: 24 },
    { name: 'Tue', users: 450, alerts: 18 },
    { name: 'Wed', users: 600, alerts: 35 },
    { name: 'Thu', users: 550, alerts: 22 },
    { name: 'Fri', users: 700, alerts: 40 },
    { name: 'Sat', users: 850, alerts: 15 },
    { name: 'Sun', users: 900, alerts: 10 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight">AirGuard <span className="text-primary">Pro</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'notifications', label: 'Notifications', icon: Megaphone },
            { id: 'ai', label: 'AI Prediction', icon: Cpu },
            { id: 'system', label: 'System Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit Panel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-slate-200" />
            <p className="text-xs font-bold text-slate-400">Admin: {auth.currentUser?.email}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            <button className="size-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                  >
                    <div className={`size-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-black mb-6">User Growth</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-black mb-6">Alert Frequency</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="alerts" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20 w-80"
                    />
                  </div>
                  <button className="px-4 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 font-bold text-sm text-slate-600 hover:bg-slate-50">
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="px-6 py-3 bg-primary text-white rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <img src={user.avatar} className="size-10 rounded-xl object-cover" alt="" />
                            <div>
                              <p className="font-black text-slate-900">{user.name}</p>
                              <p className="text-xs font-bold text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'admin' ? 'bg-primary/10 text-primary' : 
                            user.role === 'co-admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`flex items-center gap-2 text-xs font-bold ${
                            user.status === 'suspended' ? 'text-amber-500' : 
                            user.status === 'banned' ? 'text-rose-500' : 'text-emerald-500'
                          }`}>
                            <div className={`size-2 rounded-full ${
                              user.status === 'suspended' ? 'bg-amber-500' : 
                              user.status === 'banned' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`} />
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateUser(user.uid!, { status: user.status === 'suspended' ? 'active' : 'suspended' })}
                              className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                              title="Suspend/Unsuspend"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateUser(user.uid!, { status: user.status === 'banned' ? 'active' : 'banned' })}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Ban/Unban"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateUser(user.uid!, { role: user.role === 'co-admin' ? 'user' : 'co-admin' })}
                              className="p-2 text-slate-400 hover:text-purple-500 transition-colors"
                              title="Toggle Co-Admin"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Megaphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Broadcast Center</h2>
                    <p className="text-sm font-bold text-slate-400">Send system-wide or targeted alerts</p>
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Audience</label>
                      <select 
                        value={broadcast.target}
                        onChange={(e) => setBroadcast({ ...broadcast, target: e.target.value as any })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">All Users</option>
                        <option value="high-pollution-areas">High Pollution Areas</option>
                        <option value="sensitive-groups">Sensitive Health Groups</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alert Priority</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20">
                        <option>Normal</option>
                        <option>High (Push)</option>
                        <option>Emergency (Siren)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Broadcast Title</label>
                    <input 
                      type="text"
                      value={broadcast.title}
                      onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                      placeholder="e.g., Air Quality Warning: Downtown"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Message Content</label>
                    <textarea 
                      value={broadcast.message}
                      onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                      placeholder="Enter the detailed notification message..."
                      rows={5}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSending}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isSending ? 'Transmitting...' : (
                      <>
                        <Send className="w-5 h-5" />
                        Dispatch Broadcast
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">AI Model Configuration</h2>
                    <p className="text-sm font-bold text-slate-400">Control prediction engine parameters</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Active Model</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['gemini-3.1-pro-preview', 'gemini-3-flash-preview'].map(m => (
                        <button 
                          key={m}
                          onClick={() => setAiSettings({ ...aiSettings, modelName: m })}
                          className={`p-4 rounded-2xl border font-bold text-sm transition-all text-left ${
                            aiSettings.modelName === m ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Temperature ({aiSettings.temperature})</label>
                      <span className="text-xs font-bold text-slate-400">Creative vs Precise</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">System Instruction</label>
                    <textarea 
                      value={aiSettings.systemInstruction}
                      onChange={(e) => setAiSettings({ ...aiSettings, systemInstruction: e.target.value })}
                      rows={4}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div>
                      <p className="font-black text-slate-900">Enable Search Grounding</p>
                      <p className="text-xs font-bold text-slate-400">Allow AI to access real-time web data</p>
                    </div>
                    <button 
                      onClick={() => setAiSettings({ ...aiSettings, enableGrounding: !aiSettings.enableGrounding })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${aiSettings.enableGrounding ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: aiSettings.enableGrounding ? 28 : 4 }}
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>

                  <button 
                    onClick={handleSaveAISettings}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                  >
                    <Save className="w-5 h-5" />
                    Save AI Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black mb-8">System Health & Security</h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Database Status', status: 'Operational', icon: Globe, color: 'text-emerald-500' },
                    { label: 'Auth Service', status: 'Operational', icon: Shield, color: 'text-emerald-500' },
                    { label: 'API Gateway', status: 'Operational', icon: ActivityIcon, color: 'text-emerald-500' },
                    { label: 'Storage Bucket', status: '92% Full', icon: BarChart3, color: 'text-amber-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                  <h4 className="text-rose-900 font-black text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                  </h4>
                  <p className="text-xs font-bold text-rose-700 mb-6">These actions are destructive and cannot be undone.</p>
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all">
                      Clear System Cache
                    </button>
                    <button className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                      Reset Database
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUserModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Add New User</h3>
                  <p className="text-sm font-bold text-slate-400">Create a new system account</p>
                </div>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Initial Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="user">Standard User</option>
                    <option value="co-admin">Co-Admin Partner</option>
                    <option value="admin">Full Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
