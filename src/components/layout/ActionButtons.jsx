/**
 * ActionButtons Component
 * 右下角操作按钮 - 分享和发布
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconShare, IconPublish } from '../../icons';

const ActionButton = ({ icon: Icon, label, primary = false }) => (
  <button 
    className="group relative" 
    style={{ 
      width: '56px', 
      height: '56px', 
      borderRadius: '50%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      transition: 'all 0.2s', 
      backgroundColor: primary ? NEO.ink : 'white', 
      boxShadow: primary ? NEO.shadowHover : NEO.shadow, 
      color: primary ? NEO.bg : NEO.ink,
      border: 'none',
      cursor: 'pointer',
    }}
  >
    <Icon />
    <div 
      className="absolute right-full mr-3 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap pointer-events-none" 
      style={{ 
        borderRadius: NEO.radius, 
        background: NEO.ink, 
        color: NEO.bg 
      }}
    >
      {label}
    </div>
  </button>
);

export const ActionButtons = () => (
  <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[140]">
    <ActionButton icon={IconShare} label="Share" />
    <ActionButton icon={IconPublish} label="Publish" primary />
  </div>
);

export default ActionButtons;
