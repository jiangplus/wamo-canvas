/**
 * BottomControls Component
 * 底部控制栏 - 缩放和居中
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';
import { IconZoomIn, IconZoomOut, IconTarget } from '../../icons';

export const BottomControls = ({ 
  scale, 
  onZoomIn, 
  onZoomOut, 
  onSnapToCenter 
}) => (
  <div 
    className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-2 z-[140]" 
    style={{ 
      background: NEO.surface, 
      backdropFilter: 'blur(20px)', 
      border: `1px solid ${NEO.border}`, 
      boxShadow: NEO.shadow, 
      borderRadius: NEO.radiusLg 
    }} 
    onMouseDown={e => e.stopPropagation()}
  >
    <IconButton onClick={onZoomOut} title="Zoom Out">
      <IconZoomOut />
    </IconButton>
    <span 
      className="text-xs font-semibold px-2 min-w-[50px] text-center" 
      style={{ color: NEO.ink }}
    >
      {Math.round(scale * 100)}%
    </span>
    <IconButton onClick={onZoomIn} title="Zoom In">
      <IconZoomIn />
    </IconButton>
    <div className="w-px h-6" style={{ background: NEO.accent }} />
    <IconButton onClick={onSnapToCenter} title="Center View (Cmd+0)">
      <IconTarget />
    </IconButton>
  </div>
);

export default BottomControls;
