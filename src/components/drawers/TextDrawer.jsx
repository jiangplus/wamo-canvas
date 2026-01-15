/**
 * TextDrawer Component
 * 文字抽屉 - 创建和编辑文字卡片
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import Drawer from './Drawer';
import { TEXT_CONFIG } from '../../utils/constants';

export const TextDrawer = ({
  isOpen,
  onClose,
  textInput,
  onTextChange,
  wordCount,
  previewStyle,
  onShuffle,
  onDragStart,
}) => {
  const handleTextChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).length;
    if (words <= TEXT_CONFIG.maxWords || text.trim() === '') {
      onTextChange(text);
    }
  };

  return (
    <Drawer isOpen={isOpen} title="text" onClose={onClose}>
      <div className="flex flex-col gap-6">
        {/* 文字输入 */}
        <div className="relative">
          <textarea 
            value={textInput} 
            onChange={handleTextChange} 
            className="w-full p-4 text-xs italic outline-none" 
            style={{ 
              background: NEO.bg, 
              border: `1px solid ${NEO.accent}`, 
              color: NEO.ink, 
              borderRadius: NEO.radius 
            }} 
            rows="4" 
            placeholder="Type your text here..."
          />
          <div 
            className={`absolute bottom-3 right-4 text-[9px] font-semibold ${wordCount >= TEXT_CONFIG.warningThreshold ? 'text-rose-400' : ''}`} 
            style={{ color: wordCount >= TEXT_CONFIG.warningThreshold ? undefined : NEO.inkLight }}
          >
            {wordCount}/{TEXT_CONFIG.maxWords}
          </div>
        </div>
        
        {/* 预览区域 */}
        <div className="flex justify-between items-center">
          <span 
            className="text-[9px] font-semibold uppercase tracking-widest" 
            style={{ color: NEO.inkLight }}
          >
            Preview
          </span>
          <button 
            onClick={onShuffle} 
            className="w-12 h-12 flex items-center justify-center text-lg" 
            style={{ 
              background: NEO.ink, 
              color: NEO.bg, 
              boxShadow: NEO.shadow, 
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🎲
          </button>
        </div>
        
        {/* 可拖拽预览 */}
        <div 
          onMouseDown={(e) => {
            e.stopPropagation();
            onDragStart(e.clientX, e.clientY);
          }} 
          className="flex justify-center p-4 cursor-grab hover:scale-105 transition-transform"
        >
          <div style={{
            ...previewStyle, 
            transform: 'none', 
            fontSize: `${previewStyle.fontSize}px`
          }}>
            {textInput || "Start typing..."}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default TextDrawer;
