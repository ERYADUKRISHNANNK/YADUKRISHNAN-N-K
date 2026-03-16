
import React, { useState, useEffect } from 'react';
import { User, AppNotification } from '../types';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Camera, MapPin, User as UserIcon, Save, ArrowLeft, Settings, Mail, Shield, RefreshCw, LogOut, Verified, AlertCircle, Plus, Trash2, Bell } from 'lucide-react';
import { PreferredLocation } from '../types';

interface ProfileProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onAddNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onBack, onLogout, onAddNotification }) => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [preferredLocations, setPreferredLocations] = useState<PreferredLocation[]>(user.preferredLocations || []);
  const [newLocName, setNewLocName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = () => {
    setHasApiKey(!!process.env.API_KEY);
  };

  const handleManageAccount = () => {
    onAddNotification({
      type: 'info',
      title: 'Account Settings',
      message: 'Redirecting to secure account management portal...'
    });
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name,
        bio,
        location,
        avatar,
        preferredLocations
      });
      setIsEditing(false);
      onAddNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile changes have been saved successfully.'
      });
    } catch (error) {
      console.error(error);
      onAddNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not save profile changes. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLocation = () => {
    if (!newLocName) return;
    const newLoc: PreferredLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLocName,
      lat: 0, // Mock lat/lng for now or use geocoding
      lng: 0,
      alertThreshold: 50
    };
    setPreferredLocations([...preferredLocations, newLoc]);
    setNewLocName('');
  };

  const handleRemoveLocation = (id: string) => {
    setPreferredLocations(preferredLocations.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Google Bar */}
      <header className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-400">AirGuard</span>
          <span className="font-black text-slate-800 tracking-tight">Profile</span>
        </div>
        <button 
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          disabled={isSaving}
          className={`size-10 flex items-center justify-center rounded-full transition-colors ${isEditing ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-800'}`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isEditing ? (
            <Save className="w-5 h-5" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${hasApiKey ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                {hasApiKey ? <Verified className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span className="text-[9px] font-black uppercase tracking-tighter">{hasApiKey ? 'Key Linked' : 'Set API Key'}</span>
             </div>
          </div>

            <div className="relative mb-6">
              <img 
                src={avatar} 
                alt={name} 
                className="size-24 rounded-full border-4 border-white shadow-xl object-cover"
              />
              {isEditing && (
                <>
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
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 size-8 bg-primary rounded-full border-4 border-white flex items-center justify-center"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
            </div>

          {isEditing ? (
            <div className="w-full space-y-4">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-primary/20"
              />
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Add a short bio..."
                className="w-full bg-slate-50 rounded-xl px-4 py-2 text-xs font-medium text-center outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20"
              />
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location Preference"
                  className="bg-transparent text-xs font-medium outline-none flex-1"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
              <p className="text-slate-400 text-sm font-medium mb-2">{user.email}</p>
              {user.bio && <p className="text-xs text-slate-500 text-center mb-4 max-w-xs">{user.bio}</p>}
              {user.location && (
                <div className="flex items-center gap-1.5 text-primary mb-6">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{user.location}</span>
                </div>
              )}
            </>
          )}
          
          <button 
            onClick={handleManageAccount}
            className="w-full max-w-[240px] px-6 py-3 rounded-full border-2 border-slate-100 text-slate-700 text-xs font-black hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 mt-4"
          >
            <Settings className="w-4 h-4" />
            Manage Account & Keys
          </button>
        </div>

        {/* Preferred Locations */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alert Locations</h3>
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex gap-2">
              <input 
                type="text"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="Add city for alerts..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button 
                onClick={handleAddLocation}
                className="size-10 bg-primary text-white rounded-xl flex items-center justify-center active:scale-90 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {preferredLocations.map(loc => (
                <div key={loc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{loc.name}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveLocation(loc.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {preferredLocations.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-2 italic">No alert locations set</p>
              )}
            </div>
          </div>
        </section>

        {/* Direct Gmail Context */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gmail Integration</h3>
            <AlertCircle className="w-4 h-4 text-slate-300" />
          </div>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="p-5 flex items-center gap-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="size-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Weekly Summary Sent</p>
                <p className="text-[10px] text-slate-400">Sent to {user.email}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-300">2h ago</span>
            </div>
          </div>
        </section>

        {/* Security & Activity */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Privacy & Security</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-emerald-200 transition-all cursor-pointer">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Safety Check</p>
                <p className="text-[9px] text-slate-400 leading-tight mt-1">Grounded data protection active</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-blue-200 transition-all cursor-pointer">
              <div className="size-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Data Sync</p>
                <p className="text-[9px] text-slate-400 leading-tight mt-1">Cross-device air guard enabled</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="p-6 sticky bottom-0 bg-slate-50">
        <button 
          onClick={onLogout}
          className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign out of Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
