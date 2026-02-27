import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';

interface NotificationSystemProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-80 pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onDismiss={() => onDismiss(notification.id)} 
        />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: AppNotification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  };

  const getColorClass = () => {
    switch (notification.type) {
      case 'warning': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'error': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'success': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-blue-500 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div 
      className={`pointer-events-auto w-full p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-500 flex gap-3
        ${isExiting ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}
        ${getColorClass()}`}
    >
      <div className="flex-shrink-0">
        <span className="material-symbols-outlined">{getIcon()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black uppercase tracking-tight leading-none mb-1">{notification.title}</h4>
        <p className="text-xs font-medium text-slate-600 leading-tight">{notification.message}</p>
      </div>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 500);
        }}
        className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

export default NotificationSystem;
