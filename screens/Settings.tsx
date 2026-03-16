
import React, { useState } from 'react';
import { NotificationSettings } from '../types';

interface SettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onBack }) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);

  const handleToggle = (key: keyof NotificationSettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
  };

  const handleQuietHoursToggle = () => {
    const updated = {
      ...localSettings,
      quietHours: { ...localSettings.quietHours, enabled: !localSettings.quietHours.enabled }
    };
    setLocalSettings(updated);
  };

  const handleQuietHoursTime = (key: 'from' | 'to', value: string) => {
    const updated = {
      ...localSettings,
      quietHours: { ...localSettings.quietHours, [key]: value }
    };
    setLocalSettings(updated);
  };

  const handleSoundChange = (value: string) => {
    const updated = { ...localSettings, alertSound: value as any };
    setLocalSettings(updated);
  };

  const handleSave = () => {
    onUpdate(localSettings);
    onBack();
  };

  return (
    <div className="min-h-screen bg-pale-blue-50 dark:bg-background-dark p-4 pt-8">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Notification Settings</h2>
      </header>

      <div className="flex flex-col gap-6">
        {/* Emergency Section */}
        <section>
          <h3 className="text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">emergency_home</span>
            Emergency Hazardous Alerts
          </h3>
          <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm border border-red-100 dark:border-red-900/30">
            <div className="flex items-center justify-between px-4 py-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="text-red-500 bg-red-500/10 size-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined fill-icon">campaign</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">System Notifications</p>
                  <p className="text-slate-500 text-[10px]">Critical safety overrides</p>
                </div>
              </div>
              <Toggle 
                checked={localSettings.emergencyAlerts} 
                onChange={() => handleToggle('emergencyAlerts')} 
              />
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="text-red-500 bg-red-500/10 size-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">volume_up</span>
                </div>
                <p className="text-sm font-semibold">Alert Sound</p>
              </div>
              <select 
                value={localSettings.alertSound}
                onChange={(e) => handleSoundChange(e.target.value)}
                className="bg-pale-blue-50 dark:bg-slate-900 border-none rounded-lg text-sm font-medium py-1 px-3"
              >
                <option value="Siren">Siren</option>
                <option value="Pulse">Pulse</option>
                <option value="Chime">Chime</option>
              </select>
            </div>
          </div>
          <p className="px-2 mt-2 text-[10px] text-slate-500 italic">Automatically receive high-priority alerts with sound when your location reaches hazardous AQI levels.</p>
        </section>

        {/* Standard Alerts Section */}
        <section>
          <h3 className="text-slate-500 dark:text-primary/80 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">Standard Alerts</h3>
          <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm border border-black/5">
            <SettingsRow 
              icon="aq" 
              label="AQI Changes" 
              subText="Alerts for category shifts" 
              checked={localSettings.aqiChanges}
              onChange={() => handleToggle('aqiChanges')}
            />
            <SettingsRow 
              icon="workspace_premium" 
              label="Carbon Milestones" 
              subText="Celebrate reduction goals" 
              checked={localSettings.carbonMilestones}
              onChange={() => handleToggle('carbonMilestones')}
              color="text-amber-500"
              bg="bg-amber-500/10"
            />
            <SettingsRow 
              icon="co2" 
              label="Weekly Footprint Reports" 
              subText="Summary of carbon trends" 
              checked={localSettings.weeklyReports}
              onChange={() => handleToggle('weeklyReports')}
            />
            <SettingsRow 
              icon="health_and_safety" 
              label="Health Tips" 
              subText="Daily advice based on air data" 
              color="text-green-500" 
              bg="bg-green-500/10" 
              checked={localSettings.healthTips}
              onChange={() => handleToggle('healthTips')}
            />
          </div>
        </section>

        {/* Quiet Hours Section */}
        <section>
          <h3 className="text-slate-500 dark:text-primary/80 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">Quiet Hours</h3>
          <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm border border-black/5">
            <div className="flex items-center justify-between px-4 py-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="text-indigo-500 bg-indigo-500/10 size-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">bedtime</span>
                </div>
                <p className="text-sm font-semibold">Do Not Disturb</p>
              </div>
              <Toggle 
                checked={localSettings.quietHours.enabled} 
                onChange={handleQuietHoursToggle} 
              />
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">From</span>
                <input 
                  type="time"
                  value={localSettings.quietHours.from}
                  onChange={(e) => handleQuietHoursTime('from', e.target.value)}
                  className="bg-pale-blue-50 dark:bg-slate-900 px-3 py-2 rounded-lg flex items-center gap-2 border border-black/5 text-sm font-bold"
                />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[10px] text-slate-500">To</span>
                <input 
                  type="time"
                  value={localSettings.quietHours.to}
                  onChange={(e) => handleQuietHoursTime('to', e.target.value)}
                  className="bg-pale-blue-50 dark:bg-slate-900 px-3 py-2 rounded-lg flex items-center gap-2 border border-black/5 text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Support & Contact Section */}
        <section>
          <h3 className="text-slate-500 dark:text-primary/80 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">Support & Contact</h3>
          <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm border border-black/5">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-black/5">
              <div className="text-blue-500 bg-blue-500/10 size-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Email Support</p>
                <a href="mailto:eryadukrishnannnk@gmail.com" className="text-primary text-[10px] font-bold">eryadukrishnannnk@gmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="text-green-500 bg-green-500/10 size-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Phone Support</p>
                <a href="tel:+919207736483" className="text-primary text-[10px] font-bold">+91 9207736483</a>
              </div>
            </div>
          </div>
          <p className="px-2 mt-2 text-[10px] text-slate-500 italic text-center">Contact the owner for advanced features and system inquiries.</p>
        </section>

        <button 
          onClick={handleSave}
          className="w-full py-4 mt-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ checked?: boolean, onChange?: () => void }> = ({ checked, onChange }) => (
  <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-gray-200 dark:bg-gray-700 p-0.5 transition-colors has-[:checked]:bg-primary">
    <input checked={checked} onChange={onChange} className="sr-only peer" type="checkbox" />
    <div className="h-[27px] w-[27px] rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-[20px]"></div>
  </label>
);

const SettingsRow: React.FC<{ 
  icon: string, 
  label: string, 
  subText?: string, 
  color?: string, 
  bg?: string, 
  checked?: boolean,
  onChange?: () => void
}> = ({ icon, label, subText, color = 'text-primary', bg = 'bg-primary/10', checked, onChange }) => (
  <div className="flex items-center justify-between px-4 py-4 border-b border-black/5 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`${color} ${bg} size-10 rounded-xl flex items-center justify-center`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p className="text-slate-500 text-[10px]">{subText}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default Settings;
