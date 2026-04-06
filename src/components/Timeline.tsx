import React, { useEffect, useRef, useState } from 'react';

interface TimelineProps {
  data: any;
  onTimelineReady?: (timeline: any) => void;
}

declare global {
  interface Window {
    TL: any;
  }
}

const Timeline: React.FC<TimelineProps> = ({ data, onTimelineReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const timelineInstance = useRef<any>(null);

  useEffect(() => {
    // Check if already loaded
    if (document.querySelector('script[src*="timeline.js"]')) {
      setIsLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      // We don't remove the script/css to avoid issues on re-renders
    };
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && window.TL) {
      const options = {
        hash_bookmark: false,
        initial_zoom: 2,
        timenav_position: 'bottom',
        language: 'zh-tw', // Set language to Traditional Chinese
      };
      
      if (containerRef.current.innerHTML) {
          containerRef.current.innerHTML = '';
      }

      // Timeline.js needs a specific ID sometimes, or just the element
      timelineInstance.current = new window.TL.Timeline(containerRef.current, data, options);
      
      if (onTimelineReady) {
        onTimelineReady(timelineInstance.current);
      }
    }
  }, [isLoaded, data, onTimelineReady]);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 bg-white/5 backdrop-blur-sm">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default Timeline;
