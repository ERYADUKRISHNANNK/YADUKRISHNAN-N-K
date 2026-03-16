
import { useState, useEffect } from 'react';

export function useOfflineCache<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(() => {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : initialData;
  });

  const updateCache = (newData: T) => {
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setData(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [data, updateCache] as const;
}
