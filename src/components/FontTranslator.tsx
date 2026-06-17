import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, RefreshCw, Copy, Check, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Let's design 3 sets of distinctive procedural sci-fi SVG glyph mappings for text A-Z, 0-9.
// This ensures we get true high-fidelity vector symbols that load immediately and look amazing.

type FontStyle = 'wuthering' | 'ancient' | 'architect' | 'wuwa_jitin' | 'wuwa_ragunna' | 'wuwa_septimont' | 'wuwa_lahairoi';

interface GlyphProps {
  char: string;
  style: FontStyle;
  className?: string;
  size?: number;
}

// Custom procedural SVG definitions for each character to match the cyber runic/blocky designs
const GLYPHS_WUTHERING: Record<string, React.ReactNode> = {
  A: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 80 Q 50 15 80 80" />
      <path d="M 30 50 L 70 50" />
      <line x1="50" y1="15" x2="50" y2="35" strokeWidth="8" />
      <rect x="42" y="58" width="16" height="8" fill="currentColor" stroke="none" />
    </g>
  ),
  B: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 20 L 70 20 C 85 20, 85 45, 70 45 L 20 45" />
      <path d="M 20 45 L 75 45 C 90 45, 90 80, 70 80 L 20 80 Z" />
      <line x1="45" y1="20" x2="45" y2="80" strokeWidth="4" />
      <circle cx="45" cy="45" r="4" fill="currentColor" stroke="none" />
    </g>
  ),
  C: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 80 30 L 35 20 C 15 25, 15 75, 35 80 L 80 70" />
      <line x1="15" y1="50" x2="35" y2="50" strokeWidth="8" />
      <rect x="45" y="45" width="10" height="10" fill="currentColor" stroke="none" />
    </g>
  ),
  D: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 20 L 55 20 C 85 20, 85 80, 55 80 L 20 80 Z" />
      <line x1="40" y1="35" x2="40" y2="65" strokeWidth="8" />
      <line x1="60" y1="50" x2="75" y2="50" strokeWidth="4" />
    </g>
  ),
  E: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 80 20 L 20 20 L 20 80 L 80 80" />
      <path d="M 20 50 L 70 50" strokeWidth="8" />
      <circle cx="50" cy="32" r="5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="68" r="5" fill="currentColor" stroke="none" />
    </g>
  ),
  F: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 80 20 L 20 20 L 20 80" />
      <path d="M 20 48 L 70 48" strokeWidth="8" />
      <line x1="50" y1="65" x2="70" y2="65" strokeWidth="4" />
    </g>
  ),
  G: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 80 35 C 75 15, 25 15, 20 50 C 20 80, 75 80, 80 55 M 50 55 L 80 55" />
      <rect x="35" y="35" width="8" height="8" fill="currentColor" stroke="none" />
    </g>
  ),
  H: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="20" x2="20" y2="80" />
      <line x1="80" y1="20" x2="80" y2="80" />
      <path d="M 20 50 L 80 50" strokeWidth="9" />
      <circle cx="50" cy="30" r="6" fill="currentColor" stroke="none" />
      <circle cx="50" cy="70" r="6" fill="currentColor" stroke="none" />
    </g>
  ),
  I: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="30" y1="20" x2="70" y2="20" />
      <line x1="50" y1="20" x2="50" y2="80" strokeWidth="8" />
      <line x1="30" y1="80" x2="70" y2="80" />
      <rect x="44" y="44" width="12" height="12" fill="currentColor" stroke="none" />
    </g>
  ),
  J: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="50" y1="20" x2="80" y2="20" />
      <path d="M 65 20 L 65 68 C 65 80, 30 85, 25 65" />
      <circle cx="45" cy="45" r="5" fill="currentColor" stroke="none" />
    </g>
  ),
  K: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="20" x2="20" y2="80" strokeWidth="7" />
      <path d="M 75 20 L 25 50 L 75 80" />
      <line x1="45" y1="38" x2="70" y2="38" strokeWidth="4" />
      <line x1="45" y1="62" x2="70" y2="62" strokeWidth="4" />
    </g>
  ),
  L: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="25" y1="20" x2="25" y2="80" strokeWidth="8" />
      <line x1="25" y1="80" x2="80" y2="80" />
      <rect x="42" y="35" width="16" height="16" fill="currentColor" stroke="none" />
    </g>
  ),
  M: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 15 80 L 15 20 L 50 55 L 85 20 L 85 80" />
      <line x1="50" y1="55" x2="50" y2="80" strokeWidth="4" />
      <circle cx="30" cy="35" r="4" fill="currentColor" stroke="none" />
      <circle cx="70" cy="35" r="4" fill="currentColor" stroke="none" />
    </g>
  ),
  N: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 80 L 20 20 L 80 80 L 80 20" />
      <rect x="44" y="44" width="12" height="12" fill="currentColor" stroke="none" opacity="0.8" />
      <line x1="50" y1="20" x2="50" y2="40" strokeWidth="3" />
    </g>
  ),
  O: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="20" width="60" height="60" rx="10" />
      <line x1="20" y1="50" x2="80" y2="50" strokeWidth="3" />
      <line x1="50" y1="20" x2="50" y2="80" strokeWidth="3" />
    </g>
  ),
  P: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 80 L 20 20 L 70 20 C 85 20, 85 48, 70 48 L 20 48" />
      <circle cx="45" cy="34" r="5" fill="currentColor" stroke="none" />
      <line x1="45" y1="62" x2="65" y2="62" strokeWidth="8" />
    </g>
  ),
  Q: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="45" cy="45" rx="25" ry="25" />
      <line x1="62" y1="62" x2="85" y2="85" strokeWidth="8" />
      <line x1="30" y1="45" x2="60" y2="45" />
    </g>
  ),
  R: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 80 L 20 20 L 70 20 C 85 20, 85 48, 70 48 L 20 48 M 50 48 L 80 80" />
      <circle cx="45" cy="34" r="5" fill="currentColor" stroke="none" />
    </g>
  ),
  S: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 75 30 C 70 15, 30 15, 25 35 C 20 60, 80 50, 75 70 C 70 85, 30 85, 25 70" />
      <line x1="20" y1="25" x2="35" y2="25" strokeWidth="4" />
      <line x1="65" y1="75" x2="80" y2="75" strokeWidth="4" />
    </g>
  ),
  T: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="15" y1="20" x2="85" y2="20" strokeWidth="8" />
      <line x1="50" y1="20" x2="50" y2="80" />
      <circle cx="30" cy="50" r="5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="50" r="5" fill="currentColor" stroke="none" />
    </g>
  ),
  U: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 20 L 20 65 C 20 80, 80 80, 80 65 L 80 20" />
      <rect x="44" y="40" width="12" height="12" fill="currentColor" stroke="none" />
    </g>
  ),
  V: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 15 20 L 50 80 L 85 20" />
      <line x1="30" y1="20" x2="70" y2="20" strokeWidth="3" />
      <circle cx="50" cy="40" r="6" fill="currentColor" stroke="none" />
    </g>
  ),
  W: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 15 20 L 30 80 L 50 40 L 70 80 L 85 20" />
      <circle cx="35" cy="30" r="4" fill="currentColor" stroke="none" />
      <circle cx="65" cy="30" r="4" fill="currentColor" stroke="none" />
    </g>
  ),
  X: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="20" x2="80" y2="80" />
      <line x1="80" y1="20" x2="20" y2="80" />
      <rect x="42" y="15" width="16" height="8" fill="currentColor" stroke="none" />
      <rect x="42" y="77" width="16" height="8" fill="currentColor" stroke="none" />
    </g>
  ),
  Y: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 20 L 50 50 L 80 20 M 50 50 L 50 80" />
      <circle cx="50" cy="65" r="5" fill="currentColor" stroke="none" />
    </g>
  ),
  Z: (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 20 L 80 20 L 20 80 L 80 80" />
      <line x1="32" y1="50" x2="68" y2="50" strokeWidth="7" />
    </g>
  ),
  '0': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <rect x="25" y="20" width="50" height="60" rx="10" />
      <line x1="75" y1="20" x2="25" y2="80" strokeWidth="4" />
    </g>
  ),
  '1': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 35 30 L 50 20 L 50 80 M 35 80 L 65 80" />
    </g>
  ),
  '2': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 25 35 C 25 15, 75 15, 75 35 C 75 60, 25 60, 25 80 L 75 80" />
    </g>
  ),
  '3': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 25 25 C 50 15, 80 20, 65 45 C 80 60, 50 82, 25 70" />
      <line x1="45" y1="46" x2="65" y2="46" strokeWidth="4" />
    </g>
  ),
  '4': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 55 15 L 25 55 L 75 55 M 55 15 L 55 80" />
    </g>
  ),
  '5': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 75 20 L 30 20 L 25 50 C 35 40, 75 42, 70 70 C 65 85, 30 85, 25 70" />
    </g>
  ),
  '6': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 70 20 C 30 20, 20 40, 20 60 C 20 80, 70 80, 70 55 C 70 35, 30 35, 20 50" />
    </g>
  ),
  '7': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 25 20 L 75 20 L 40 80" />
      <line x1="45" y1="50" x2="65" y2="50" strokeWidth="4" />
    </g>
  ),
  '8': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <circle cx="50" cy="35" r="18" />
      <circle cx="50" cy="65" r="19" />
      <line x1="30" y1="50" x2="70" y2="50" strokeWidth="3" />
    </g>
  ),
  '9': (
    <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M 30 80 C 70 80, 80 60, 80 40 C 80 20, 30 20, 30 45 C 30 65, 70 65, 80 50" />
    </g>
  ),
};

// Style 2: Intricate runic circles and star networks ("先民字體")
const GLYPHS_ANCIENT: Record<string, React.ReactNode> = {
  A: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="50" y1="10" x2="50" y2="90" />
      <circle cx="50" cy="50" r="30" />
      <path d="M 20 50 L 50 20 L 80 50" strokeWidth="6" />
      <circle cx="50" cy="20" r="4" fill="currentColor" />
    </g>
  ),
  B: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="35" cy="35" r="20" />
      <circle cx="65" cy="65" r="20" />
      <line x1="35" y1="55" x2="65" y2="45" strokeWidth="6" />
      <line x1="20" y1="20" x2="80" y2="80" />
    </g>
  ),
  C: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="50" r="35" strokeDasharray="180 50" />
      <line x1="15" y1="50" x2="85" y2="50" strokeWidth="5" />
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </g>
  ),
  D: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 25 15 L 25 85 C 65 85, 85 65, 85 50 C 85 35, 65 15, 25 15 Z" />
      <circle cx="55" cy="50" r="15" />
      <line x1="25" y1="50" x2="40" y2="50" strokeWidth="6" />
    </g>
  ),
  E: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="20" y1="50" x2="80" y2="50" strokeWidth="6" />
      <line x1="35" y1="20" x2="35" y2="80" />
      <line x1="65" y1="20" x2="65" y2="80" />
      <circle cx="50" cy="50" r="12" />
      <circle cx="50" cy="20" r="5" fill="currentColor" />
      <circle cx="50" cy="80" r="5" fill="currentColor" />
    </g>
  ),
  F: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="30" y1="15" x2="30" y2="85" strokeWidth="6" />
      <line x1="30" y1="30" x2="80" y2="30" />
      <line x1="30" y1="55" x2="70" y2="55" />
      <circle cx="80" cy="30" r="4" fill="currentColor" />
      <circle cx="70" cy="55" r="4" fill="currentColor" />
      <path d="M 30 85 L 60 85" />
    </g>
  ),
  G: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="50" r="30" />
      <path d="M 60 50 A 10 10 0 1 1 50 60 L 50 85" />
      <line x1="20" y1="20" x2="80" y2="80" strokeDasharray="5 5" />
    </g>
  ),
  H: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="25" y1="15" x2="25" y2="85" />
      <line x1="75" y1="15" x2="75" y2="85" />
      <circle cx="50" cy="50" r="20" />
      <line x1="15" y1="50" x2="85" y2="50" strokeWidth="2" />
      <circle cx="25" cy="50" r="5" fill="currentColor" />
      <circle cx="75" cy="50" r="5" fill="currentColor" />
    </g>
  ),
  I: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="50" y1="15" x2="50" y2="85" strokeWidth="8" />
      <circle cx="50" cy="25" r="12" />
      <circle cx="50" cy="75" r="12" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </g>
  ),
  J: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="30" r="12" />
      <path d="M 50 42 L 50 70 A 15 15 0 0 1 25 75" strokeWidth="6" />
      <circle cx="25" cy="75" r="4" fill="currentColor" />
    </g>
  ),
  K: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="30" y1="15" x2="30" y2="85" strokeWidth="5" />
      <path d="M 75 20 L 32 50 L 75 80" strokeWidth="5" />
      <circle cx="50" cy="38" r="8" />
      <circle cx="50" cy="62" r="8" />
    </g>
  ),
  L: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="30" y1="15" x2="30" y2="80" strokeWidth="6" />
      <line x1="30" y1="80" x2="80" y2="80" strokeWidth="6" />
      <circle cx="55" cy="45" r="15" strokeDasharray="10 5" />
    </g>
  ),
  M: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 20 80 L 35 25 L 50 60 L 65 25 L 80 80" />
      <circle cx="50" cy="60" r="6" fill="currentColor" />
      <line x1="20" y1="80" x2="80" y2="80" strokeWidth="2" />
    </g>
  ),
  N: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 20 80 L 20 20 L 80 80 L 80 20" />
      <circle cx="50" cy="50" r="16" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </g>
  ),
  O: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="50" r="32" />
      <circle cx="50" cy="50" r="16" strokeDasharray="6 6" />
      <line x1="15" y1="15" x2="85" y2="85" strokeWidth="2" />
    </g>
  ),
  P: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="25" y1="80" x2="25" y2="20" strokeWidth="5" />
      <path d="M 25 20 C 60 20, 60 50, 25 50" strokeWidth="5" />
      <circle cx="45" cy="35" r="8" />
      <circle cx="25" cy="65" r="5" fill="currentColor" />
    </g>
  ),
  Q: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="45" cy="45" r="25" />
      <line x1="45" y1="45" x2="80" y2="80" strokeWidth="6" />
      <circle cx="80" cy="80" r="5" fill="currentColor" />
    </g>
  ),
  R: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="25" y1="80" x2="25" y2="20" strokeWidth="5" />
      <path d="M 25 20 C 60 20, 60 50, 25 50" strokeWidth="5" />
      <path d="M 25 50 L 75 80" strokeWidth="5" />
      <circle cx="50" cy="65" r="8" />
    </g>
  ),
  S: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 70 30 C 65 15, 35 15, 30 35 C 25 55, 75 45, 70 65 C 65 80, 35 80, 30 65" />
      <circle cx="50" cy="25" r="6" />
      <circle cx="50" cy="75" r="6" />
    </g>
  ),
  T: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="15" y1="25" x2="85" y2="25" strokeWidth="6" />
      <line x1="50" y1="25" x2="50" y2="85" />
      <circle cx="50" cy="55" r="16" />
      <line x1="34" y1="55" x2="66" y2="55" strokeWidth="2" />
    </g>
  ),
  U: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 25 15 L 25 60 C 25 80, 75 80, 75 60 L 75 15" strokeWidth="5" />
      <circle cx="50" cy="70" r="8" />
      <line x1="15" y1="35" x2="85" y2="35" strokeDasharray="3 3" />
    </g>
  ),
  V: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 20 20 L 50 80 L 80 20" strokeWidth="5" />
      <circle cx="50" cy="35" r="14" />
      <circle cx="50" cy="35" r="4" fill="currentColor" />
    </g>
  ),
  W: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 20 20 L 35 80 L 50 45 L 65 80 L 80 20" />
      <circle cx="50" cy="30" r="5" fill="currentColor" />
      <circle cx="35" cy="65" r="4" fill="currentColor" />
      <circle cx="65" cy="65" r="4" fill="currentColor" />
    </g>
  ),
  X: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="20" y1="20" x2="80" y2="80" strokeWidth="5" />
      <line x1="80" y1="20" x2="20" y2="80" strokeWidth="5" />
      <circle cx="50" cy="50" r="15" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </g>
  ),
  Y: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 20 20 L 50 50 L 80 20 M 50 50 L 50 85" strokeWidth="5" />
      <circle cx="50" cy="68" r="10" />
    </g>
  ),
  Z: (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 20 20 L 80 20 L 20 80 L 80 80" strokeWidth="5" />
      <circle cx="35" cy="50" r="12" strokeDasharray="5 2" />
      <line x1="20" y1="20" x2="80" y2="80" strokeWidth="1" />
    </g>
  ),
  '0': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="50" r="30" />
      <line x1="30" y1="30" x2="70" y2="70" strokeWidth="3" />
    </g>
  ),
  '1': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <line x1="50" y1="20" x2="50" y2="80" strokeWidth="6" />
      <circle cx="50" cy="50" r="10" />
    </g>
  ),
  '2': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 25 35 C 25 15, 75 15, 75 35 C 75 60, 25 60, 25 80 L 75 80" />
      <circle cx="50" cy="35" r="5" fill="currentColor" />
    </g>
  ),
  '3': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 25 25 C 50 15, 80 20, 65 45 C 80 60, 50 82, 25 70" />
      <circle cx="45" cy="45" r="4" fill="currentColor" />
    </g>
  ),
  '4': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 55 15 L 25 55 L 75 55 M 55 15 L 55 80" />
      <circle cx="55" cy="35" r="4" fill="currentColor" />
    </g>
  ),
  '5': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 75 20 L 30 20 L 25 50 C 35 40, 75 42, 70 70 C 65 85, 30 85, 25 70" />
      <circle cx="50" cy="55" r="4" fill="currentColor" />
    </g>
  ),
  '6': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 70 20 C 30 20, 20 40, 20 60 C 20 80, 70 80, 70 55 C 70 35, 30 35, 20 50" />
      <circle cx="45" cy="60" r="4" fill="currentColor" />
    </g>
  ),
  '7': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <path d="M 25 20 L 75 20 L 40 80" />
      <circle cx="50" cy="20" r="4" fill="currentColor" />
    </g>
  ),
  '8': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="32" r="14" />
      <circle cx="50" cy="64" r="16" />
    </g>
  ),
  '9': (
    <g stroke="currentColor" strokeWidth="4" fill="none">
      <circle cx="50" cy="36" r="16" />
      <path d="M 66 36 L 66 70 A 10 10 0 0 1 50 80" />
    </g>
  ),
};

// Style 3: Minimalist clean cyber grids ("天工字體")
const GLYPHS_ARCHITECT: Record<string, React.ReactNode> = {
  A: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 15 85 L 50 15 L 85 85" />
      <rect x="40" y="45" width="20" height="6" fill="currentColor" stroke="none" />
    </g>
  ),
  B: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <rect x="20" y="20" width="45" height="60" />
      <line x1="65" y1="20" x2="80" y2="35" />
      <line x1="65" y1="80" x2="80" y2="65" />
      <line x1="20" y1="50" x2="65" y2="50" />
    </g>
  ),
  C: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 80 20 L 20 20 L 20 80 L 80 80" />
      <line x1="50" y1="20" x2="50" y2="80" strokeWidth="1" strokeDasharray="4 4" />
    </g>
  ),
  D: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 20 L 60 20 L 80 40 L 80 60 L 60 80 L 20 80 Z" />
      <circle cx="45" cy="50" r="5" fill="currentColor" stroke="none" />
    </g>
  ),
  E: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 80 20 L 20 20 L 20 80 L 80 80" />
      <line x1="20" y1="50" x2="70" y2="50" />
    </g>
  ),
  F: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 80 20 L 20 20 L 20 80" />
      <line x1="20" y1="46" x2="70" y2="46" />
    </g>
  ),
  G: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 80 40 L 80 20 L 20 20 L 20 80 L 80 80 L 80 50 L 50 50" />
    </g>
  ),
  H: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="20" y1="20" x2="20" y2="80" />
      <line x1="80" y1="20" x2="80" y2="80" />
      <line x1="20" y1="50" x2="80" y2="50" />
      <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
    </g>
  ),
  I: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="30" y1="20" x2="70" y2="20" />
      <line x1="50" y1="20" x2="50" y2="80" />
      <line x1="30" y1="80" x2="70" y2="80" />
    </g>
  ),
  J: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="45" y1="20" x2="80" y2="20" />
      <path d="M 62 20 L 62 70 C 62 82, 35 82, 25 70" />
    </g>
  ),
  K: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="20" y1="20" x2="20" y2="80" />
      <path d="M 75 20 L 25 50 L 75 80" />
    </g>
  ),
  L: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="25" y1="20" x2="25" y2="80" />
      <line x1="25" y1="80" x2="80" y2="80" />
    </g>
  ),
  M: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 15 80 L 15 20 L 50 55 L 85 20 L 85 80" />
    </g>
  ),
  N: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 80 L 20 20 L 80 80 L 80 20" />
    </g>
  ),
  O: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <rect x="20" y="20" width="60" height="60" />
    </g>
  ),
  P: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 80 L 20 20 L 75 20 L 75 50 L 20 50" />
    </g>
  ),
  Q: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <rect x="20" y="20" width="55" height="55" />
      <line x1="55" y1="55" x2="80" y2="80" />
    </g>
  ),
  R: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 80 L 20 20 L 75 20 L 75 50 L 20 50" />
      <line x1="48" y1="50" x2="80" y2="80" />
    </g>
  ),
  S: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 80 20 L 20 20 L 20 50 L 80 50 L 80 80 L 20 80" />
    </g>
  ),
  T: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="15" y1="20" x2="85" y2="20" />
      <line x1="50" y1="20" x2="50" y2="80" />
    </g>
  ),
  U: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 20 L 20 80 L 80 80 L 80 20" />
    </g>
  ),
  V: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 15 20 L 50 80 L 85 20" />
    </g>
  ),
  W: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 15 20 L 30 80 L 50 45 L 70 80 L 85 20" />
    </g>
  ),
  X: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <line x1="20" y1="20" x2="80" y2="80" />
      <line x1="80" y1="20" x2="20" y2="80" />
    </g>
  ),
  Y: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 20 L 50 50 L 80 20 M 50 50 L 50 80" />
    </g>
  ),
  Z: (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
      <path d="M 20 20 L 80 20 L 20 80 L 80 80" />
    </g>
  ),
  '0': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <rect x="25" y="20" width="50" height="60" />
    </g>
  ),
  '1': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <line x1="50" y1="20" x2="50" y2="80" />
    </g>
  ),
  '2': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 20 20 L 80 20 L 80 50 L 20 50 L 20 80 L 80 80" />
    </g>
  ),
  '3': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 20 20 L 80 20 L 80 80 L 20 80 M 20 50 L 80 50" />
    </g>
  ),
  '4': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 20 20 L 20 50 L 80 50 M 80 20 L 80 80" />
    </g>
  ),
  '5': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 80 20 L 20 20 L 20 50 L 80 50 L 80 80 L 20 80" />
    </g>
  ),
  '6': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 80 20 L 20 20 L 20 80 L 80 80 L 80 50 L 20 50" />
    </g>
  ),
  '7': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 20 20 L 80 20 L 80 80" />
    </g>
  ),
  '8': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <rect x="20" y="20" width="60" height="60" />
      <line x1="20" y1="50" x2="80" y2="50" />
    </g>
  ),
  '9': (
    <g stroke="currentColor" strokeWidth="5" fill="none">
      <path d="M 20 80 L 80 80 L 80 20 L 20 20 L 20 50 L 80 50" />
    </g>
  ),
};

// Generates fallback line drawings for missing characters (symbols, etc.)
const FallbackGlyph = ({ char }: { char: string }) => {
  return (
    <g stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="3 3">
      <rect x="15" y="15" width="70" height="70" rx="4" />
      <text x="50" y="58" fontSize="24" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="bold">
        {char}
      </text>
    </g>
  );
};

export function Glyph({ char, style, className = 'w-10 h-10', size = 48 }: GlyphProps) {
  const normChar = char.toUpperCase();
  
  // Decide dictionary based on style
  const getDict = () => {
    switch (style) {
      case 'ancient':
        return GLYPHS_ANCIENT;
      case 'architect':
        return GLYPHS_ARCHITECT;
      case 'wuthering':
      default:
        return GLYPHS_WUTHERING;
    }
  };

  const dict = getDict();
  const glyphElement = dict[normChar];

  // If space, render empty box offset
  if (normChar === ' ') {
    return <div style={{ width: `${size * 0.5}px`, height: `${size}px` }} className="flex-shrink-0" />;
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      style={{ width: `${size}px`, height: `${size}px` }} 
      className={cn("flex-shrink-0 select-none transition-all duration-300", className)}
    >
      {glyphElement ? glyphElement : <FallbackGlyph char={char} />}
    </svg>
  );
}

const PRESETS = [
  "Explore the Unknown",
  "We are born to gaze",
  "Wuthering Waves Chronology",
  "Sentinel Jue of Jinzhou",
  "Rover awakened after sleep"
];

export default function FontTranslator() {
  const [text, setText] = useState<string>("Explore the Unknown");
  const [fontFamily, setFontFamily] = useState<FontStyle>("wuwa_jitin");
  const [isCopied, setIsCopied] = useState(false);
  const [showSettingsAlert, setShowSettingsAlert] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 1200);
    return () => clearTimeout(timer);
  }, [text]);

  // Character mapping text to show under titles
  const subtextMap = {
    wuthering: "PXPIAN'N_ZNMK_ZMKFZA  JJ ZEdJ_PAZEKFP_J",
    ancient: "KALA_TARAS_VARIA__NANI_ZAEAD_08",
    architect: "TECH_ARCH_SECTOR_GRID_SYS_4091",
    wuwa_jitin: "PXPIAN_ZNMK_ZMKFZA_JITING_SANS_V1.1",
    wuwa_ragunna: "RAGUNNA_DECORATED_CYPHER_LOCKED",
    wuwa_septimont: "SEPTIMONT_DIGITAL_MATRIX_COORDINATES",
    wuwa_lahairoi: "LAHAI_ROI_ANCIENT_SCROLLS_ACTIVE"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const randomizePreset = () => {
    const currentIdx = PRESETS.indexOf(text);
    let nextIdx = Math.floor(Math.random() * PRESETS.length);
    while (nextIdx === currentIdx && PRESETS.length > 1) {
      nextIdx = Math.floor(Math.random() * PRESETS.length);
    }
    setText(PRESETS[nextIdx]);
  };

  // Color theme class map for the translated elements
  const themeStyles = {
    wuthering: {
      textClass: "text-amber-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(251,191,36,0.1),0_0_20px_rgba(251,191,36,0.1)] border-amber-500/20",
      accentBadge: "text-amber-400 border-amber-500/30 bg-amber-950/20",
      accentText: "text-amber-400"
    },
    ancient: {
      textClass: "text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(34,211,238,0.1),0_0_20px_rgba(34,211,238,0.1)] border-cyan-500/20",
      accentBadge: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20",
      accentText: "text-cyan-400"
    },
    architect: {
      textClass: "text-orange-100 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(249,115,22,0.1),0_0_20px_rgba(249,115,22,0.1)] border-orange-500/20",
      accentBadge: "text-orange-400 border-orange-500/30 bg-orange-950/20",
      accentText: "text-orange-400"
    },
    wuwa_jitin: {
      textClass: "text-emerald-100 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(16,185,129,0.1),0_0_20px_rgba(16,185,129,0.1)] border-emerald-500/20",
      accentBadge: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20",
      accentText: "text-emerald-400"
    },
    wuwa_ragunna: {
      textClass: "text-rose-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(244,63,94,0.1),0_0_20px_rgba(244,63,94,0.1)] border-rose-500/20",
      accentBadge: "text-rose-400 border-rose-500/30 bg-rose-950/20",
      accentText: "text-rose-400"
    },
    wuwa_septimont: {
      textClass: "text-sky-100 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(56,189,248,0.1),0_0_20px_rgba(56,189,248,0.1)] border-sky-500/20",
      accentBadge: "text-sky-400 border-sky-500/30 bg-sky-950/20",
      accentText: "text-sky-400"
    },
    wuwa_lahairoi: {
      textClass: "text-fuchsia-100 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]",
      borderGlow: "shadow-[inset_0_0_20px_rgba(217,70,239,0.1),0_0_20px_rgba(217,70,239,0.1)] border-fuchsia-500/20",
      accentBadge: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/20",
      accentText: "text-fuchsia-400"
    }
  };

  const activeTheme = themeStyles[fontFamily];

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 mt-20 relative z-30">
      
      {/* Sci-fi Outer Console Frame Accent */}
      <div className="relative rounded-3xl p-6 sm:p-9 bg-[#080a0d] border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.06),inset_0_0_25px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Decorative rivets in corners */}
        <div className="absolute top-4 left-4 flex gap-1.5 opacity-40">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        </div>
        <div className="absolute top-4 right-4 flex gap-1.5 opacity-40">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        </div>
        
        {/* TOP PANEL HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center pb-6 mb-8 border-b border-cyan-500/15 gap-6 w-full">
          
          {/* Main Title & Subtitles (Left column) */}
          <div className="flex flex-col text-left">
            <h2 className="text-2xl sm:text-3xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-bold italic">
               鳴潮字體轉譯器
            </h2>
            
            {/* Decrypting dynamic noise text below the title */}
            <p className="font-jitin text-[10px] sm:text-[12px] tracking-[0.25em] text-cyan-400 mt-1 opacity-70 uppercase truncate">
              {subtextMap[fontFamily]}
            </p>
          </div>

          {/* Selector Panel (SELECT_FONT_FAMILY) (Center column) */}
          <div className="flex flex-col items-center justify-center min-w-[240px] md:mx-auto">
            <span className="font-jitin text-[11px] tracking-wider text-cyan-500/70 uppercase mb-1.5 text-center">
              SELECT_FONT_FAMILY // 選擇展示字體
            </span>
            
            <div className="relative w-full max-w-[280px]">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as FontStyle)}
                className="w-full bg-[#0d1218]/90 text-[#d1d5db] font-jitin font-normal text-sm border border-cyan-500/30 rounded-xl px-4 py-2.5 outline-none hover:border-cyan-400 focus:border-cyan-400 appearance-none cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] text-center pr-10"
              >
                <option value="wuwa_jitin" className="font-jitin">鳴潮文字</option>
                <option value="wuwa_ragunna" className="font-jitin">拉古那文字</option>
                <option value="wuwa_septimont" className="font-jitin">七丘文字</option>
                <option value="wuwa_lahairoi" className="font-jitin">拉海洛文字</option>
              </select>
              
              {/* Custom Selector arrow style */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Decorative tech dial (Right column) with dynamic decoding animation */}
          <div className="hidden md:flex justify-end items-center">
            <div className="flex items-center gap-4 bg-black/45 hover:bg-black/60 border border-white/5 rounded-2xl p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 min-w-[240px]">
              
              {/* RADAR SCANNER GAUGE */}
              <div className="relative w-12 h-12 rounded-full border border-cyan-500/10 flex items-center justify-center overflow-hidden bg-slate-950/40 flex-shrink-0">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 border border-dashed border-cyan-500/5 rounded-full scale-75" />
                <div className="absolute inset-0 border border-dashed border-cyan-500/5 rounded-full scale-[0.4]" />
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/10" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/10" />
                
                {/* Rotating scanner sweep */}
                <div className={cn(
                  "absolute inset-0 origin-center rounded-full bg-gradient-to-tr from-transparent via-transparent to-cyan-500/30",
                  isTyping ? "animate-spin [animation-duration:1s]" : "animate-spin [animation-duration:4s]"
                )} />

                {/* Concentric rotating border rings for high-tech look */}
                <div className={cn(
                  "absolute inset-1 rounded-full border border-dashed transition-colors duration-300",
                  isTyping ? "border-cyan-400 animate-spin [animation-duration:2.5s]" : "border-cyan-500/20 [animation-duration:15s]"
                )} />

                {/* Moving dot locator */}
                <span className={cn(
                  "absolute w-1 h-1 rounded-full shadow-[0_0_10px_2px_currentColor] transition-all duration-300",
                  isTyping ? "bg-cyan-300 text-cyan-400 animate-ping" : "bg-cyan-500/50 text-cyan-500/40",
                  "top-3 left-4"
                )} />
                <span className={cn(
                  "absolute w-1 h-1 rounded-full shadow-[0_0_10px_2px_currentColor] transition-all duration-300",
                  isTyping ? "bg-cyan-300 text-cyan-400" : "bg-cyan-500/50 text-cyan-500/40",
                  "top-3 left-4"
                )} />
              </div>

              {/* EQUALIZER/FREQUENCY READINGS */}
              <div className="flex flex-col gap-1 flex-1 min-w-[124px]">
                {/* Dynamic Status Badges */}
                <div className="flex items-center justify-between text-[9px] font-jitin tracking-wider select-none">
                  <span className="font-bold text-cyan-500/40">STATUS:</span>
                  <span className={cn(
                    "font-bold animate-pulse",
                    isTyping ? activeTheme.accentText : "text-cyan-500/40"
                  )}>
                    {isTyping ? "DECODING" : "STANDBY"}
                  </span>
                </div>

                {/* Dancing Spectral Waveform Meter */}
                <div className="h-[22px] flex items-end gap-[3px] px-1 py-0.5 bg-black/45 border border-white/5 rounded-md overflow-hidden relative">
                  {/* Grid background lines */}
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/5" />
                  <div className="absolute inset-y-0 left-1/4 w-[1px] bg-cyan-500/5" />
                  <div className="absolute inset-y-0 left-2/4 w-[1px] bg-cyan-500/5" />
                  <div className="absolute inset-y-0 left-3/4 w-[1px] bg-cyan-500/5" />

                  {/* Spectral Bars */}
                  {[...Array(6)].map((_, i) => {
                    const duration = [0.4, 0.7, 0.5, 0.8, 0.6, 0.45];
                    const activeColor = fontFamily === 'wuwa_jitin' ? 'bg-emerald-400/80 shadow-[0_0_6px_#10b981]' :
                                        fontFamily === 'wuwa_ragunna' ? 'bg-rose-400/80 shadow-[0_0_6px_#f43f5e]' :
                                        fontFamily === 'wuwa_septimont' ? 'bg-sky-400/80 shadow-[0_0_6px_#38bdf8]' :
                                        fontFamily === 'wuwa_lahairoi' ? 'bg-fuchsia-400/80 shadow-[0_0_6px_#d946ef]' : 'bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]';

                    return (
                      <motion.div
                        key={i}
                        animate={isTyping ? {
                          height: ["10%", "90%", "30%", "75%", "25%", "95%", "10%"]
                        } : {
                          height: ["10%", "25%", "10%", "15%", "10%"]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: isTyping ? duration[i] : duration[i] * 3,
                          ease: "easeInOut",
                          delay: i * 0.05
                        }}
                        className={cn(
                          "flex-1 rounded-t-[1px]",
                          isTyping ? activeColor : "bg-cyan-500/20"
                        )}
                        style={{ height: "10%" }}
                      />
                    );
                  })}
                </div>

                {/* Decrypting dynamic values */}
                <div className="flex items-center justify-between text-[8px] font-jitin tracking-wider text-cyan-500/40 select-none">
                  <span>M_ADDR:</span>
                  <span className="font-bold text-[9px] uppercase">
                    {isTyping ? (
                      `0x${Math.floor(Math.random() * 1000 + 4000).toString(16)}`
                    ) : (
                      "0x70A1"
                    )}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ROW PANELS: INPUT vs TRANSLATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* LEFT SIDE: INPUT TEXT AREA */}
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-cyan-400 animate-spin-pulse" />
                <span className="text-sm font-semibold tracking-wider text-[#e5e7eb]">
                  輸入文字（需英文）
                </span>
              </div>
            </div>

            {/* Input field card container */}
            <div className="relative flex-1 min-h-[180px] bg-[#0c0e11]/80 rounded-2xl border border-white/5 focus-within:border-cyan-500/30 overflow-hidden transition-all shadow-inner">
              <textarea
                value={text}
                onChange={(e) => {
                  // Only allow alphanumeric, spaces, and simple punctuation to ensure clean glyph rendering
                  const sanitized = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
                  setText(sanitized);
                }}
                maxLength={90}
                placeholder="Type English text to decrypt..."
                className="w-full h-full min-h-[180px] bg-transparent text-[#e5e7eb] font-sans text-base tracking-wider leading-relaxed p-5 outline-none resize-none placeholder:text-gray-600 border-none"
              />
              
              {/* Small sci-fi lightning logo overlay at bottom right */}
              <div className="absolute right-4 bottom-4 text-cyan-500/20 pointer-events-none select-none">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 11h-6V3h-2v8H4l8 10v-9z" />
                </svg>
              </div>

              {/* Character Count */}
              <div className="absolute right-4 top-4 font-jitin text-[10px] tracking-wider text-cyan-500/30 bg-black/40 px-2 py-0.5 rounded border border-white/5 select-none">
                {text.length} / 90
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: GLYPH OUTPUT CONTAINER */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold tracking-wider text-[#e5e7eb] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                轉譯 {
                  fontFamily === 'wuthering' ? '展示: 鳴潮字體' :
                  fontFamily === 'ancient' ? '展示: 先民字體' :
                  fontFamily === 'architect' ? '展示: 天工字體' :
                  fontFamily === 'wuwa_jitin' ? '鳴潮文字' :
                  fontFamily === 'wuwa_ragunna' ? '拉古那文字' :
                  fontFamily === 'wuwa_septimont' ? '七丘文字' :
                  fontFamily === 'wuwa_lahairoi' ? '拉海洛文字' : '未知字體'
                }
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-[11px] font-jitin font-bold tracking-widest text-[#9ca3af] hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 rounded-lg bg-black/40 hover:bg-black/80 transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  {isCopied ? (
                    <>
                      <Check size={11} className="text-green-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      複製
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Glyph display board frame */}
            <div className={cn(
              "relative flex-1 min-h-[180px] bg-[#07090c] rounded-2xl border transition-all duration-300 p-5 overflow-hidden flex flex-col justify-start",
              activeTheme.borderGlow
            )}>
              
              {/* Scanlines visual effect overlay */}
              <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />

              {/* Decorative Corner Brackets */}
              <span className={cn("absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 transition-all duration-300", 
                fontFamily === 'wuthering' ? 'border-amber-400' : 
                fontFamily === 'ancient' ? 'border-cyan-400' : 
                fontFamily === 'architect' ? 'border-orange-400' :
                fontFamily === 'wuwa_jitin' ? 'border-emerald-400' :
                fontFamily === 'wuwa_ragunna' ? 'border-rose-400' :
                fontFamily === 'wuwa_septimont' ? 'border-sky-400' :
                fontFamily === 'wuwa_lahairoi' ? 'border-fuchsia-400' : 'border-cyan-400'
              )} />
              <span className={cn("absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 transition-all duration-300", 
                fontFamily === 'wuthering' ? 'border-amber-400' : 
                fontFamily === 'ancient' ? 'border-cyan-400' : 
                fontFamily === 'architect' ? 'border-orange-400' :
                fontFamily === 'wuwa_jitin' ? 'border-emerald-400' :
                fontFamily === 'wuwa_ragunna' ? 'border-rose-400' :
                fontFamily === 'wuwa_septimont' ? 'border-sky-400' :
                fontFamily === 'wuwa_lahairoi' ? 'border-fuchsia-400' : 'border-cyan-400'
              )} />
              <span className={cn("absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 transition-all duration-300", 
                fontFamily === 'wuthering' ? 'border-amber-400' : 
                fontFamily === 'ancient' ? 'border-cyan-400' : 
                fontFamily === 'architect' ? 'border-orange-400' :
                fontFamily === 'wuwa_jitin' ? 'border-emerald-400' :
                fontFamily === 'wuwa_ragunna' ? 'border-rose-400' :
                fontFamily === 'wuwa_septimont' ? 'border-sky-400' :
                fontFamily === 'wuwa_lahairoi' ? 'border-fuchsia-400' : 'border-cyan-400'
              )} />
              <span className={cn("absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 transition-all duration-300", 
                fontFamily === 'wuthering' ? 'border-amber-400' : 
                fontFamily === 'ancient' ? 'border-cyan-400' : 
                fontFamily === 'architect' ? 'border-orange-400' :
                fontFamily === 'wuwa_jitin' ? 'border-emerald-400' :
                fontFamily === 'wuwa_ragunna' ? 'border-rose-400' :
                fontFamily === 'wuwa_septimont' ? 'border-sky-400' :
                fontFamily === 'wuwa_lahairoi' ? 'border-fuchsia-400' : 'border-cyan-400'
              )} />

              {/* Render translated glyph characters layout */}
              <div className="max-h-[180px] overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-x-[1.5px] gap-y-2 items-start justify-start relative z-10 w-full">
                {text.length === 0 ? (
                  <div className="text-gray-500 font-serif text-sm italic tracking-widest text-center py-6 select-none w-full">
                    等待輸入解密文本...
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {text.split("").map((char, index) => {
                      const isTtf = ['wuwa_jitin', 'wuwa_ragunna', 'wuwa_septimont', 'wuwa_lahairoi'].includes(fontFamily);
                      const fontClass = 
                        fontFamily === 'wuwa_jitin' ? 'font-jitin tracking-wider' :
                        fontFamily === 'wuwa_ragunna' ? 'font-ragunna tracking-wider' :
                        fontFamily === 'wuwa_septimont' ? 'font-septimont tracking-wider' :
                        fontFamily === 'wuwa_lahairoi' ? 'font-lahairoi tracking-wider' : 'tracking-wider';

                      return (
                        <motion.div
                          key={`${char}-${index}`}
                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: -10 }}
                          transition={{ type: "spring", stiffness: 450, damping: 25, delay: index * 0.01 }}
                          className={cn("transition-all duration-200 hover:scale-110", activeTheme.textClass)}
                        >
                          {isTtf ? (
                            char === ' ' ? (
                              <div style={{ width: '8px', height: '38px' }} className="flex-shrink-0" />
                            ) : (
                              <span 
                                className={cn(
                                  "font-normal leading-none select-text inline-block", 
                                  ['wuwa_ragunna', 'wuwa_septimont', 'wuwa_lahairoi'].includes(fontFamily) ? "text-[35px]" : "text-3xl mt-[6px]",
                                  fontClass
                                )}
                                style={{ fontFamily: fontFamily === 'wuwa_jitin' ? 'WuWa-Jitin' : fontFamily === 'wuwa_ragunna' ? 'WuWa-Ragunna' : fontFamily === 'wuwa_septimont' ? 'WuWa-Septimont' : 'WuWa-LahaiRoi' }}
                              >
                                {char}
                              </span>
                            )
                          ) : (
                            char === ' ' ? (
                                <div style={{ width: '8px', height: '24px' }} className="flex-shrink-0" />
                            ) : (
                                <Glyph char={char} style={fontFamily as any} size={28} />
                            )
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM DECORATIVE DECAL BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[#4b5563] font-jitin text-[10px] tracking-[0.25em] mt-8 pt-4 border-t border-[#1f2937]/30 gap-4">
          <div className="flex items-center gap-1 text-cyan-400/50 uppercase select-none">
            VALA_ZITI_KAZA <span className="opacity-40">&gt;&gt;</span> TRANZA_VANNADKJAN_V1.1
          </div>
          
          <div className="flex items-center gap-3">
             <span className="opacity-50 select-none uppercase">NANI: PAZEKFP_J_ZAEZAD</span>
             
             {/* Digital bar indicator meters */}
             <div className="flex items-center gap-0.5" title="Signal lock state">
               <span className="w-1 h-3 rounded bg-cyan-400 opacity-20" />
               <span className="w-1 h-3.5 rounded bg-cyan-400 opacity-40 animate-[pulse_1s_infinite]" />
               <span className="w-1 h-4 rounded bg-cyan-400 opacity-60" />
               <span className="w-1 h-3 rounded bg-cyan-400 opacity-80" />
               <span className="w-1 h-4.5 rounded bg-cyan-400 opacity-100" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
