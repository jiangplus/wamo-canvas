/**
 * IconButton Component
 * 图标按钮组件 - 可复用的圆形图标按钮
 */
import React from 'react';
import { NEO } from '../../styles/theme';

export const IconButton = ({ 
  onClick, 
  title, 
  active = false, 
  danger = false, 
  disabled = false, 
  size = 40,
  children 
}) => {
  const bgColor = active ? NEO.ink : 'transparent';
  const textColor = active ? NEO.bg : danger ? '#F87171' : NEO.ink;
  
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '50%',
        transition: 'all 0.2s',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        padding: 0,
      }}
    >
      {children}
    </button>
  );
};

export default IconButton;
