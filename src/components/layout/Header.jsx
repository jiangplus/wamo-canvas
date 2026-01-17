/**
 * Header Component
 * 顶部头部组件 - Logo 和在线用户
 */
import React, { useEffect, useState } from 'react';
import { NEO } from '../../styles/theme';
import { IconMagic } from '../../icons';
import Avatar from '../ui/Avatar';
import { db } from '../../lib/db';
import { clearStoredAuthToken } from '../../lib/authStorage';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const Logo = ({ onBack, canvasName, canEditName, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(canvasName || '');

  useEffect(() => {
    setDraftName(canvasName || '');
  }, [canvasName]);

  const finishRename = () => {
    if (!canEditName) {
      setIsEditing(false);
      return;
    }
    const nextName = draftName.trim();
    setIsEditing(false);
    if (nextName && nextName !== canvasName) {
      onRename?.(nextName);
    } else {
      setDraftName(canvasName || '');
    }
  };

  return (
    <div className="fixed top-8 left-8 z-[150] flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="w-14 h-14 flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: NEO.surface,
            color: NEO.ink,
            boxShadow: NEO.shadow,
            borderRadius: NEO.radiusLg,
            border: `1px solid ${NEO.border}`,
          }}
          title="Back to Boards"
        >
          <BackIcon />
        </button>
      )}
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
      {canvasName && (
        <div className="min-w-[120px] max-w-[200px]">
          {isEditing ? (
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishRename();
                if (e.key === 'Escape') {
                  setDraftName(canvasName || '');
                  setIsEditing(false);
                }
              }}
              className="text-sm font-medium w-full outline-none"
              style={{
                color: NEO.ink,
                background: 'white',
                border: `1px solid ${NEO.border}`,
                borderRadius: NEO.radius,
                padding: '6px 8px'
              }}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!canEditName) return;
                setIsEditing(true);
              }}
              className="text-left text-sm font-medium w-full truncate"
              style={{
                color: NEO.ink,
                cursor: canEditName ? 'text' : 'default',
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
              title={canEditName ? 'Rename canvas' : canvasName}
            >
              {canvasName}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const UserMenu = () => {
  const { user } = db.useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = () => {
    db.auth.signOut();
    clearStoredAuthToken();
  };

  const handleSignIn = () => {
    // Clear the hash to go back to login
    window.location.hash = '';
    window.location.reload();
  };

  // If not logged in, show sign in button
  if (!user) {
    return (
      <div className="fixed top-8 right-8 z-[150]">
        <button
          onClick={handleSignIn}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
          style={{
            background: NEO.ink,
            color: NEO.bg,
            boxShadow: NEO.shadow,
            borderRadius: NEO.radiusLg,
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

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
                className="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
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

const Header = ({ onBack, canvasName, canEditName, onRename }) => (
  <>
    <Logo
      onBack={onBack}
      canvasName={canvasName}
      canEditName={canEditName}
      onRename={onRename}
    />
    <UserMenu />
  </>
);

export default Header;
