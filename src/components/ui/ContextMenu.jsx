/**
 * ContextMenu Component
 * 右键上下文菜单
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconMessage } from '../../icons';

export const ContextMenu = ({ x, y, onAddComment, onClose }) => {
  return (
    <div 
      className="fixed z-[200] p-2 min-w-[60px] flex justify-center"
      style={{ 
        left: x, 
        top: y, 
        background: 'white',
        border: `1px solid ${NEO.border}`,
        boxShadow: NEO.shadowHover,
        borderRadius: NEO.radius
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <button 
        onClick={onAddComment}
        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors rounded-full"
        style={{ color: NEO.ink, border: 'none', background: 'transparent', cursor: 'pointer' }}
        title="Add Comment"
      >
        <IconMessage size={24} />
      </button>
    </div>
  );
};

export default ContextMenu;
