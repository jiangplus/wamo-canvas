/**
 * Header Component
 * 顶部头部组件 - Logo 和在线用户
 */
import React, { useState } from 'react';
import { NEO } from '../../styles/theme';
import { IconMagic } from '../../icons';
import Avatar from '../ui/Avatar';
import { db } from '../../lib/db';

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

export const UserMenu = () => {
  const user = db.useUser();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = () => {
    db.auth.signOut();
  };

  // Generate avatar from email
  const avatarSeed = user?.email?.split('@')[0] || 'user';
  const displayName = user?.email?.split('@')[0] || 'User';

  return (
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
      <span
        className="text-xs font-medium max-w-[120px] truncate"
        style={{ color: NEO.ink }}
      >
        {displayName}
      </span>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="focus:outline-none"
        >
          <Avatar
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}`}
            size={44}
          />
        </button>

        {showMenu && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-[149]"
              onClick={() => setShowMenu(false)}
            />

            {/* Dropdown menu */}
            <div
              className="absolute right-0 mt-2 py-2 min-w-[160px] z-[150] animate-popIn"
              style={{
                background: NEO.surface,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${NEO.border}`,
                boxShadow: NEO.shadowHover,
                borderRadius: NEO.radius,
              }}
            >
              <div
                className="px-4 py-2 border-b mb-2"
                style={{ borderColor: NEO.border }}
              >
                <p
                  className="text-xs truncate"
                  style={{ color: NEO.inkLight }}
                >
                  {user?.email}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: NEO.ink }}
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Keep OnlineUsers for backwards compatibility, but it's now replaced by UserMenu
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
    <UserMenu />
  </>
);

export default Header;
