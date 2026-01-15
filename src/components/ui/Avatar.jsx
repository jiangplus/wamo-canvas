/**
 * Avatar Component
 * 头像组件 - 显示用户头像
 */
import React from 'react';
import { NEO } from '../../styles/theme';

export const Avatar = ({ 
  src, 
  size = 40, 
  border = true,
  shadow = true 
}) => {
  return (
    <div 
      className="overflow-hidden bg-white shrink-0"
      style={{ 
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: border ? '2px solid white' : 'none',
        boxShadow: shadow ? NEO.shadowSoft : 'none',
      }}
    >
      <img 
        src={src} 
        alt="Avatar"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
};

export default Avatar;
