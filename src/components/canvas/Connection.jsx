/**
 * Connection Component
 * 连接线组件 - 元素之间的连接线和标签
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { CONNECTION_CONFIG, DEFAULT_ELEMENT_WIDTH } from '../../utils/constants';

export const ConnectionPreview = ({ x1, y1, x2, y2 }) => {
  const midY = (y1 + y2) / 2;
  
  return (
    <g>
      <path 
        d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`} 
        stroke="#C4C4BE" 
        strokeWidth={3} 
        strokeDasharray="1 12" 
        strokeLinecap="round"
        fill="none" 
      />
      <circle cx={x1} cy={y1} r="4" fill="#C4C4BE" />
      <circle cx={x2} cy={y2} r="4" fill="#C4C4BE" />
    </g>
  );
};

export const Connection = ({ 
  connection, 
  fromElement, 
  toElement, 
  isEditing, 
  inputRef,
  onEdit,
  onBlur,
  onChange,
  readOnly = false
}) => {
  if (!fromElement || !toElement) {
    return null;
  }

  const getCenter = (el) => {
    const width = el.width || DEFAULT_ELEMENT_WIDTH;
    const height =
      el.height ?? (el.type === 'image' ? 140 : el.type === 'text' ? 60 : 60);
    return { x: el.x + width / 2, y: el.y + height / 2 };
  };

  const fromCenter = getCenter(fromElement);
  const toCenter = getCenter(toElement);
  const x1 = fromCenter.x;
  const y1 = fromCenter.y;
  const x2 = toCenter.x;
  const y2 = toCenter.y;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  const handleChange = (e) => {
    const text = e.target.value.slice(0, CONNECTION_CONFIG.maxLabelLength);
    onChange(connection.id, text);
  };

  return (
    <g className="pointer-events-auto">
      {/* 稀疏点连接线 */}
      <path 
        d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`} 
        stroke="#C4C4BE" 
        strokeWidth={3} 
        strokeDasharray="1 12" 
        strokeLinecap="round"
        fill="none" 
      />
      
      {/* 圆点端点 */}
      <circle cx={x1} cy={y1} r="4" fill="#C4C4BE" />
      <circle cx={x2} cy={y2} r="4" fill="#C4C4BE" />
      
      {/* 毛玻璃标签容器 */}
      <foreignObject x={midX - 100} y={midY - 18} width="200" height="36">
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <div
            style={{
              background: NEO.frosted,
              backdropFilter: 'blur(12px)',
              borderRadius: NEO.radiusSm,
              boxShadow: NEO.shadowSoft,
              border: `1px solid ${NEO.border}`,
              padding: '4px 12px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <input 
              ref={isEditing ? inputRef : null}
              onMouseDown={e => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!readOnly) onEdit(connection.id);
              }}
              onBlur={onBlur}
              placeholder="describe..."
              maxLength={CONNECTION_CONFIG.maxLabelLength}
              className={`bg-transparent text-[11px] text-center italic outline-none font-medium ${isEditing ? 'caret-animate' : ''}`}
              style={{ 
                background: 'transparent',
                color: NEO.ink,
                width: connection.text 
                  ? `${Math.min(connection.text.length * 7 + 20, CONNECTION_CONFIG.labelMaxWidth)}px` 
                  : '80px',
                minWidth: `${CONNECTION_CONFIG.labelMinWidth}px`,
                maxWidth: `${CONNECTION_CONFIG.labelMaxWidth}px`,
                cursor: readOnly ? 'default' : 'text'
              }}
              value={connection.text}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

export default Connection;
