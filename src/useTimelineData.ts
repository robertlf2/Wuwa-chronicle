import { useState, useEffect } from 'react';
import { TimelineData } from './types';
import { fetchTimelineData, saveTimelineData } from './firebase';
import initialData from '../data.json';

// Use statically imported user-customized data as the base fallback
const defaultFallbackData: TimelineData = initialData as TimelineData;

export function useTimelineData() {
  const [data, setData] = useState<TimelineData>(() => {
    // Synchronously check localStorage first for immediate render
    try {
      const saved = localStorage.getItem('wuwa-chronicle-data');
      if (saved) {
        return JSON.parse(saved) as TimelineData;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data', e);
    }
    return defaultFallbackData;
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // First try Firebase Firestore
      const fbData = await fetchTimelineData();
      if (fbData && fbData.events && fbData.events.length > 0) {
        setData(fbData);
        try {
          localStorage.setItem('wuwa-chronicle-data', JSON.stringify(fbData));
        } catch (storageErr) {
          console.warn('Failed to cache Firebase data in localStorage', storageErr);
        }
      } else {
        // If Firebase is empty/unconfigured, load from localStorage or server fallback
        try {
          const res = await fetch('./api/timeline');
          if (res.ok) {
            const json = await res.json();
            setData(json);
            localStorage.setItem('wuwa-chronicle-data', JSON.stringify(json));
          } else {
            // If API route failed (as on GitHub Pages static sites), we keep localStorage or defaultFallbackData
            const saved = localStorage.getItem('wuwa-chronicle-data');
            if (saved) {
              setData(JSON.parse(saved));
            } else {
              setData(defaultFallbackData);
            }
          }
        } catch (fetchErr) {
          // Normal case for static sites
          const saved = localStorage.getItem('wuwa-chronicle-data');
          if (saved) {
            setData(JSON.parse(saved));
          } else {
            setData(defaultFallbackData);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load timeline data', e);
      const saved = localStorage.getItem('wuwa-chronicle-data');
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(defaultFallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (newData: TimelineData) => {
    setData(newData);
    // Write locally to localStorage first so it works immediately (for offline/static hosting)
    try {
      localStorage.setItem('wuwa-chronicle-data', JSON.stringify(newData));
    } catch (storageErr) {
      console.warn('Failed to write to localStorage', storageErr);
    }

    // Try to sync with Firebase
    try {
      await saveTimelineData(newData);
    } catch (e) {
      console.error('Failed to save timeline data to Firebase, using local fallback state', e);
      // Don't alert if we wanted offline-friendly, but since there is an admin panel:
      console.info('Saved locally instead.');
    }
  };

  return { data, loading, saveData };
}

