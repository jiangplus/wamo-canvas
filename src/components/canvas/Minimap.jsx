/**
 * Minimap Component
 * 小地图组件 - 显示画布缩略图和导航
 */
import React, { useMemo } from 'react';
import { NEO } from '../../styles/theme';
import { MINIMAP_CONFIG } from '../../utils/constants';
import { calculateElementsBounds } from '../../utils/coordinates';

export const Minimap = ({ 
  elements, 
  selectedId, 
  viewport, 
  viewportRef,
  onNavigate 
}) => {
  // 计算边界和比例
  const elementsBounds = useMemo(() => 
    calculateElementsBounds(elements, MINIMAP_CONFIG.padding), 
    [elements]
  );

  const minimapScale = useMemo(() => {
    const worldWidth = elementsBounds.maxX - elementsBounds.minX;
    const worldHeight = elementsBounds.maxY - elementsBounds.minY;
    return Math.min(
      MINIMAP_CONFIG.width / worldWidth, 
      MINIMAP_CONFIG.height / worldHeight, 
      0.05
    );
  }, [elementsBounds]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / minimapScale + elementsBounds.minX;
    const clickY = (e.clientY - rect.top) / minimapScale + elementsBounds.minY;
    onNavigate(clickX, clickY);
  };

  return (
    <div 
      className="fixed bottom-6 left-6 overflow-hidden z-[140] cursor-pointer"
      style={{ 
        width: MINIMAP_CONFIG.width, 
        height: MINIMAP_CONFIG.height, 
        background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(10px)',
        border: `1px solid ${NEO.border}`, 
        boxShadow: NEO.shadow,
        borderRadius: NEO.radius
      }}
      onClick={handleClick}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* 元素点 */}
      {elements.map(el => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: (el.x - elementsBounds.minX) * minimapScale,
            top: (el.y - elementsBounds.minY) * minimapScale,
            width: Math.max(4, (el.width || 220) * minimapScale),
            height: Math.max(3, 150 * minimapScale),
            background: selectedId === el.id ? NEO.ink : NEO.inkLight,
            opacity: selectedId === el.id ? 1 : 0.5,
            borderRadius: '2px'
          }}
        />
      ))}
      
      {/* 视口指示器 */}
      {viewportRef.current && (
        <div
          className="absolute border-2 pointer-events-none"
          style={{
            left: (-viewport.x - elementsBounds.minX) * minimapScale,
            top: (-viewport.y - elementsBounds.minY) * minimapScale,
            width: (viewportRef.current.clientWidth / viewport.scale) * minimapScale,
            height: (viewportRef.current.clientHeight / viewport.scale) * minimapScale,
            borderColor: '#60a5fa',
            background: 'rgba(96, 165, 250, 0.1)',
            borderRadius: '4px'
          }}
        />
      )}
    </div>
  );
};

export default Minimap;
