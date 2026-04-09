'use client';
import { useState, useEffect } from 'react';

export function useOffline() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const off = () => setOffline(true);
    const on  = () => setOffline(false);
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => { window.removeEventListener('offline', off); window.removeEventListener('online', on); };
  }, []);
  return offline;
}
