import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { TimelineData, TimelineEvent, AxisLabel, Drawing } from '../types';
import { cn } from '../lib/utils';
import { Plus, X, MousePointer2, PencilLine, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface VisualTimelineEditorProps {
  data: TimelineData;
  onUpdateData: (data: TimelineData) => void;
}

export function VisualTimelineEditor({ data, onUpdateData }: VisualTimelineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const customTrackRef = useRef<HTMLDivElement>(null);
  const verticalThumbRef = useRef<HTMLDivElement>(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const zoomScale = 180;

  const [activeTool, setActiveTool] = useState<'move' | 'draw'>('move');
  const [drawingId, setDrawingId] = useState<string | null>(null);

  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<any>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState(0);
  const [panScrollLeft, setPanScrollLeft] = useState(0);
  const COLORS = ['#fb923c', '#38bdf8', '#34d399', '#a78bfa', '#f87171', '#ffffff'];

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!lanesRef.current) return;
    const scrollContainer = lanesRef.current;
    
    setDimensions({
      width: scrollContainer.scrollWidth || scrollContainer.offsetWidth,
      height: scrollContainer.scrollHeight || scrollContainer.offsetHeight,
    });

    const observer = new ResizeObserver(() => {
      if (lanesRef.current) {
        setDimensions({ 
          width: lanesRef.current.scrollWidth, 
          height: lanesRef.current.scrollHeight 
        });
      }
    });

    observer.observe(scrollContainer);
    return () => observer.disconnect();
  }, [data.events.length]);

  const dates = data.events.map(e => new Date(e.date).getTime());
  const minDate = Math.min(...dates, new Date('1970-01-01').getTime());
  const maxDate = Math.max(...dates, new Date().getTime());
  const dateRange = maxDate - minDate || 1;

  const sortedEvents = [...data.events].sort((a, b) => (a.positionX ?? 0) - (b.positionX ?? 0));
  const rawCategories = Array.from(new Set(sortedEvents.map(e => e.category)));
  
  // Sort according to data.categoryOrder if available
  const categoryOrder = data.categoryOrder || [];
  const categories = [...rawCategories].sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const handleReorderCategories = (dragged: string, target: string) => {
    const draggedIdx = categories.indexOf(dragged);
    const targetIdx = categories.indexOf(target);
    if (draggedIdx !== -1 && targetIdx !== -1) {
      const newOrder = [...categories];
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, dragged);
      
      onUpdateData({
        ...data,
        categoryOrder: newOrder
      });
    }
  };

  const moveCategoryStep = (category: string, direction: 'up' | 'down') => {
    const draggedIdx = categories.indexOf(category);
    if (draggedIdx === -1) return;
    
    const targetIdx = direction === 'up' ? draggedIdx - 1 : draggedIdx + 1;
    if (targetIdx >= 0 && targetIdx < categories.length) {
      const targetCategory = categories[targetIdx];
      handleReorderCategories(category, targetCategory);
    }
  };

  const handleLanesScroll = () => {
    const container = lanesRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) {
      if (customTrackRef.current) {
        customTrackRef.current.style.opacity = "0";
        customTrackRef.current.style.pointerEvents = "none";
      }
    } else {
      if (customTrackRef.current) {
        customTrackRef.current.style.opacity = "1";
        customTrackRef.current.style.pointerEvents = "auto";
      }

      const thumbHeightRatio = clientHeight / scrollHeight;
      const thumbHeightPx = Math.max(24, thumbHeightRatio * clientHeight);
      const availableTrackHeight = clientHeight - thumbHeightPx;
      const scrollPercent = scrollTop / totalScrollable;
      const thumbTopPx = scrollPercent * availableTrackHeight;

      if (verticalThumbRef.current) {
        verticalThumbRef.current.style.height = `${thumbHeightPx}px`;
        verticalThumbRef.current.style.transform = `translateY(${thumbTopPx}px)`;
      }
    }
  };

  const handleVerticalScrollMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const container = lanesRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) return;

    const trackRect = customTrackRef.current?.getBoundingClientRect();
    if (!trackRect) return;

    const trackHeight = trackRect.height;
    const thumbHeightRatio = clientHeight / scrollHeight;
    const thumbHeightPx = Math.max(24, thumbHeightRatio * clientHeight);
    const availableTrack = trackHeight - thumbHeightPx;

    const startY = e.clientY;
    const startScrollTop = container.scrollTop;

    const handleMouseDrag = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaPercent = deltaY / availableTrack;
      const targetScrollTop = Math.max(0, Math.min(totalScrollable, startScrollTop + deltaPercent * totalScrollable));
      container.scrollTop = targetScrollTop;
    };

    const handleMouseDragUp = () => {
      window.removeEventListener("mousemove", handleMouseDrag);
      window.removeEventListener("mouseup", handleMouseDragUp);
    };

    window.addEventListener("mousemove", handleMouseDrag);
    window.addEventListener("mouseup", handleMouseDragUp);
  };

  const handleVerticalScrollTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === verticalThumbRef.current) return;

    const container = lanesRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) return;

    const trackRect = customTrackRef.current?.getBoundingClientRect();
    if (!trackRect) return;

    const trackHeight = trackRect.height;
    const clickY = e.clientY - trackRect.top;

    const thumbHeightRatio = clientHeight / scrollHeight;
    const thumbHeightPx = Math.max(24, thumbHeightRatio * clientHeight);

    const targetPercent = (clickY - thumbHeightPx / 2) / (trackHeight - thumbHeightPx);
    const targetScrollTop = Math.max(0, Math.min(totalScrollable, targetPercent * totalScrollable));
    container.scrollTop = targetScrollTop;
  };

  useEffect(() => {
    const container = lanesRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      handleLanesScroll();
    });
    resizeObserver.observe(container);

    handleLanesScroll();

    return () => {
      resizeObserver.disconnect();
    };
  }, [categories]);

  const handleTimelineScroll = useCallback(() => {
    if (containerRef.current) {
      const sLeft = containerRef.current.scrollLeft;
      const labels = containerRef.current.querySelectorAll('.lane-label');
      labels.forEach((label) => {
        (label as HTMLElement).style.transform = `translateX(${sLeft}px)`;
      });
    }
  }, []);

  useLayoutEffect(() => {
    handleTimelineScroll();
  });

  // Dragging logic for events
  const handleEventMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool !== 'move') return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingEventId(id);
  };

  const handleLabelMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool !== 'move') return;
    e.stopPropagation();
    setDraggingLabelId(id);
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'move') {
      setSelectedDrawingId(null);
      setIsPanning(true);
      if (containerRef.current) {
        setPanStartX(e.pageX - containerRef.current.offsetLeft);
        setPanScrollLeft(containerRef.current.scrollLeft);
      }
      return;
    }
    
    if (activeTool !== 'draw' || !containerRef.current) return;
    
    // The inner container defines the actual width (min 800px, stretches to 100%)
    const innerContainer = containerRef.current.children[0] as HTMLElement;
    if (!innerContainer) return;
    
    const rect = innerContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const percentageX = (x / rect.width) * 100;
    const percentageY = (y / rect.height) * 100;

    const newDrawingId = crypto.randomUUID();
    const newDrawing: Drawing = {
      id: newDrawingId,
      startX: percentageX,
      startY: percentageY,
      endX: percentageX,
      endY: percentageY,
      color: '#fb923c' // orange-400
    };

    onUpdateData({ ...data, drawings: [...(data.drawings || []), newDrawing] });
    setDrawingId(newDrawingId);
  };

  const handleDrawingMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool !== 'move') return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedDrawingId(id);
    
    if (containerRef.current) {
      const innerContainer = containerRef.current.children[0] as HTMLElement;
      if (innerContainer) {
        const rect = innerContainer.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

        const percentageX = (x / rect.width) * 100;
        const percentageY = (y / rect.height) * 100;

        const drawing = data.drawings?.find(d => d.id === id);
        if (drawing) {
          setDraggingHandle({ 
            id, 
            type: 'whole', 
            refX: percentageX, 
            refY: percentageY, 
            initialDrawing: drawing 
          });
        }
      }
    }
  };

  const handleHandleMouseDown = (e: React.MouseEvent, id: string, type: 'start' | 'end' | 'control') => {
    if (activeTool !== 'move') return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingHandle({ id, type });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const innerContainer = containerRef.current.children[0] as HTMLElement;
    if (!innerContainer) return;
    
    const rect = innerContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const percentageX = (x / rect.width) * 100;
    const percentageY = (y / rect.height) * 100;

    if (activeTool === 'move') {
      if (draggingEventId) {
        const updatedEvents = data.events.map(ev => 
          ev.id === draggingEventId ? { ...ev, positionX: percentageX } : ev
        );
        onUpdateData({ ...data, events: updatedEvents });
      } else if (draggingLabelId && data.axisLabels) {
        const updatedLabels = data.axisLabels.map(label => 
          label.id === draggingLabelId ? { ...label, positionX: percentageX } : label
        );
        onUpdateData({ ...data, axisLabels: updatedLabels });
      } else if (draggingHandle && data.drawings) {
        let hoverEventId: string | undefined = undefined;
        if (draggingHandle.type === 'start' || draggingHandle.type === 'end') {
          const elements = document.elementsFromPoint(e.clientX, e.clientY);
          const eventEl = elements.find(el => el.getAttribute && el.getAttribute('data-event-id'));
          if (eventEl) {
            hoverEventId = eventEl.getAttribute('data-event-id') || undefined;
          }
        }

        const updatedDrawings = data.drawings.map(d => {
          if (d.id === draggingHandle.id) {
            if (draggingHandle.type === 'start') {
              return { ...d, startX: percentageX, startY: percentageY, startEventId: hoverEventId };
            }
            if (draggingHandle.type === 'end') {
              return { ...d, endX: percentageX, endY: percentageY, endEventId: hoverEventId };
            }
            if (draggingHandle.type === 'control') {
              return { ...d, controlX: percentageX, controlY: percentageY };
            }
            if (draggingHandle.type === 'whole') {
              const dx = percentageX - draggingHandle.refX;
              const dy = percentageY - draggingHandle.refY;
              const init = draggingHandle.initialDrawing;
              const cX = init.controlX !== undefined ? init.controlX : (init.startX + init.endX) / 2;
              const cY = init.controlY !== undefined ? init.controlY : (init.startY + init.endY) / 2;
              return {
                ...d,
                startX: init.startX + dx,
                startY: init.startY + dy,
                endX: init.endX + dx,
                endY: init.endY + dy,
                controlX: cX + dx,
                controlY: cY + dy
              };
            }
          }
          return d;
        });
        onUpdateData({ ...data, drawings: updatedDrawings });
      }
    } else if (activeTool === 'draw' && drawingId && data.drawings) {
      const updatedDrawings = data.drawings.map(d => 
        d.id === drawingId ? { ...d, endX: percentageX, endY: percentageY } : d
      );
      onUpdateData({ ...data, drawings: updatedDrawings });
    }
  }, [draggingEventId, draggingLabelId, drawingId, activeTool, data, onUpdateData, draggingHandle]);

  const handleMouseUp = useCallback(() => {
    if (drawingId && data.drawings) {
      const currentDrawing = data.drawings.find(d => d.id === drawingId);
      if (currentDrawing) {
        const dx = currentDrawing.endX - currentDrawing.startX;
        const dy = currentDrawing.endY - currentDrawing.startY;
        if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
          onUpdateData({
            ...data,
            drawings: data.drawings.filter(d => d.id !== drawingId)
          });
        }
      }
    }
    setDraggingEventId(null);
    setDraggingLabelId(null);
    setDrawingId(null);
    setDraggingHandle(null);
  }, [drawingId, data, onUpdateData]);

  useEffect(() => {
    if (draggingEventId || draggingLabelId || drawingId || draggingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingEventId, draggingLabelId, drawingId, draggingHandle, handleMouseMove, handleMouseUp]);

  const addLabel = () => {
    const newLabels = [
      ...(data.axisLabels || []), 
      { id: crypto.randomUUID(), text: 'New Time', positionX: 50 }
    ];
    onUpdateData({ ...data, axisLabels: newLabels });
  };

  const updateLabelText = (id: string, text: string) => {
    if (!data.axisLabels) return;
    const newLabels = data.axisLabels.map(l => l.id === id ? { ...l, text } : l);
    onUpdateData({ ...data, axisLabels: newLabels });
  };

  const deleteLabel = (id: string) => {
    if (!data.axisLabels) return;
    const newLabels = data.axisLabels.filter(l => l.id !== id);
    onUpdateData({ ...data, axisLabels: newLabels });
  };

  const changeDrawingColor = (color: string) => {
    if (!selectedDrawingId || !data.drawings) return;
    const updated = data.drawings.map(d => d.id === selectedDrawingId ? { ...d, color } : d);
    onUpdateData({ ...data, drawings: updated });
  };

  const deleteDrawingById = (id: string) => {
    if (!data.drawings) return;
    const updated = data.drawings.filter(d => d.id !== id);
    onUpdateData({ ...data, drawings: updated });
    if (selectedDrawingId === id) setSelectedDrawingId(null);
  };

  // SVG Marker definition
  const defs = (
    <defs>
      {COLORS.map(c => (
        <marker key={c} id={`arrowhead-${c.replace('#', '')}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={c} />
        </marker>
      ))}
    </defs>
  );

  return (
    <div className="w-full h-full flex flex-col items-center bg-[#0f0f12] p-6 relative">
      <div className="w-full max-w-6xl flex justify-between items-end mb-4">
        <div>
          <h2 className="text-xl font-serif text-white mb-2">Visual Timeline Editor</h2>
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Select Draw tool to draw arrows between events. Click arrows to delete.</p>
        </div>
        <div className="flex gap-4 items-center">
          {selectedDrawingId && activeTool === 'move' && (
            <div className="flex bg-[#1a1a20] rounded border border-white/10 p-1 gap-1 items-center">
               {COLORS.map(c => (
                  <button 
                    key={c} 
                    className={cn("w-5 h-5 rounded-full border-2", data.drawings?.find(d => d.id === selectedDrawingId)?.color === c ? "border-white" : "border-transparent")}
                    style={{ backgroundColor: c }}
                    onClick={() => changeDrawingColor(c)}
                  />
               ))}
               <div className="w-px h-5 bg-white/10 mx-1"></div>
               <button onClick={() => deleteDrawingById(selectedDrawingId)} className="p-1 hover:bg-red-500/20 text-red-400 rounded">
                  <Trash2 size={14} />
               </button>
            </div>
          )}
          <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden">
            <button
              onClick={() => setActiveTool('move')}
              className={cn(
                "px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors",
                activeTool === 'move' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
              title="Move Events"
            >
              <MousePointer2 size={14} /> Move
            </button>
            <button
              onClick={() => setActiveTool('draw')}
              className={cn(
                "px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors",
                activeTool === 'draw' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
              title="Draw Arrows"
            >
              <PencilLine size={14} /> Draw
            </button>
          </div>
          <button 
            onClick={addLabel}
            className="bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Plus size={14} /> Add Axis Label
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl rounded-xl shadow-2xl border border-white/10 overflow-hidden relative select-none" style={{ backgroundColor: data.timelineBackground || '#1a1a20' }}>
        <div 
          ref={containerRef} 
          onMouseDown={handleContainerMouseDown} 
          onMouseMove={(e) => {
            if (!isPanning || activeTool !== 'move') return;
            e.preventDefault();
            const x = e.pageX - (containerRef.current?.offsetLeft || 0);
            const walk = (x - panStartX) * 2;
            if (containerRef.current) {
              containerRef.current.scrollLeft = panScrollLeft - walk;
              handleTimelineScroll();
            }
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
          onScroll={handleTimelineScroll}
          className={cn("w-full relative flex flex-col overflow-x-hidden overflow-y-hidden h-[25vh] min-h-[120px] custom-scrollbar bg-grid-pattern", activeTool === 'draw' ? "cursor-crosshair" : (isPanning ? "cursor-grabbing" : "cursor-grab"))}
          style={{ overflowX: "hidden", margin: 0 }}
        >
          <div 
            className="min-w-fit flex-1 flex flex-col relative pb-0 overflow-hidden min-h-0"
            style={{ width: `${zoomScale}vw` }}
          >
            <div
              ref={lanesRef}
              onScroll={handleLanesScroll}
              className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0"
            >
              <div className="relative w-full min-h-full flex flex-col overflow-hidden">
            {/* Year/Axis Vertical Guide Lines */}
            {data.axisLabels && data.axisLabels.length > 0 && (
              <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-0">
                {data.axisLabels.map((label) => (
                  <div
                    key={`guide-${label.id}`}
                    className="absolute top-0 bottom-0 w-[2px] bg-cyan-400/25 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    style={{ left: `${label.positionX}%` }}
                  />
                ))}
              </div>
            )}
            
            {/* SVG Drawing Layer */}
            <svg className="absolute inset-0 z-20 pointer-events-none" width={dimensions.width} height={dimensions.height}>
              {defs}
              {data.drawings && data.drawings.map(d => {
                const getEventCoords = (eventId: string | undefined): { x: number, y: number } | null => {
                  if (!eventId) return null;
                  const event = data.events.find(e => e.id === eventId);
                  if (!event) return null;
                  const laneIndex = categories.indexOf(event.category);
                  if (laneIndex === -1) return null;
                  
                  let leftPerc = event.positionX;
                  if (leftPerc === undefined) {
                    const eventTime = new Date(event.date).getTime();
                    leftPerc = ((eventTime - minDate) / dateRange) * 90 + 5;
                  }
                  leftPerc = Math.max(1, Math.min(99, leftPerc));
                  
                  const absY = laneIndex * 36 + 18;
                  const percY = dimensions.height > 0 ? (absY / dimensions.height) * 100 : 0;
                  return { x: leftPerc, y: percY };
                };

                const startCoords = getEventCoords(d.startEventId) || { x: d.startX, y: d.startY };
                const endCoords = getEventCoords(d.endEventId) || { x: d.endX, y: d.endY };

                const isDrawing = d.id === drawingId;
                const isSelected = d.id === selectedDrawingId && activeTool === 'move';
                
                const toAbsX = (perc: number) => Math.max(0, (perc / 100) * dimensions.width);
                const toAbsY = (perc: number) => Math.max(0, (perc / 100) * dimensions.height);

                let cX = d.controlX !== undefined ? d.controlX : (startCoords.x + endCoords.x) / 2;
                let cY = d.controlY !== undefined ? d.controlY : Math.min(startCoords.y, endCoords.y) - 20;
                
                const startAbsX = toAbsX(startCoords.x);
                const startAbsY = toAbsY(startCoords.y);
                const endAbsX = toAbsX(endCoords.x);
                const endAbsY = toAbsY(endCoords.y);
                const cAbsX = toAbsX(cX);
                const cAbsY = toAbsY(cY);

                const pathD = `M ${startAbsX} ${startAbsY} Q ${cAbsX} ${cAbsY} ${endAbsX} ${endAbsY}`;
                const color = d.color || '#fb923c';

                return (
                  <g key={d.id}>
                    {/* Invisible thicker line for easier clicking to select */}
                    <path 
                      d={pathD} 
                      stroke="transparent" 
                      strokeWidth="30" 
                      strokeLinecap="round"
                      fill="none" 
                      style={{ pointerEvents: activeTool === 'move' ? 'stroke' : 'none', cursor: 'pointer' }}
                      onMouseDown={(e) => {
                        if (!isDrawing) handleDrawingMouseDown(e, d.id);
                      }}
                    />
                    <circle cx={startAbsX} cy={startAbsY} r="15" fill="transparent" 
                      style={{ pointerEvents: activeTool === 'move' ? 'all' : 'none', cursor: 'pointer' }}
                      onMouseDown={(e) => { if (!isDrawing) handleDrawingMouseDown(e, d.id); }} 
                    />
                    <circle cx={endAbsX} cy={endAbsY} r="15" fill="transparent" 
                      style={{ pointerEvents: activeTool === 'move' ? 'all' : 'none', cursor: 'pointer' }}
                      onMouseDown={(e) => { if (!isDrawing) handleDrawingMouseDown(e, d.id); }} 
                    />
                    <path 
                      d={pathD} 
                      stroke={color} 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      fill="none"
                      markerEnd={`url(#arrowhead-${color.replace('#', '')})`}
                      className={cn("transition-colors", isSelected && "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]")}
                      style={{ pointerEvents: 'none' }}
                    />
                    {isSelected && (
                      <g>
                        <line x1={startAbsX} y1={startAbsY} x2={cAbsX} y2={cAbsY} stroke="white" strokeWidth="1" strokeDasharray="4 4" className="opacity-30 pointer-events-none" />
                        <line x1={endAbsX} y1={endAbsY} x2={cAbsX} y2={cAbsY} stroke="white" strokeWidth="1" strokeDasharray="4 4" className="opacity-30 pointer-events-none" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* HTML Handles Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              {data.drawings && data.drawings.map(d => {
                const isSelected = d.id === selectedDrawingId && activeTool === 'move';
                if (!isSelected) return null;

                const cX = d.controlX !== undefined ? d.controlX : (d.startX + d.endX) / 2;
                const cY = d.controlY !== undefined ? d.controlY : (d.startY + d.endY) / 2;

                return (
                  <React.Fragment key={d.id + "-handles"}>
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow cursor-move hover:scale-110 active:scale-95 transition-transform translate-x[-50%] translate-y[-50%]"
                      style={{ left: `${d.startX}%`, top: `${d.startY}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}
                      onMouseDown={(e) => handleHandleMouseDown(e, d.id, 'start')}
                    />
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow cursor-move hover:scale-110 active:scale-95 transition-transform translate-x[-50%] translate-y[-50%]"
                      style={{ left: `${d.endX}%`, top: `${d.endY}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}
                      onMouseDown={(e) => handleHandleMouseDown(e, d.id, 'end')}
                    />
                    <div 
                      className="absolute w-5 h-5 bg-yellow-400 border-2 border-black rounded-full shadow cursor-move hover:scale-110 active:scale-95 transition-transform translate-x[-50%] translate-y[-50%]"
                      style={{ left: `${cX}%`, top: `${cY}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}
                      onMouseDown={(e) => handleHandleMouseDown(e, d.id, 'control')}
                    />
                    <button 
                      className="absolute px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded shadow hover:bg-red-600 flex items-center gap-1 active:bg-red-700 transition"
                      style={{ left: `${cX}%`, top: `calc(${cY}% + 20px)`, transform: 'translateX(-50%)', pointerEvents: 'auto' }}
                      onClick={(e) => { e.stopPropagation(); deleteDrawingById(d.id); }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Grid */}
            <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none opacity-5"
                 style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '10% 100%' }}>
            </div>

            {/* Lanes */}
            <div className="relative w-full flex flex-col shrink-0 pb-[3px]">
              {categories.map((category, idx) => {
                  const themeColors = [
                    { text: 'text-orange-400', bgLight: 'bg-orange-500/10', bgSolid: 'bg-orange-500', border: 'border-orange-500/90' },
                    { text: 'text-sky-400', bgLight: 'bg-sky-500/10', bgSolid: 'bg-sky-500', border: 'border-sky-500/90' },
                    { text: 'text-emerald-400', bgLight: 'bg-emerald-500/10', bgSolid: 'bg-emerald-500', border: 'border-emerald-500/90' },
                    { text: 'text-purple-400', bgLight: 'bg-purple-500/10', bgSolid: 'bg-purple-500', border: 'border-purple-500/90' },
                  ];
                  const t = themeColors[idx % themeColors.length];
                  
                  const categoryEvents = sortedEvents.filter(e => e.category === category);
                  const customColor = categoryEvents.find(e => e.categoryColor)?.categoryColor;

                  return (
                    <div key={category} className="h-9 border-b border-white/5 relative flex items-center shrink-0">
                      {/* Lane Label */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverCategory(category);
                        }}
                        onDragLeave={() => setDragOverCategory(null)}
                        onDrop={() => {
                          if (draggedCategory && draggedCategory !== category) {
                            handleReorderCategories(draggedCategory, category);
                          }
                          setDraggedCategory(null);
                          setDragOverCategory(null);
                        }}
                        className={cn(
                          "lane-label sticky left-0 top-0 bottom-0 min-h-[32px] w-36 md:w-40 bg-[#08080a]/85 backdrop-blur-sm flex items-center justify-between px-2 py-1 z-40 shadow-[4px_0_15px_rgba(0,0,0,0.3)] gap-1 group/lane transition-colors flex-shrink-0 transform-gpu",
                          dragOverCategory === category ? "bg-orange-500/20 border-r-2 border-r-orange-500" : "border-r border-white/5"
                        )}
                      >
                         <div className="flex items-center gap-1 min-w-0 flex-1">
                            {/* Drag Grip Handle */}
                            <div 
                              draggable
                              onDragStart={(e) => {
                                setDraggedCategory(category);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-orange-400 p-0.5 rounded transition-colors"
                              title="拖曳以排序泳道"
                            >
                              <GripVertical size={13} />
                            </div>

                            <div className={cn("w-2 h-2 shrink-0 rounded-full", !customColor && t.bgSolid)} style={customColor ? { backgroundColor: customColor } : undefined}></div>
                            
                            <span className="text-xs sm:text-xs uppercase tracking-wider text-gray-300 font-bold truncate select-none pointer-events-none" title={category}>
                              {category || "未命名"}
                            </span>
                         </div>

                         {/* Up / Down Reorder Buttons */}
                         <div className="opacity-0 group-hover/lane:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity duration-150 pl-0.5 z-50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveCategoryStep(category, 'up');
                              }}
                              disabled={idx === 0}
                              className={cn(
                                "p-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer",
                                idx === 0 && "opacity-20 cursor-not-allowed pointer-events-none"
                              )}
                              title="向上移動"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveCategoryStep(category, 'down');
                              }}
                              disabled={idx === categories.length - 1}
                              className={cn(
                                "p-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer",
                                idx === categories.length - 1 && "opacity-20 cursor-not-allowed pointer-events-none"
                              )}
                              title="向下移動"
                            >
                              <ChevronDown size={13} />
                            </button>
                         </div>
                      </div>
                      
                      <div className="absolute inset-0">
                        {sortedEvents.filter(e => e.category === category).map(event => {
                          const eventTime = new Date(event.date).getTime();
                          let leftPerc = event.positionX;
                          if (leftPerc === undefined) {
                            leftPerc = ((eventTime - minDate) / dateRange) * 90 + 5;
                          }
                          
                          const catColor = event.categoryColor || (
                            idx % 4 === 0 ? '#f97316' :
                            idx % 4 === 1 ? '#0ea5e9' :
                            idx % 4 === 2 ? '#10b981' : '#a855f7'
                          );

                          return (
                            <div
                              key={event.id}
                              data-event-id={event.id}
                              onMouseDown={(e) => handleEventMouseDown(e, event.id)}
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 transition-transform hover:scale-105",
                                activeTool === 'move' ? "cursor-grab active:cursor-grabbing z-30" : "pointer-events-none z-10"
                              )}
                              style={{ left: `${Math.max(1, Math.min(99, leftPerc))}%` }}
                            >
                              {/* Vertical white/light line extending down to bottom axis */}
                              <div 
                                className="absolute left-0 top-[14px] w-px h-[1000px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none -z-10" 
                              />

                               <div 
                                 className="relative"
                                 style={{
                                   background: `linear-gradient(135deg, #ffffff 0%, #b8bfc6 20%, #eff2f5 35%, #7e8790 55%, #ffffff 75%, #a2aab3 100%)`,
                                   padding: '1.5px',
                                   borderRadius: '6px',
                                   boxShadow: event.id === draggingEventId
                                     ? `0 0 14px ${catColor}, inset 0 1px 1px rgba(255,255,255,0.9)`
                                     : `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.8), 0 0 3px ${catColor}50`
                                 }}
                               >
                                 {/* Category Color Filter Overlay on the metallic border */}
                                 <div 
                                   className="absolute inset-0 rounded-[6px] pointer-events-none mix-blend-color opacity-85 animate-fade-in"
                                   style={{ backgroundColor: catColor }}
                                 />
                                 <div 
                                   className="absolute inset-[1px] rounded-[5px] pointer-events-none mix-blend-overlay opacity-30"
                                   style={{ backgroundColor: catColor }}
                                 />
                                 
                                 {/* Inner sleek carbon black glossy container */}
                                 <div 
                                   className={cn(
                                     "relative flex h-6.5 items-center px-2 py-0.5 gap-2 overflow-hidden bg-black/95 text-white transition-all duration-200"
                                   )}
                                   style={{ 
                                     borderRadius: '5px',
                                     boxShadow: `inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.8)`,
                                     background: `linear-gradient(to bottom, #111115 0%, #060608 100%)`
                                   }}
                                 >
                                   {/* Subtle custom category background tint inside */}
                                   <div 
                                     className="absolute inset-0 opacity-[0.08] pointer-events-none"
                                     style={{ backgroundColor: catColor }}
                                   />
                                   
                                   {/* Curved glossy reflection highlight (shiny curve from top half) */}
                                   <div 
                                     className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/[0.18] to-transparent rounded-t-[5px] pointer-events-none"
                                   />

                                   {/* Small neon color status indicator dot with a matching glow */}
                                   <div 
                                     className="w-1 h-3.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                     style={{ 
                                       backgroundColor: catColor, 
                                       boxShadow: `0 0 6px ${catColor}, 0 0 12px ${catColor}` 
                                     }}
                                   />
                                   
                                   <span className={cn(
                                     "text-[10px] sm:text-xs font-black uppercase tracking-wider truncate max-w-[200px] select-none pointer-events-none relative z-10",
                                     event.id === draggingEventId ? "text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" : "text-gray-300"
                                   )}>
                                     {event.title}
                                   </span>
                                 </div>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
              })}
            </div>
          </div>
        </div>

          {/* Bottom Axis Labels */}
            {data.axisLabels && data.axisLabels.length > 0 && (
              <div 
                className="h-10 border-t border-white/10 flex items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-auto shrink-0 relative"
                style={{ backgroundColor: data.timelineBackground || "#08080a" }}
              >
                {data.axisLabels.map((label) => (
                  <div
                    key={label.id}
                    onMouseDown={(e) => handleLabelMouseDown(e, label.id)}
                    className={cn(
                      "absolute flex flex-col items-center -translate-x-1/2 pb-1.5",
                      activeTool === "move" 
                        ? "cursor-grab active:cursor-grabbing hover:brightness-125 select-none" 
                        : "pointer-events-none"
                    )}
                    style={{ left: `${Math.max(0, Math.min(100, label.positionX))}%` }}
                  >
                    {/* Tiny pulsing indicator dot to represent draggable hook in move mode */}
                    {activeTool === 'move' && (
                      <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse pointer-events-none shadow-[0_0_8px_rgba(249,115,22,0.8)] border border-white/50" />
                    )}
                    <div className="w-[2px] h-3 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] mb-1 leading-none"></div>
                    <span className="text-xs sm:text-sm text-cyan-300 font-mono font-extrabold tracking-wider whitespace-nowrap drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]">
                      {label.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
          </div>
          
          {/* Custom Vertical Scrollbar */}
          <div
            ref={customTrackRef}
            className="absolute right-1 top-1 bottom-11 w-1.5 hover:w-2.5 bg-black/45 hover:bg-black/60 rounded-full border border-white/5 cursor-pointer z-50 flex flex-col justify-start overflow-hidden opacity-0 pointer-events-none transition-all duration-200"
            onClick={handleVerticalScrollTrackClick}
            onMouseDown={handleVerticalScrollMouseDown}
          >
            <div
              ref={verticalThumbRef}
              className="w-full bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.85)] rounded-full transition-colors cursor-pointer"
            />
          </div>
        </div>


      </div>
      
      {/* Label Edit Form */}
      {data.axisLabels && data.axisLabels.length > 0 && (
        <div className="w-full max-w-6xl mt-6">
          <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">Edit Axis Labels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.axisLabels.map(label => (
              <div key={label.id} className="flex gap-2 bg-[#1a1a20] p-2 rounded-lg border border-white/10 relative group">
                <input
                  type="text"
                  value={label.text}
                  onChange={(e) => updateLabelText(label.id, e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded px-2 py-1 text-sm text-white focus:border-orange-500 outline-none"
                />
                <button 
                  onClick={() => deleteLabel(label.id)}
                  className="p-1 px-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                  title="Delete Label"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
