/**
 * Icon Components
 * 图标组件库 - 统一管理所有 SVG 图标
 */
import React from 'react';

// Base Icon wrapper
const Icon = ({ children, size = 22 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Tool Icons
export const IconImage = () => (
  <Icon>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </Icon>
);

export const IconType = () => (
  <Icon>
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </Icon>
);

export const IconSmile = () => (
  <Icon>
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </Icon>
);

export const IconConnect = () => (
  <Icon>
    <path d="M4 20 C 4 10, 20 14, 20 4" strokeDasharray="3 2" />
    <path d="M2 18l2 2 2-2M18 6l2-2 2 2" />
  </Icon>
);

// Action Icons
export const IconTrash = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </Icon>
);

export const IconCopy = () => (
  <Icon size={18}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </Icon>
);

export const IconLock = () => (
  <Icon size={18}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </Icon>
);

export const IconUnlock = () => (
  <Icon size={18}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 019.9-1"/>
  </Icon>
);

export const IconShuffle = () => (
  <Icon size={18}>
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
  </Icon>
);

export const IconEdit = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </Icon>
);

export const IconUndo = () => (
  <Icon size={18}>
    <path d="M9 14L4 9l5-5"/>
    <path d="M20 20v-7a4 4 0 00-4-4H4"/>
  </Icon>
);

export const IconRotateCcw = () => (
  <Icon size={18}>
    <path d="M1 4v6h6"/>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
  </Icon>
);

export const IconMagic = () => (
  <Icon size={18}>
    <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M17.66 19.07l1.41 1.41M20 12h2M17.66 4.93l1.41-1.41"/>
  </Icon>
);

export const IconScissors = () => (
  <Icon size={18}>
    <circle cx="6" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
  </Icon>
);

export const IconCrop = () => (
  <Icon size={18}>
    <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
    <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
  </Icon>
);

export const IconPlus = () => (
  <Icon size={18}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </Icon>
);

export const IconMessage = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </Icon>
);

export const IconShare = () => (
  <Icon>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </Icon>
);

export const IconPublish = () => (
  <Icon>
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polyline points="22 2 15 22 11 13 2 9 22 2"/>
  </Icon>
);

export const IconUpload = () => (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </Icon>
);

// Navigation Icons
export const IconLink = ({ size = 18 }) => (
  <Icon size={size}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

export const IconZoomIn = () => (
  <Icon size={20}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </Icon>
);

export const IconZoomOut = () => (
  <Icon size={20}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </Icon>
);

export const IconTarget = () => (
  <Icon size={20}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </Icon>
);

export const IconChevronUp = () => (
  <Icon size={18}>
    <polyline points="18 15 12 9 6 15"/>
  </Icon>
);

export const IconMoreHorizontal = () => (
  <Icon size={18}>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </Icon>
);

export const IconClose = ({ size = 16 }) => (
  <Icon size={size}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </Icon>
);

export const IconCheck = ({ size = 16 }) => (
  <Icon size={size}>
    <polyline points="20 6 9 17 4 12"/>
  </Icon>
);
