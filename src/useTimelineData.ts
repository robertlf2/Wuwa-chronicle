import { useState, useEffect } from 'react';
import { TimelineData } from './types';
import { fetchTimelineData, saveTimelineData } from './firebase';

const defaultFallbackData: TimelineData = {
  timelineBackground: "#1e1e2f",
  events: [
    {
      id: "1",
      title: "創世之初",
      date: "1000-01-01",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop",
      content: "<p>宇宙誕生之初，星辰指引著最初的生命。</p><p>在虛無之中，巨大的古神降臨，創造了這片大陸。</p>",
      referenceImages: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484504110495-939e9baca603?w=800&auto=format&fit=crop"
      ],
      backgroundColor: "#2a2a40",
      category: "神話時代"
    },
    {
      id: "2",
      title: "第一帝國的崛起",
      date: "1500-05-12",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop",
      content: "<p>人類開始聚集，由偉大的王帶領，建立了輝煌的第一帝國。</p>",
      referenceImages: [],
      backgroundColor: "#ffffff",
      category: "人類歷史"
    },
    {
      id: "3",
      title: "英雄的誕生與墮落",
      date: "1994-01-01",
      mediaType: "youtube",
      mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: "<p>傳說中的勇者誕生，但最終卻被黑暗力量侵蝕...</p>",
      referenceImages: [
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&auto=format&fit=crop"
      ],
      backgroundColor: "#fef3c7",
      category: "主線任務"
    }
  ]
};

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

