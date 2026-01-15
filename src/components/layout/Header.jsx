/**
 * Header Component
 * 顶部头部组件 - Logo 和在线用户
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconMagic } from '../../icons';
import Avatar from '../ui/Avatar';

export const Logo = () => (
  <div className="fixed top-8 left-8 z-[150] flex items-center gap-3">
    <div 
      className="w-14 h-14 flex items-center justify-center" 
      style={{ 
        background: NEO.ink, 
        color: NEO.bg, 
        boxShadow: NEO.shadow, 
        borderRadius: NEO.radiusLg 
      }}
    >
      <IconMagic />
    </div>
    {/* Removed text as requested */}
  </div>
);

export const OnlineUsers = ({ users = [1, 2, 3] }) => (
  <div 
    className="fixed top-8 right-8 z-[150] flex items-center gap-4 px-4 py-2" 
    style={{ 
      background: NEO.surface, 
      backdropFilter: 'blur(20px)', 
      border: `1px solid ${NEO.border}`, 
      boxShadow: NEO.shadow, 
      borderRadius: NEO.radiusLg 
    }}
  >
    <div className="flex -space-x-3">
      {users.map(i => (
        <div 
          key={i} 
          className="w-9 h-9 overflow-hidden bg-white" 
          style={{ 
            border: `2px solid ${NEO.bg}`, 
            boxShadow: NEO.shadowSoft, 
            borderRadius: '50%' 
          }}
        >
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 50}`} 
            className="w-full h-full" 
            alt={`User ${i}`}
          />
        </div>
      ))}
    </div>
    <span 
      className="text-[10px] font-semibold uppercase tracking-widest" 
      style={{ color: NEO.inkLight }}
    >
      +2 Online
    </span>
    <Avatar 
      src="https://api.dicebear.com/7.x/notionists/svg?seed=Me" 
      size={44} 
    />
  </div>
);

const Header = () => (
  <>
    <Logo />
    <OnlineUsers />
  </>
);

export default Header;
