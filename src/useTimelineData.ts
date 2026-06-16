import { useState, useEffect } from 'react';
import { TimelineData } from './types';
import { fetchTimelineData, saveTimelineData } from './firebase';

export function useTimelineData() {
  const [data, setData] = useState<TimelineData>({ timelineBackground: '#1e1e2f', events: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const fbData = await fetchTimelineData();
      if (fbData) {
        setData(fbData);
      } else {
        // Fallback to fetch from existing local server once on first ever load
        // so data isn't lost if Firebase is empty.
        const res = await fetch('./api/timeline');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      }
    } catch (e) {
      console.error('Failed to load timeline data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (newData: TimelineData) => {
    setData(newData);
    try {
      await saveTimelineData(newData);
    } catch (e) {
      console.error('Failed to save timeline data to Firebase', e);
      alert('儲存失敗：您可能沒有權限');
    }
  };

  return { data, loading, saveData };
}

