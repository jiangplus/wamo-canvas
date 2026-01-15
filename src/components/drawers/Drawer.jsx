/**
 * Drawer Component
 * 抽屉容器组件 - 侧边面板的通用容器
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';

export const Drawer = ({ 
  isOpen, 
  // title, // Removed title
  onClose, 
  children,
  headerContent 
}) => {
  return (
    <div 
      onMouseDown={e => e.stopPropagation()}
      className={`fixed top-8 left-28 bottom-8 w-80 flex flex-col overflow-hidden transition-all duration-500 z-[130] ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}
      style={{ 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)', 
        border: `1px solid ${NEO.border}`, 
        boxShadow: NEO.shadow, 
        borderRadius: NEO.radiusLg 
      }}
    >
      {/* Header - No Title, No Divider */}
      <div 
        className="px-6 pt-5 pb-2 flex items-center justify-between" 
        style={{ borderColor: 'transparent' }} 
      >
        {/* Empty space for title was requested to be "留白" (whitespace) but elements moved up slightly. 
            I'll just keep the Close button on the right and let headerContent/children follow.
            The "title" area is effectively gone. */}
        <div /> 
        <IconButton onClick={onClose}>
          <span style={{ fontSize: 16 }}>✕</span>
        </IconButton>
      </div>
      
      {/* Optional header content (like tabs) */}
      {headerContent}
      
      {/* Content - Moved up slightly by reducing top padding */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {children}
      </div>
    </div>
  );
};

export default Drawer;
