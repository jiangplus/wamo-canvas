/**
 * Toolbar Component
 * 左侧工具栏
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';
import { IconImage, IconType, IconSmile, IconConnect } from '../../icons';

const TOOLS = [
  { id: 'image', icon: IconImage },
  { id: 'text', icon: IconType },
  { id: 'sticker', icon: IconSmile },
  { id: 'connect', icon: IconConnect },
];

export const Toolbar = ({ activeTool, onToolChange }) => {
  const handleToolClick = (toolId) => {
    onToolChange(activeTool === toolId ? null : toolId);
  };

  return (
    <aside 
      onMouseDown={e => e.stopPropagation()} 
      className="fixed top-1/2 left-8 -translate-y-1/2 flex flex-col items-center py-4 px-3 gap-2 z-[140]" 
      style={{ 
        background: NEO.surface, 
        backdropFilter: 'blur(20px)', 
        border: `1px solid ${NEO.border}`, 
        boxShadow: NEO.shadow, 
        borderRadius: NEO.radiusLg 
      }}
    >
      {TOOLS.map(tool => (
        <IconButton 
          key={tool.id} 
          onClick={() => handleToolClick(tool.id)} 
          active={activeTool === tool.id}
          title={tool.id.charAt(0).toUpperCase() + tool.id.slice(1)}
        >
          <tool.icon />
        </IconButton>
      ))}
    </aside>
  );
};

export default Toolbar;
