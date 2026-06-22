import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { TimelineEvent, TimelineData } from "../types";
import { format, parseISO, isValid } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface TimelineViewProps {
  data: TimelineData;
  activeEventId?: string;
  onEventChange?: (id: string) => void;
}

interface SciFiButtonProps {
  onClick: () => void;
  text: string;
}

const barVariants: any = {
  initial: {
    scaleY: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  animate: (i: number) => ({
    scaleY: [0.35, 1.0, 0.35],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.12,
    },
  }),
};

function SoundWave({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-5 w-7 flex-shrink-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          variants={barVariants}
          custom={i}
          animate={isHovered ? "animate" : "initial"}
          className="w-[3px] bg-cyan-400 rounded-full"
          style={{
            height: i === 0 || i === 4 ? "40%" : i === 1 || i === 3 ? "75%" : "100%",
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

function SciFiButton({ onClick, text }: SciFiButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const displayText = text;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-11 inline-flex items-center justify-between bg-black/45 backdrop-blur-md rounded-lg group cursor-pointer overflow-visible transition-all duration-300 border-0 outline-none p-0 focus:outline-none"
    >
      <svg
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
        viewBox="0 0 200 44"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="cyan-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer tech frame transparent container with light blue color exactly like side button border lines */}
        <polygon
          points="6,2 194,2 198,6 198,38 194,42 6,42 2,38 2,6"
          fill="none"
          stroke="rgba(34, 211, 238, 0.45)"
          strokeWidth="1.5"
          className="group-hover:stroke-cyan-300 transition-all duration-300"
        />

        {/* Chamfered corners styling */}
        <path
          d="M 12,4 L 4,12"
          fill="none"
          stroke="rgba(34, 211, 238, 0.8)"
          strokeWidth="1.5"
          className="group-hover:stroke-cyan-200 transition-all duration-300"
        />
        <path
          d="M 188,40 L 196,32"
          fill="none"
          stroke="rgba(34, 211, 238, 0.8)"
          strokeWidth="1.5"
          className="group-hover:stroke-cyan-200 transition-all duration-300"
        />

        {/* Double edge highlights */}
        <path
          d="M 3,12 L 3,32"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2"
          filter="url(#cyan-glow)"
          className="opacity-70 group-hover:opacity-100 group-hover:stroke-cyan-300 transition-all duration-300"
        />
        <path
          d="M 197,12 L 197,32"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2"
          filter="url(#cyan-glow)"
          className="opacity-70 group-hover:opacity-100 group-hover:stroke-cyan-300 transition-all duration-300"
        />

        {/* Decorative horizontal lines */}
        <path
          d="M 30,4 L 75,4 M 125,4 L 170,4"
          fill="none"
          stroke="rgba(34, 211, 238, 0.45)"
          strokeWidth="1.2"
          className="group-hover:stroke-cyan-300 transition-all duration-300"
        />
        <path
          d="M 30,40 L 75,40 M 125,40 L 170,40"
          fill="none"
          stroke="rgba(34, 211, 238, 0.45)"
          strokeWidth="1.2"
          className="group-hover:stroke-cyan-300 transition-all duration-300"
        />
      </svg>

      {/* Button content: Soundwave on left, text on right */}
      <div className="relative z-10 w-full h-full flex items-center pl-3.5 pr-3.5 gap-2.5">
        <SoundWave isHovered={isHovered} />

        {/* Text Area */}
        <div className="flex-1 flex items-center justify-center pr-3">
          <span className="text-sm md:text-base font-mono font-bold tracking-[0.2em] uppercase text-white drop-shadow-md group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.85)] transition-all duration-300 select-none pl-[0.2em]">
            {displayText}
          </span>
        </div>
      </div>
    </button>
  );
}

export function TimelineView({
  data,
  activeEventId: externalSelectedId,
  onEventChange,
}: TimelineViewProps) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(
    data.events[0]?.id || null,
  );
  const [showReferences, setShowReferences] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(110);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showTitlePage, setShowTitlePage] = useState(
    data.titlePageEnabled ?? false,
  );
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const customTrackRef = useRef<HTMLDivElement>(null);
  const verticalThumbRef = useRef<HTMLDivElement>(null);

  const activeEventId =
    externalSelectedId !== undefined ? externalSelectedId : internalActiveId;
  const [prevId, setPrevId] = useState<string | null>(activeEventId);

  const timelineHeight = 28;
  const isCompact = false;

  const activeEvent = data.events.find((e) => e.id === activeEventId);

  // Sort events by positionX
  const sortedEvents = [...data.events].sort((a, b) => {
    return (a.positionX ?? 0) - (b.positionX ?? 0);
  });

  if (activeEventId !== prevId) {
    const prevIndex = sortedEvents.findIndex((e) => e.id === prevId);
    const newIndex = sortedEvents.findIndex((e) => e.id === activeEventId);
    if (prevIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > prevIndex ? 1 : -1);
    }
    setPrevId(activeEventId);
  }

  // Group events by category
  const rawCategories = Array.from(
    new Set(sortedEvents.map((e) => e.category || "Uncategorized")),
  );

  const categoryOrder = data.categoryOrder || [];
  const categories = [...rawCategories].sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Calculate timeline min/max dates
  const dates = sortedEvents.map((e) => new Date(e.date).getTime());
  const minDate = Math.min(...dates, new Date().getTime());
  const maxDate = Math.max(...dates, new Date().getTime());
  const dateRange = maxDate - minDate || 1;

  const activeIndex = sortedEvents.findIndex((e) => e.id === activeEventId);
  const prevEvent = activeIndex > 0 ? sortedEvents[activeIndex - 1] : null;
  const nextEvent =
    activeIndex < sortedEvents.length - 1
      ? sortedEvents[activeIndex + 1]
      : null;

  const activeCategory = activeEvent?.category || "Uncategorized";
  const categoryIndex = categories.indexOf(activeCategory);

  const themeColorsList = [
    {
      text: "text-orange-500/70",
      bgLight: "bg-orange-500/10",
      bgSolid: "bg-orange-500",
      border: "border-orange-500/30",
    },
    {
      text: "text-blue-500/70",
      bgLight: "bg-blue-500/10",
      bgSolid: "bg-blue-500",
      border: "border-blue-500/30",
    },
    {
      text: "text-emerald-500/70",
      bgLight: "bg-emerald-500/10",
      bgSolid: "bg-emerald-500",
      border: "border-emerald-500/30",
    },
    {
      text: "text-purple-500/70",
      bgLight: "bg-purple-500/10",
      bgSolid: "bg-purple-500",
      border: "border-purple-500/30",
    },
  ];
  const activeT =
    themeColorsList[
      categoryIndex !== -1 ? categoryIndex % themeColorsList.length : 0
    ];
  const activeCatColor = activeEvent?.categoryColor;

  const handleEventChange = (newId: string) => {
    const currentIndex = sortedEvents.findIndex((e) => e.id === activeEventId);
    const newIndex = sortedEvents.findIndex((e) => e.id === newId);
    setDirection(newIndex > currentIndex ? 1 : -1);

    if (onEventChange) {
      onEventChange(newId);
    } else {
      setInternalActiveId(newId);
    }
  };

  useEffect(() => {
    const handleShowTitlePage = () => setShowTitlePage(true);
    const handleHideTitlePage = () => setShowTitlePage(false);
    window.addEventListener("timeline-show-title-page", handleShowTitlePage);
    window.addEventListener("timeline-hide-title-page", handleHideTitlePage);
    return () => {
      window.removeEventListener(
        "timeline-show-title-page",
        handleShowTitlePage,
      );
      window.removeEventListener(
        "timeline-hide-title-page",
        handleHideTitlePage,
      );
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("timeline-title-page-state-changed", {
        detail: showTitlePage,
      }),
    );
  }, [showTitlePage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        if (showTitlePage) {
          setShowTitlePage(false);
        } else if (nextEvent) {
          handleEventChange(nextEvent.id);
        }
      } else if (e.key === "ArrowLeft") {
        if (showTitlePage) {
          // Do nothing on title page when pressing go back
        } else if (prevEvent) {
          handleEventChange(prevEvent.id);
        } else if (data.titlePageEnabled && activeIndex === 0) {
          setShowTitlePage(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showTitlePage,
    nextEvent,
    prevEvent,
    data.titlePageEnabled,
    activeIndex,
    sortedEvents,
  ]);

  useEffect(() => {
    if (activeEventId && timelineRef.current) {
      const el = document.getElementById(`timeline-node-${activeEventId}`);
      if (el) {
        // Scroll horizontally to center the element
        const container = timelineRef.current;
        el.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [activeEventId]);

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
          height: lanesRef.current.scrollHeight,
        });
      }
    });

    observer.observe(scrollContainer);
    return () => observer.disconnect();
  }, [data.events.length]);

  const COLORS = [
    "#fb923c",
    "#38bdf8",
    "#34d399",
    "#a78bfa",
    "#f87171",
    "#ffffff",
  ];
  const defs = (
    <defs>
      {COLORS.map((c) => (
        <marker
          key={c}
          id={`arrowhead-${c.replace("#", "")}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={c} />
        </marker>
      ))}
    </defs>
  );

  const handleTimelineScroll = () => {
    if (timelineRef.current) {
      const sLeft = timelineRef.current.scrollLeft;
      const labels = timelineRef.current.querySelectorAll('.lane-label');
      labels.forEach((label) => {
        (label as HTMLElement).style.transform = `translateX(${sLeft}px)`;
      });
    }
  };

  useLayoutEffect(() => {
    handleTimelineScroll();
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (timelineRef.current?.offsetLeft || 0));
    setScrollLeft(timelineRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (timelineRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollLeft - walk;
      handleTimelineScroll();
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

  const formatDate = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isValid(d)) return format(d, "PP");
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full font-sans select-none text-[#e0e0e0]"
      style={{ backgroundColor: data.timelineBackground }}
    >
      <AnimatePresence>
        {showTitlePage && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-center cursor-pointer bg-[#0f0f12]"
            style={
              data.titlePageImage
                ? {
                    backgroundImage: `url(${data.titlePageImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
            onClick={() => setShowTitlePage(false)}
          >
            {(data.titlePageTitle?.trim() ||
              data.titlePageSubtitle?.trim()) && (
              <div className="bg-black/50 p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl backdrop-blur-md border border-white/10 max-w-4xl mx-4 shadow-2xl flex flex-col items-center mb-6">
                {data.titlePageTitle?.trim() && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-4xl md:text-6xl font-serif text-white font-light tracking-tight px-2 max-w-3xl shadow-black drop-shadow-2xl"
                  >
                    {data.titlePageTitle}
                  </motion.h1>
                )}
                {data.titlePageSubtitle?.trim() && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-base md:text-lg text-gray-300 font-mono tracking-widest uppercase max-w-2xl drop-shadow-lg mt-6"
                  >
                    {data.titlePageSubtitle}
                  </motion.p>
                )}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{
                delay: 1.2,
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-orange-500 font-mono text-sm tracking-widest uppercase flex flex-col items-center mt-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              Click to Enter
              <div className="w-px h-8 bg-orange-500/50 mt-4"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Zoomable Content Wrapper (simulates Ctrl + Wheel browser zoom on layouts) */}
      <div
        className="flex-1 flex flex-col overflow-hidden relative w-full h-[100vh] origin-top"
        style={{ zoom: zoomScale / 100 }}
      >
        {/* Top Event Detail Panel */}
        <div
          className="relative border-b border-white/5 overflow-hidden animate-in fade-in duration-500"
          style={
            activeEvent?.backgroundColor?.startsWith("http")
              ? {
                  backgroundImage: `url(${activeEvent.backgroundColor})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#0f0f12",
                  height: `calc(${100 - timelineHeight}% - 11px)`,
                }
              : {
                  backgroundColor: activeEvent?.backgroundColor || "#0f0f12",
                  backgroundImage: activeEvent?.backgroundColor
                    ? "none"
                    : "linear-gradient(to bottom, #1a1a20, #0f0f12)",
                  height: `calc(${100 - timelineHeight}% - 11px)`,
                }
          }
        >
          <div className="w-full h-full overflow-hidden p-4 md:p-8 flex items-center justify-center relative">
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={direction}
            >
              {activeEvent ? (
                <motion.div
                  key={activeEvent.id}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? "100%" : "-100%",
                      opacity: 0,
                      scale: 0.98,
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1,
                      scale: 1,
                    },
                    exit: (dir: number) => ({
                      zIndex: 0,
                      x: dir < 0 ? "100%" : "-100%",
                      opacity: 0,
                      scale: 0.98,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 220, damping: 26 },
                    opacity: { duration: 0.25, ease: "easeInOut" },
                    scale: { duration: 0.25, ease: "easeOut" },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    const swipeThreshold = 50; // px
                    if (info.offset.x < -swipeThreshold) {
                      if (nextEvent) {
                        handleEventChange(nextEvent.id);
                      }
                    } else if (info.offset.x > swipeThreshold) {
                      if (prevEvent) {
                        handleEventChange(prevEvent.id);
                      }
                    }
                  }}
                  className="w-full h-full md:h-[94%] md:top-[3%] md:bottom-[3%] max-w-[1700px] absolute px-4 md:px-12 overflow-hidden cursor-grab active:cursor-grabbing select-none"
                >
                  {/* MOBILE VIEW LAYOUT (visible on small/medium screens below md) */}
                  <div className="flex md:hidden flex-col w-full h-full overflow-y-auto custom-scrollbar pb-16 pt-3 px-2 gap-1.5">
                    {/* 1. Title */}
                    {activeEvent && (
                      <div
                        className={cn(
                          "flex items-center border p-3 gap-3 rounded-md backdrop-blur-md shadow-lg w-full text-left",
                          !activeCatColor && activeT.bgLight,
                          !activeCatColor && activeT.border,
                        )}
                        style={
                          activeCatColor
                            ? {
                                backgroundColor: "rgba(0,0,0,0.4)",
                                borderColor: `${activeCatColor}4D`,
                              }
                            : undefined
                        }
                      >
                        <div
                          className={cn(
                            "w-1 self-stretch rounded flex-shrink-0",
                            !activeCatColor && activeT.bgSolid,
                          )}
                          style={
                            activeCatColor
                              ? { backgroundColor: activeCatColor }
                              : undefined
                          }
                        ></div>
                        <h1
                          className={cn(
                            "font-bold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all text-left flex-1 py-0.5",
                            !activeEvent.titleSize && "text-xl sm:text-2xl",
                          )}
                          style={{
                            fontFamily:
                              '"Zen Maru Gothic", "M PLUS Rounded 1c", ui-rounded, "Hiragino Maru Gothic ProN", sans-serif',
                            fontSize: activeEvent.titleSize
                              ? `${Math.max(20, activeEvent.titleSize * 0.65)}px`
                              : undefined,
                          }}
                        >
                          {activeEvent.title}
                        </h1>
                      </div>
                    )}

                    {/* 2. Time/Date + Reference button */}
                    <div className="flex items-stretch justify-between gap-2.5 w-full -mt-1">
                      <div
                        className={cn(
                          "border p-2.5 rounded-md backdrop-blur-md shadow-sm w-1/2 text-left",
                          !activeCatColor && activeT.bgLight,
                          !activeCatColor && activeT.border,
                        )}
                        style={
                          activeCatColor
                            ? {
                                backgroundColor: "rgba(0,0,0,0.4)",
                                borderColor: `${activeCatColor}4D`,
                              }
                            : undefined
                        }
                      >
                        <p className="text-gray-300 font-mono text-xs font-bold tracking-[0.15em] uppercase text-left w-full py-0.5">
                          {activeEvent.customDateText ||
                            formatDate(activeEvent.date)}
                        </p>
                      </div>

                      {((activeEvent.referenceImages &&
                        activeEvent.referenceImages.length > 0) ||
                        activeEvent.referenceText) && (
                        <div className="w-1/2 flex">
                          <SciFiButton
                            onClick={() => setShowReferences(true)}
                            text="參考遊戲文本"
                          />
                        </div>
                      )}
                    </div>

                    {/* 3. Media (16:9 aspect-video ratio) */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.15)] border border-cyan-500/20 bg-[#0f0f12] relative flex-shrink-0">
                      {activeEvent.mediaType === "youtube" ? (
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={
                            activeEvent.mediaUrl.includes(
                              "youtube.com/watch?v=",
                            )
                              ? activeEvent.mediaUrl
                                  .replace("watch?v=", "embed/")
                                  .split("&")[0]
                              : activeEvent.mediaUrl.includes("youtu.be/")
                                ? activeEvent.mediaUrl.replace(
                                    "youtu.be/",
                                    "youtube.com/embed/",
                                  )
                                : activeEvent.mediaUrl
                          }
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <img
                          src={
                            activeEvent.mediaUrl ||
                            "https://via.placeholder.com/800x400?text=No+Image"
                          }
                          alt={activeEvent.title}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      )}
                    </div>

                    {/* 4. Text (Content) */}
                    <div
                      className={cn(
                        "flex-grow border p-4 rounded-md backdrop-blur-md shadow-md w-full text-left mt-1",
                        !activeCatColor && activeT.bgLight,
                        !activeCatColor && activeT.border,
                      )}
                      style={
                        activeCatColor
                          ? {
                              backgroundColor: "rgba(0,0,0,0.4)",
                              borderColor: `${activeCatColor}4D`,
                            }
                          : undefined
                      }
                    >
                      <div className="w-full py-0.5">
                        <div
                          className="rich-text w-full max-w-none text-gray-200 text-sm sm:text-base leading-relaxed text-left"
                          dangerouslySetInnerHTML={{
                            __html: activeEvent.content,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP VIEW LAYOUT (visible on md screens and above) */}
                  <div className="hidden md:flex flex-row items-stretch justify-between w-full h-full gap-[2%]">
                    {/* Media Box (Left) */}
                    <div
                      className={cn(
                        "w-full md:w-[50%] lg:w-[55%] flex items-center justify-start relative md:h-full px-0 md:px-2 flex-shrink overflow-hidden",
                        isCompact ? "py-2" : "py-4",
                      )}
                    >
                      <div
                        className="relative w-full h-full max-h-full flex items-center justify-start"
                        style={{ containerType: "size" }}
                      >
                        {(() => {
                          return activeEvent.mediaType === "youtube" ? (
                            <div
                              className="relative group rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)] border border-cyan-500/20 bg-[#0f0f12] ml-0 mr-auto transition-all duration-300"
                              style={{
                                width: "min(100cqw, calc(100cqh * 16 / 9))",
                                height: "min(100cqh, calc(100cqw * 9 / 16))",
                                aspectRatio: "16 / 9",
                              }}
                            >
                              <iframe
                                className="absolute inset-0 w-full h-full z-0"
                                src={
                                  activeEvent.mediaUrl.includes(
                                    "youtube.com/watch?v=",
                                  )
                                    ? activeEvent.mediaUrl
                                        .replace("watch?v=", "embed/")
                                        .split("&")[0]
                                    : activeEvent.mediaUrl.includes("youtu.be/")
                                      ? activeEvent.mediaUrl.replace(
                                          "youtu.be/",
                                          "youtube.com/embed/",
                                        )
                                      : activeEvent.mediaUrl
                                }
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (
                            <div
                              className="relative group rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)] border border-cyan-500/20 bg-[#0f0f12] ml-0 mr-auto transition-all duration-300 flex items-center justify-center"
                              style={{
                                width: "min(100cqw, calc(100cqh * 16 / 9))",
                                height: "min(100cqh, calc(100cqw * 9 / 16))",
                                aspectRatio: "16 / 9",
                              }}
                            >
                              <img
                                src={
                                  activeEvent.mediaUrl ||
                                  "https://via.placeholder.com/800x400?text=No+Image"
                                }
                                alt={activeEvent.title}
                                className="w-full h-full object-cover rounded-2xl bg-[#0f0f12] z-0"
                                draggable={false}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Content Box (Right) */}
                    <div className="w-full md:w-[48%] lg:w-[43%] flex flex-col justify-center text-left relative md:h-full flex-shrink overflow-hidden py-4">
                      <div className="relative z-10 flex flex-col items-start w-full h-full max-h-full py-0">
                        {/* Desktop Title & Date */}
                        <div className="w-full hidden md:block mb-1">
                          {activeEvent && (
                            <div
                              className={cn(
                                "flex items-center border p-3.5 gap-3.5 rounded-lg backdrop-blur-md shadow-2xl w-full text-left mb-1",
                                !activeCatColor && activeT.bgLight,
                                !activeCatColor && activeT.border,
                              )}
                              style={
                                activeCatColor
                                  ? {
                                      backgroundColor: "rgba(0,0,0,0.4)",
                                      borderColor: `${activeCatColor}4D`,
                                    }
                                  : undefined
                              }
                            >
                              <div
                                className={cn(
                                  "w-1.5 self-stretch rounded-full flex-shrink-0",
                                  !activeCatColor && activeT.bgSolid,
                                )}
                                style={
                                  activeCatColor
                                    ? { backgroundColor: activeCatColor }
                                    : undefined
                                }
                              ></div>
                              <h1
                                className="font-bold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all text-xl md:text-2xl lg:text-3xl text-left flex-1"
                                style={{
                                  fontFamily:
                                    '"Zen Maru Gothic", "M PLUS Rounded 1c", ui-rounded, "Hiragino Maru Gothic ProN", sans-serif',
                                  fontSize: activeEvent.titleSize
                                    ? `${activeEvent.titleSize}px`
                                    : undefined,
                                }}
                              >
                                {activeEvent.title}
                              </h1>
                            </div>
                          )}
                          {/* Flex container to place Date and Reference button side-by-side on desktop */}
                          <div className="flex items-stretch justify-between gap-3 w-full mt-1">
                            <div
                              className={cn(
                                "border p-2.5 rounded-lg backdrop-blur-md shadow-xl w-1/2 text-left",
                                !activeCatColor && activeT.bgLight,
                                !activeCatColor && activeT.border,
                              )}
                              style={
                                activeCatColor
                                  ? {
                                      backgroundColor: "rgba(0,0,0,0.4)",
                                      borderColor: `${activeCatColor}4D`,
                                    }
                                  : undefined
                              }
                            >
                              <p className="text-white font-mono text-sm md:text-base font-bold tracking-[0.2em] uppercase drop-shadow-md text-left w-full py-0.5">
                                {activeEvent.customDateText ||
                                  formatDate(activeEvent.date)}
                              </p>
                            </div>

                            {((activeEvent.referenceImages &&
                              activeEvent.referenceImages.length > 0) ||
                              activeEvent.referenceText) && (
                              <div className="w-1/2 flex">
                                <SciFiButton
                                  onClick={() => setShowReferences(true)}
                                  text="參考遊戲文本"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-1 w-full custom-scrollbar pr-0 py-0.5 flex flex-col">
                          <div
                            className={cn(
                              "flex-grow min-h-full border p-4  rounded-lg backdrop-blur-md shadow-2xl w-full text-left",
                              !activeCatColor && activeT.bgLight,
                              !activeCatColor && activeT.border,
                            )}
                            style={
                              activeCatColor
                                ? {
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    borderColor: `${activeCatColor}4D`,
                                  }
                                : undefined
                            }
                          >
                            <div className="w-full py-0.5">
                              <div
                                className="rich-text w-full max-w-none text-gray-200 text-sm md:text-base leading-relaxed text-left"
                                dangerouslySetInnerHTML={{
                                  __html: activeEvent.content,
                                }}
                              />
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full h-full items-center justify-center text-gray-500 absolute"
                >
                  Select an event from the timeline below.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Timeline Lanes panel */}
        <div
          className="border-t border-white/5 relative flex flex-col container-bg shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20"
          style={{
            backgroundColor: data.timelineBackground,
            height: `calc(${timelineHeight}% + 11px)`,
            minHeight: "120px",
          }}
        >
          {/* Scrollable Timeline Area with Frozen Axis */}
          <div
            ref={timelineRef}
            className="flex-1 overflow-x-hidden overflow-y-hidden flex flex-col cursor-grab active:cursor-grabbing custom-scrollbar relative bg-grid-pattern"
            style={{ overflowX: "hidden", margin: 0 }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={handleTimelineScroll}
          >
            <div
              className="min-w-fit flex-1 flex flex-col relative pb-0 overflow-hidden min-h-0"
              style={{ width: "180vw" }}
            >
              {/* Vertically Scrollable Lanes Container */}
              <div 
                ref={lanesRef}
                onScroll={handleLanesScroll}
                className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0"
              >
                <div className="relative w-full min-h-full flex flex-col overflow-hidden">
                  {/* Draw a subtle grid/line */}
                  <div
                    className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #000 1px, transparent 1px)",
                      backgroundSize: "10% 100%",
                    }}
                  ></div>

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
                {data.drawings && data.drawings.length > 0 && (
                  <svg
                    className="absolute inset-0 z-10 pointer-events-none"
                    width={dimensions.width}
                    height={dimensions.height}
                  >
                    {defs}
                    {data.drawings.map((d) => {
                      const getEventCoords = (
                        eventId: string | undefined,
                      ): { x: number; y: number } | null => {
                        if (!eventId) return null;
                        const event = data.events.find((e) => e.id === eventId);
                        if (!event) return null;
                        const laneIndex = categories.indexOf(
                          event.category || "Uncategorized",
                        );
                        if (laneIndex === -1) return null;

                        let leftPerc = event.positionX;
                        if (leftPerc === undefined) {
                          const eventTime = new Date(event.date).getTime();
                          leftPerc = ((eventTime - minDate) / dateRange) * 90 + 5;
                        }
                        leftPerc = Math.max(1, Math.min(99, leftPerc));

                        const absY = laneIndex * 36 + 18;
                        const percY =
                          dimensions.height > 0
                            ? (absY / dimensions.height) * 100
                            : 0;
                        return { x: leftPerc, y: percY };
                      };

                      const getEventCardWidth = (eventId: string | undefined): number => {
                        if (!eventId) return 0;
                        const el = document.getElementById(`timeline-node-${eventId}`);
                        if (el) {
                          return el.getBoundingClientRect().width;
                        }
                        const event = data.events.find((e) => e.id === eventId);
                        const textLength = event?.title ? event.title.length : 12;
                        return 32 + textLength * 7.5;
                      };

                      const getEventCardWidthPercent = (eventId: string | undefined): number => {
                        if (!eventId || dimensions.width === 0) return 0;
                        const pixelWidth = getEventCardWidth(eventId);
                        return (pixelWidth / dimensions.width) * 100;
                      };

                      const toAbsX = (perc: number) =>
                        Math.max(0, (perc / 100) * dimensions.width);
                      const toAbsY = (perc: number) =>
                        Math.max(0, (perc / 100) * dimensions.height);

                      const getAttachmentCoords = (
                        eventId: string | undefined,
                        attachment: 'left' | 'center' | 'right' | undefined,
                        isEnd: boolean = false,
                        otherCoords?: { x: number; y: number } | null
                      ): { x: number; y: number } | null => {
                        if (!eventId) return null;
                        const baseCoords = getEventCoords(eventId);
                        if (!baseCoords) return null;

                        let finalAttachment = attachment;
                        if (!finalAttachment) {
                          if (otherCoords) {
                            if (baseCoords.x < otherCoords.x) {
                              finalAttachment = isEnd ? "left" : "right";
                            } else {
                              finalAttachment = isEnd ? "right" : "left";
                            }
                          } else {
                            finalAttachment = isEnd ? "left" : "right";
                          }
                        }

                        const cardWidthPercent = getEventCardWidthPercent(eventId);
                        let x = baseCoords.x;
                        if (finalAttachment === "center") {
                          x = baseCoords.x + cardWidthPercent / 2;
                        } else if (finalAttachment === "right") {
                          x = baseCoords.x + cardWidthPercent;
                        }

                        return { x, y: baseCoords.y };
                      };

                      const getSnappedCardPoint = (
                        eventId: string | undefined,
                        attachment: "left" | "center" | "right" | undefined,
                        isEnd: boolean,
                        controlPointAbs: { x: number; y: number }
                      ): { x: number; y: number } | null => {
                        if (!eventId) return null;
                        const baseCoords = getEventCoords(eventId);
                        if (!baseCoords) return null;

                        const cardLeft = toAbsX(baseCoords.x);
                        const cardWidth = getEventCardWidth(eventId);
                        const cardRight = cardLeft + cardWidth;
                        const cardCenterY = toAbsY(baseCoords.y);
                        const cardTop = cardCenterY - 13;
                        const cardBottom = cardCenterY + 13;

                        let finalAttachment = attachment;
                        if (!finalAttachment) {
                          if (baseCoords.x < (controlPointAbs.x / (dimensions.width || 1)) * 100) {
                            finalAttachment = isEnd ? "left" : "right";
                          } else {
                            finalAttachment = isEnd ? "right" : "left";
                          }
                        }

                        let anchorX = cardLeft;
                        if (finalAttachment === "center") {
                          anchorX = cardLeft + cardWidth / 2;
                        } else if (finalAttachment === "right") {
                          anchorX = cardRight;
                        }
                        const anchorY = cardCenterY;

                        const ctrlX = controlPointAbs.x;
                        const ctrlY = controlPointAbs.y;

                        let bestT = 1.0;
                        let intersectX = anchorX;
                        let intersectY = anchorY;

                        const checkIntersection = (t: number, x: number, y: number) => {
                          if (t >= 0 && t <= 1 && t < bestT) {
                            bestT = t;
                            intersectX = x;
                            intersectY = y;
                          }
                        };

                        const dx = anchorX - ctrlX;
                        const dy = anchorY - ctrlY;

                        if (Math.abs(dy) > 0.0001) {
                          const t = (cardTop - ctrlY) / dy;
                          const x = ctrlX + t * dx;
                          if (x >= cardLeft - 0.1 && x <= cardRight + 0.1) {
                            checkIntersection(t, x, cardTop);
                          }
                        }

                        if (Math.abs(dy) > 0.0001) {
                          const t = (cardBottom - ctrlY) / dy;
                          const x = ctrlX + t * dx;
                          if (x >= cardLeft - 0.1 && x <= cardRight + 0.1) {
                            checkIntersection(t, x, cardBottom);
                          }
                        }

                        if (Math.abs(dx) > 0.0001) {
                          const t = (cardLeft - ctrlX) / dx;
                          const y = ctrlY + t * dy;
                          if (y >= cardTop - 0.1 && y <= cardBottom + 0.1) {
                            checkIntersection(t, cardLeft, y);
                          }
                        }

                        if (Math.abs(dx) > 0.0001) {
                          const t = (cardRight - ctrlX) / dx;
                          const y = ctrlY + t * dy;
                          if (y >= cardTop - 0.1 && y <= cardBottom + 0.1) {
                            checkIntersection(t, cardRight, y);
                          }
                        }

                        const len = Math.sqrt(dx * dx + dy * dy);
                        const offsetDistance = 3.5;
                        if (len > 0.0001) {
                          const ux = dx / len;
                          const uy = dy / len;
                          intersectX = intersectX - ux * offsetDistance;
                          intersectY = intersectY - uy * offsetDistance;
                        }

                        return { x: intersectX, y: intersectY };
                      };

                      const rawStartCoords = getAttachmentCoords(d.startEventId, d.startAttachment, false, getEventCoords(d.endEventId)) || {
                        x: d.startX,
                        y: d.startY,
                      };
                      const rawEndCoords = getAttachmentCoords(d.endEventId, d.endAttachment, true, getEventCoords(d.startEventId)) || {
                        x: d.endX,
                        y: d.endY,
                      };

                      const rawStartAbsX = toAbsX(rawStartCoords.x);
                      const rawStartAbsY = toAbsY(rawStartCoords.y);
                      const rawEndAbsX = toAbsX(rawEndCoords.x);
                      const rawEndAbsY = toAbsY(rawEndCoords.y);

                      const cAbsX =
                        d.controlX !== undefined
                          ? toAbsX(d.controlX)
                          : (rawStartAbsX + rawEndAbsX) / 2;
                      const cAbsY =
                        d.controlY !== undefined
                          ? toAbsY(d.controlY)
                          : dimensions.height > 0
                            ? Math.min(rawStartAbsY, rawEndAbsY) - 20
                            : rawStartAbsY - 20;

                      const ctrlPoint = { x: cAbsX, y: cAbsY };

                      const snStart = d.startEventId ? getSnappedCardPoint(d.startEventId, d.startAttachment, false, ctrlPoint) : null;
                      const snEnd = d.endEventId ? getSnappedCardPoint(d.endEventId, d.endAttachment, true, ctrlPoint) : null;

                      const arrowStartX = snStart ? snStart.x : rawStartAbsX;
                      const arrowStartY = snStart ? snStart.y : rawStartAbsY;
                      const arrowEndX = snEnd ? snEnd.x : rawEndAbsX;
                      const arrowEndY = snEnd ? snEnd.y : rawEndAbsY;

                      const pathD = `M ${arrowStartX} ${arrowStartY} Q ${cAbsX} ${cAbsY} ${arrowEndX} ${arrowEndY}`;
                      const color = d.color || "#fb923c";

                      return (
                        <path
                          key={d.id}
                          d={pathD}
                          stroke={color}
                          strokeWidth="3"
                          fill="none"
                          markerEnd={`url(#arrowhead-${color.replace("#", "")})`}
                        />
                      );
                    })}
                  </svg>
                )}

                {/* Lanes Wrapper */}
                <div className="relative w-full flex flex-col shrink-0 pb-[3px] pointer-events-none z-20">
                  {categories.map((category, idx) => {
                    const categoryEvents = sortedEvents.filter(
                      (e) => e.category === category,
                    );
                    const customColor = categoryEvents.find(
                      (e) => e.categoryColor,
                    )?.categoryColor;

                    const themeColors = [
                      {
                        text: "text-orange-400",
                        bgLight: "bg-orange-500/10",
                        bgSolid: "bg-orange-500",
                        border: "border-orange-500/90",
                      },
                      {
                        text: "text-sky-400",
                        bgLight: "bg-sky-500/10",
                        bgSolid: "bg-sky-500",
                        border: "border-sky-500/90",
                      },
                      {
                        text: "text-emerald-400",
                        bgLight: "bg-emerald-500/10",
                        bgSolid: "bg-emerald-500",
                        border: "border-emerald-500/90",
                      },
                      {
                        text: "text-purple-400",
                        bgLight: "bg-purple-500/10",
                        bgSolid: "bg-purple-500",
                        border: "border-purple-500/90",
                      },
                    ];
                    const t = themeColors[idx % themeColors.length];

                    return (
                      <div
                        key={category}
                        className="h-9 border-b border-white/5 relative flex items-center shrink-0 pointer-events-none"
                      >
                        {/* Lane Label */}
                        <div className="lane-label sticky left-0 top-0 bottom-0 min-h-[32px] w-28 md:w-32 bg-[#08080a]/70 backdrop-blur-sm flex items-center justify-start px-3 py-1 z-40 border-r border-[#08080a]/50 shadow-[4px_0_15px_rgba(0,0,0,0.3)] gap-2 flex-shrink-0 transition-none transform-gpu pointer-events-auto">
                          <div
                            className={cn(
                              "w-2 h-2 shrink-0",
                              !customColor && t.bgSolid,
                            )}
                            style={
                              customColor
                                ? { backgroundColor: customColor }
                                : undefined
                            }
                          ></div>
                          <span
                            className={`text-sm sm:text-base uppercase tracking-wider text-gray-300 font-bold truncate`}
                          >
                            {category}
                          </span>
                        </div>

                        {/* Events in this lane */}
                        <div className="absolute inset-0">
                          {categoryEvents.map((event) => {
                            // Calculate left position percentage
                            const eventTime = new Date(event.date).getTime();
                            // Avoid overlapping identically timed events slightly by adding index jitter if needed, but percentage is fine.
                            const leftPerc =
                              event.positionX !== undefined
                                ? event.positionX
                                : ((eventTime - minDate) / dateRange) * 90 + 5;

                            const isActive = activeEventId === event.id;
                            const catColor = event.categoryColor || (
                              idx % 4 === 0 ? '#f97316' :
                              idx % 4 === 1 ? '#0ea5e9' :
                              idx % 4 === 2 ? '#10b981' : '#a855f7'
                            );

                            return (
                              <div
                                key={event.id}
                                id={`timeline-node-${event.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventChange(event.id);
                                }}
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:z-30 pointer-events-auto",
                                  isActive
                                    ? "z-20 scale-105"
                                    : "z-10 hover:scale-[1.02]",
                                )}
                                style={{
                                  left: `${Math.max(1, leftPerc)}%`, // At least a tiny margin
                                }}
                              >
                                {/* Vertical white/light line extending down to bottom axis */}
                                <div 
                                  className="absolute left-0 top-[14px] w-px h-[1000px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none -z-10" 
                                />

                                <div
                                  className="relative group/tag transition-transform hover:scale-105"
                                  style={{
                                    background: `linear-gradient(135deg, #ffffff 0%, #b8bfc6 20%, #eff2f5 35%, #7e8790 55%, #ffffff 75%, #a2aab3 100%)`,
                                    padding: '1.5px',
                                    borderRadius: '6px',
                                    boxShadow: isActive
                                      ? `0 0 14px ${catColor}, inset 0 1px 1px rgba(255,255,255,0.9)`
                                      : `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.8), 0 0 3px ${catColor}50`
                                  }}
                                >
                                  {/* Category Color Filter Overlay on the metallic border */}
                                  <div 
                                    className="absolute inset-0 rounded-[6px] pointer-events-none mix-blend-color opacity-85"
                                    style={{ backgroundColor: catColor }}
                                  />
                                  <div 
                                    className="absolute inset-[1px] rounded-[5px] pointer-events-none mix-blend-overlay opacity-30"
                                    style={{ backgroundColor: catColor }}
                                  />

                                  {/* Inner sleek carbon black glossy container */}
                                  <div 
                                    className={cn(
                                      "relative flex h-7 sm:h-8 items-center px-2.5 py-0.5 gap-2 overflow-hidden bg-black/95 text-white transition-all duration-200"
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

                                    {/* Small neon color status indicator line like the title with a matching glow */}
                                    <div 
                                      className="w-1 h-3.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                      style={{ 
                                        backgroundColor: catColor, 
                                        boxShadow: `0 0 6px ${catColor}, 0 0 12px ${catColor}` 
                                      }}
                                    />

                                    <span className={cn(
                                      "text-xs sm:text-xs md:text-sm font-black uppercase tracking-wider truncate max-w-[200px] sm:max-w-[260px] select-none pointer-events-none relative z-10",
                                      isActive ? "text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" : "text-gray-300"
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
                    );
                  })}
                </div>
              </div>
            </div>

              {/* Static Frozen Axis Labels at the bottom of viewport container */}
              {data.axisLabels && data.axisLabels.length > 0 && (
                <div 
                  className="h-10 border-t border-white/10 flex items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md shrink-0 relative"
                  style={{ backgroundColor: data.timelineBackground || "#08080a" }}
                >
                  {data.axisLabels.map((label) => (
                    <div
                      key={label.id}
                      className="absolute flex flex-col items-center -translate-x-1/2 pb-1.5"
                      style={{ left: `${label.positionX}%` }}
                    >
                      <div className="w-[2px] h-3 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] mb-1 leading-none"></div>
                      <span className="text-xs sm:text-sm text-cyan-300 font-mono font-extrabold tracking-wider whitespace-nowrap drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]">
                        {label.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
      </div>{" "}
      {/* End Zoomable Content Wrapper */}
      {/* Reference Imges Overlay Modal */}
      {showReferences &&
        activeEvent &&
        ((activeEvent.referenceImages &&
          activeEvent.referenceImages.length > 0) ||
          activeEvent.referenceText) && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1a1a20] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-serif text-lg text-white font-light">
                  遊戲文本參考 -{" "}
                  <span className="font-bold text-orange-400">
                    {activeEvent.title}
                  </span>
                </h3>
                <button
                  onClick={() => setShowReferences(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex flex-col auto-rows-max gap-6 custom-scrollbar bg-[#0f0f12]">
                {/* Reference Text (Always display on complete top) */}
                {activeEvent.referenceText && (
                  <div
                    className="text-gray-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap text-left tracking-wide p-5 bg-white/[0.02] border border-white/5 rounded-xl shadow-inner"
                    style={{
                      fontFamily:
                        '"Zen Maru Gothic", "M PLUS Rounded 1c", ui-rounded, "Hiragino Maru Gothic ProN", sans-serif',
                    }}
                  >
                    {activeEvent.referenceText}
                  </div>
                )}

                {activeEvent.referenceImages &&
                activeEvent.referenceImages.length > 0
                  ? activeEvent.referenceImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-auto rounded-xl shadow-lg border border-white/5 max-w-full mx-auto"
                      />
                    ))
                  : !activeEvent.referenceText && (
                      <div className="text-center py-12 text-gray-600 font-mono text-sm uppercase tracking-widest">
                        No Reference Content
                      </div>
                    )}
              </div>
            </div>
          </div>
        )}
      {/* Zoom Scale Controller */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] flex items-center justify-center pointer-events-none scale-[0.6] origin-bottom">
        <div className="bg-[#1a1a20]/95 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.18)] rounded-full px-3.5 py-1.5 flex items-center gap-2 pointer-events-auto transition-all duration-300">
          <button
            onClick={() => setZoomScale((prev) => Math.max(80, prev - 10))}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
            title="縮小"
          >
            <ZoomOut size={14} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-400 select-none">
              縮小
            </span>
            <input
              type="range"
              min="80"
              max="180"
              step="5"
              value={zoomScale}
              onChange={(e) => setZoomScale(Number(e.target.value))}
              className="w-16 sm:w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-0"
            />
            <span className="text-[9px] font-bold text-cyan-400 select-none">
              放大
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 min-w-[2.2rem] text-center select-none ml-1 bg-cyan-950/45 px-1 py-0.5 rounded border border-cyan-500/20">
              {zoomScale}%
            </span>
          </div>
          <button
            onClick={() => setZoomScale((prev) => Math.min(180, prev + 10))}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
            title="放大"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
