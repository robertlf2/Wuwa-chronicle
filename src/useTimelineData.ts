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
      referenceImages: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&auto=format&fit=crop"],
      backgroundColor: "#fef3c7",
      category: "主線任務"
    }
  ]
};

export function useTimelineData() {
  const [data, setData] = useState<TimelineData>(defaultFallbackData);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const fbData = await fetchTimelineData();
      if (fbData) {
        setData(fbData);
      } else {
        // Fallback to fetch from existing local server once on first ever load
        // so data isn't lost if Firebase is empty.
        try {
          const res = await fetch('./api/timeline');
          if (res.ok) {
            const json = await res.json();
            setData(json);
          } else {
            setData(defaultFallbackData);
          }
        } catch (fetchErr) {
          console.warn('API route not available, using default fallback data', fetchErr);
          setData(defaultFallbackData);
        }
      }
    } catch (e) {
      console.error('Failed to load timeline data', e);
      setData(defaultFallbackData);
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

