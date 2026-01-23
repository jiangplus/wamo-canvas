/**
 * BoardsPage - Canvas board management page
 * Updated with custom fonts (FuturaPT-Light & SF-Pro-Display-Light) and background #FCFCFB
 */
import React, { useState, useEffect, useRef } from 'react';
import { db, id, tx } from '../../lib/db';
import { clearStoredAuthToken } from '../../lib/authStorage';

// --- Icons ---

const PlusIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MoreHorizontalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// --- Helpers ---

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'just now';

  // 修复：1 hr vs 2 hrs
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  if (diffDays === 1) return 'yesterday';

  // 修复：1 day vs 2 days (虽然上面 catch 了 yesterday，但这更加健壮)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Components ---

function CreateBoardModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onSubmit(name.trim(), 'private');
    setName('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-popIn" 
        onClick={e => e.stopPropagation()}
      >
        <h2 
          className="text-xl mb-6 text-gray-900"
          style={{ fontFamily: 'SF-Pro-Display-Light, sans-serif' }}
        >
          Name your board
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. 💃 Design Sprint"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 text-lg bg-gray-50 rounded-xl outline-none border border-transparent focus:bg-white focus:border-gray-200 transition-all mb-6 placeholder:text-gray-300"
            style={{ fontFamily: 'SF-Pro-Display-Light, sans-serif' }}
          />
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BoardCard({ board, onSelect, onDelete, isOwner }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleHide = (e) => {
    e.stopPropagation();
    if (confirm('Hide this canvas?')) {
      onDelete(board.id);
    }
    setShowMenu(false);
  };

  const handleInvite = (e) => {
    e.stopPropagation();
    alert("Invite feature coming soon!");
    setShowMenu(false);
  };

  return (
    <div
      className="group relative aspect-[4/3] bg-white rounded-[32px] p-6 cursor-pointer transition-all duration-500 hover:-translate-y-2"
      onClick={() => onSelect(board.id)}
      style={{ 
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' 
      }}
    >
      {/* Menu Button */}
      <div className="absolute top-5 right-5 z-20" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            showMenu 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MoreHorizontalIcon />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-fadeIn z-30">
            <button
              onClick={handleInvite}
              className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <UserPlusIcon />
              <span>Invite</span>
            </button>
            <div className="h-px bg-gray-50 my-1" />
            <button
              onClick={handleHide}
              className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <EyeOffIcon />
              <span>Hide</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Positioned Higher (bottom-10) */}
      <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
        <h3 
          className="text-[28px] text-gray-900 leading-tight mb-2 truncate"
          style={{ fontFamily: 'SF-Pro-Display-Light, sans-serif' }}
        >
           {board.name || 'Untitled'}
        </h3>
        
        <p 
          className="text-sm text-gray-400"
          style={{ fontFamily: 'FuturaPT-Light, sans-serif', letterSpacing: '0.02em' }}
        >
          edited by me {formatDate(board.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function BoardsPage({ onSelectBoard }) {
  const user = db.useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userId = user?.id;

  const { data, isLoading } = db.useQuery(
    userId
      ? {
          canvases: {
            $: {
              where: {
                or: [{ 'owner.id': userId }, { 'memberships.user.id': userId }],
              },
            },
            owner: {},
            memberships: { user: {} },
          },
        }
      : null,
  );

  const boards = data?.canvases || [];

  const handleCreateBoard = async (name, visibility) => {
    if (!user?.id) return;
    const boardId = id();
    
    await db.transact([
      tx.canvases[boardId].update({
        name,
        visibility,
        createdAt: Date.now(),
      }).link({ owner: user.id }),
    ]);

    try {
      const membershipId = id();
      await db.transact([
        tx.canvas_memberships[membershipId]
          .update({ createdAt: Date.now() })
          .link({ canvas: boardId })
          .link({ user: user.id }),
      ]);
    } catch (err) {
      console.warn('Failed to auto-join:', err);
    }
    onSelectBoard(boardId);
  };

  const handleDeleteBoard = async (boardId) => {
    await db.transact([tx.canvases[boardId].delete()]);
  };

  const handleSignOut = () => {
    db.auth.signOut();
    clearStoredAuthToken();
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}`;

  return (
    // Background updated to #FCFCFB
    <div className="min-h-screen w-full bg-[#FCFCFB] selection:bg-gray-200">
      
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
        <div className="w-12 h-12 bg-gray-900 rounded-full cursor-pointer shadow-lg pointer-events-auto hover:scale-105 transition-transform" />
        
        <div 
            className="w-12 h-12 bg-white rounded-full cursor-pointer overflow-hidden shadow-sm pointer-events-auto border border-gray-100 hover:scale-105 transition-transform"
            onClick={handleSignOut}
            title="Sign out"
        >
             <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      <main className="px-12 max-w-[1920px] mx-auto">
        
        {/* Title at 45% height */}
        <div className="pt-[45vh] mb-20">
          <h1 
            className="text-[42px] text-gray-900 tracking-wide ml-2"
            style={{ fontFamily: 'FuturaPT-Light, sans-serif' }}
          >
            MY PROJECTS
          </h1>
        </div>

        {isLoading ? (
          <div className="text-gray-400 text-sm animate-pulse">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-7 pb-40">
            
            {/* New Board Card */}
            <div
              onClick={() => setShowCreateModal(true)}
              className="aspect-[4/3] bg-white rounded-[32px] flex items-center justify-center cursor-pointer transition-all duration-500 hover:-translate-y-2 group"
              style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}
            >
              <div className="text-gray-300 group-hover:text-gray-500 group-hover:scale-110 transition-all duration-300">
                <PlusIcon size={48} strokeWidth={1.5} />
              </div>
            </div>

            {/* Existing Boards */}
            {boards
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
              .map((board) => {
                const isOwner = board.owner?.[0]?.id === userId;
                return (
                  <BoardCard
                    key={board.id}
                    board={board}
                    isOwner={isOwner || true}
                    onSelect={onSelectBoard}
                    onDelete={handleDeleteBoard}
                  />
                );
              })}
          </div>
        )}
      </main>

      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBoard}
      />

      <style>{`
        /* Load Custom Fonts */
        @font-face {
          font-family: 'FuturaPT-Light';
          src: url('/assets/fonts/FuturaPT-Light.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
        
        @font-face {
          font-family: 'SF-Pro-Display-Light';
          src: url('/assets/fonts/SF-Pro-Display-Light.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        /* Animations */
        .animate-popIn {
          animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}