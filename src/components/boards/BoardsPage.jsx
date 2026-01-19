/**
 * BoardsPage - Canvas board management page
 * Lists all boards and allows creating new ones
 */
import React, { useState } from 'react';
import { db, id, tx } from '../../lib/db';
import { NEO } from '../../styles/theme';
import { clearStoredAuthToken } from '../../lib/authStorage';
import Avatar from '../ui/Avatar';

// Icons
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const BoardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', description: 'Only you can view and edit', icon: LockIcon, color: '#6B7280' },
  { value: 'protected', label: 'Protected', description: 'Anyone can view, only you can edit', icon: ShieldIcon, color: '#F59E0B' },
  { value: 'public', label: 'Public', description: 'Anyone can view; edits require login', icon: GlobeIcon, color: '#10B981' },
];

const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" />
    <path d="M17.8 11.8 19 13" /><path d="M15 9h.01" />
    <path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" />
  </svg>
);

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CreateBoardModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await onSubmit(name.trim(), visibility);
    setName('');
    setVisibility('private');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-popIn"
        style={{
          background: NEO.surface,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${NEO.border}`,
          boxShadow: NEO.shadowHover,
          borderRadius: NEO.radiusLg,
          padding: '32px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          className="text-xl font-semibold mb-6"
          style={{ color: NEO.ink }}
        >
          Create New Board
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Board name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 text-base outline-none transition-all mb-4"
            style={{
              background: 'white',
              border: `1px solid ${NEO.border}`,
              borderRadius: NEO.radius,
              color: NEO.ink,
              boxShadow: NEO.shadowSoft,
            }}
            onFocus={(e) => e.target.style.borderColor = NEO.ink}
            onBlur={(e) => e.target.style.borderColor = NEO.border}
          />

          {/* Visibility selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: NEO.ink }}>
              Visibility
            </label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = visibility === option.value;
                return (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-3 cursor-pointer transition-all"
                    style={{
                      background: isSelected ? `${option.color}10` : 'white',
                      border: `1px solid ${isSelected ? option.color : NEO.border}`,
                      borderRadius: NEO.radius,
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="mt-1"
                      style={{ accentColor: option.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span style={{ color: option.color }}><Icon /></span>
                        <span className="text-sm font-medium" style={{ color: NEO.ink }}>
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: NEO.inkLight }}>
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium transition-all"
              style={{
                background: 'transparent',
                color: NEO.inkLight,
                borderRadius: NEO.radius,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2.5 text-sm font-medium transition-all"
              style={{
                background: !name.trim() || isSubmitting ? NEO.inkLight : NEO.ink,
                color: NEO.bg,
                borderRadius: NEO.radius,
                cursor: !name.trim() || isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BoardCard({
  board,
  onSelect,
  onDelete,
  onChangeVisibility,
  onJoin,
  isOwner,
  isMember,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const elementCount = board.elements?.length || 0;
  const visibility = board.visibility || 'private';
  const visibilityOption = VISIBILITY_OPTIONS.find(o => o.value === visibility) || VISIBILITY_OPTIONS[0];
  const VisibilityIcon = visibilityOption.icon;
  const owner = board.owner?.[0];
  const ownerEmail = owner?.email;
  const ownerName = ownerEmail
    ? ownerEmail.split('@')[0]
    : owner?.id
      ? 'Owner'
      : 'Unknown';
  const ownerAvatar =
    owner?.imageURL ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${ownerName || 'owner'}`;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this board? This cannot be undone.')) {
      onDelete(board.id);
    }
  };

  const handleVisibilityChange = (e, newVisibility) => {
    e.stopPropagation();
    onChangeVisibility(board.id, newVisibility);
    setShowDropdown(false);
  };

  const toggleDropdown = (e) => {
    if (!isOwner) return;
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleJoin = (e) => {
    e.stopPropagation();
    onJoin(board.id);
  };

  const canJoin =
    !isMember &&
    (isOwner || visibility !== 'private');

  return (
    <div
      className="group relative cursor-pointer transition-all hover:scale-[1.02]"
      style={{
        background: NEO.surface,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${NEO.border}`,
        boxShadow: NEO.shadow,
        borderRadius: NEO.radiusLg,
        padding: '24px',
      }}
      onClick={() => onSelect(board.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => { setShowDelete(false); setShowDropdown(false); }}
    >
      {/* Delete button (on hover) */}
      {showDelete && isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-2 rounded-lg transition-all hover:bg-red-50"
          style={{
            color: '#DC2626',
            right: canJoin ? '56px' : '12px',
          }}
          title="Delete board"
        >
          <TrashIcon />
        </button>
      )}

      {canJoin && (
        <button
          onClick={handleJoin}
          className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold transition-all"
          style={{
            background: NEO.ink,
            color: NEO.bg,
            borderRadius: NEO.radius,
            boxShadow: NEO.shadowSoft,
          }}
          title="Join this board"
        >
          Join
        </button>
      )}

      {/* Visibility button (always visible) */}
      <div className="absolute top-3 left-3 relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: `${visibilityOption.color}15`,
            color: visibilityOption.color,
            cursor: isOwner ? 'pointer' : 'default',
            opacity: isOwner ? 1 : 0.7,
          }}
          title={isOwner ? 'Change visibility' : 'View only'}
        >
          <VisibilityIcon />
          <span>{visibilityOption.label}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Visibility dropdown menu */}
        {showDropdown && isOwner && (
          <div
            className="absolute left-0 top-full mt-1 py-1 min-w-[180px] z-10"
            style={{
              background: NEO.surface,
              border: `1px solid ${NEO.border}`,
              borderRadius: NEO.radius,
              boxShadow: NEO.shadowHover,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {VISIBILITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = visibility === option.value;
              return (
                <button
                  key={option.value}
                  onClick={(e) => handleVisibilityChange(e, option.value)}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left transition-all hover:bg-black/5"
                  style={{
                    background: isSelected ? `${option.color}10` : 'transparent',
                  }}
                >
                  <span style={{ color: option.color }}><Icon /></span>
                  <span className="text-sm" style={{ color: NEO.ink }}>{option.label}</span>
                  {isSelected && (
                    <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={option.color} strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Board preview */}
      <div
        className="w-full aspect-video mb-4 flex items-center justify-center mt-6"
        style={{
          background: `linear-gradient(135deg, ${NEO.bg} 0%, ${NEO.accent} 100%)`,
          borderRadius: NEO.radius,
          border: `1px solid ${NEO.border}`,
        }}
      >
        <div style={{ color: NEO.inkLight, opacity: 0.5 }}>
          <BoardIcon />
        </div>
      </div>

      {/* Board info */}
      <h3
        className="font-semibold text-base mb-1 truncate"
        style={{ color: NEO.ink }}
      >
        {board.name || 'Untitled Board'}
      </h3>

      <div className="flex items-center gap-2 mb-2">
        <Avatar src={ownerAvatar} size={20} />
        <span className="text-xs font-medium" style={{ color: NEO.inkLight }}>
          {ownerName}
        </span>
      </div>

      <div
        className="flex items-center gap-3 text-xs"
        style={{ color: NEO.inkLight }}
      >
        <span>{elementCount} element{elementCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{formatDate(board.createdAt)}</span>
      </div>
    </div>
  );
}

export default function BoardsPage({ onSelectBoard }) {
  const user = db.useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userId = user?.id;

  // Query all canvases with their elements count
  const { data, isLoading } = db.useQuery(
    userId
      ? {
          canvases: {
            $: {
              where: {
                or: [{ 'owner.id': userId }, { 'memberships.user.id': userId }],
              },
            },
            elements: {},
            owner: {},
            memberships: { user: {} },
          },
        }
      : null,
  );

  const boards = data?.canvases || [];

  const handleCreateBoard = async (name, visibility) => {
    if (!user?.id || !user?.email) return;

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
      console.warn('Failed to auto-join board:', err);
    }

    // Open the new board
    onSelectBoard(boardId);
  };

  const handleDeleteBoard = async (boardId) => {
    await db.transact([tx.canvases[boardId].delete()]);
  };

  const handleChangeVisibility = async (boardId, visibility) => {
    await db.transact([tx.canvases[boardId].update({ visibility })]);
  };

  const handleJoinBoard = async (boardId) => {
    if (!userId) return;
    const membershipId = id();
    await db.transact([
      tx.canvas_memberships[membershipId]
        .update({ createdAt: Date.now() })
        .link({ canvas: boardId })
        .link({ user: userId }),
    ]);
  };

  const handleSignOut = () => {
    db.auth.signOut();
    clearStoredAuthToken();
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}`;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: NEO.bg,
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`
        }}
      />

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${NEO.accent} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.6
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between"
        style={{
          background: `${NEO.bg}ee`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${NEO.border}`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{
              background: NEO.ink,
              color: NEO.bg,
              boxShadow: NEO.shadow,
              borderRadius: NEO.radiusLg
            }}
          >
            <LogoIcon />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: NEO.ink }}>
              My Boards
            </h1>
            <p className="text-sm" style={{ color: NEO.inkLight }}>
              {boards.length} board{boards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
            style={{
              background: NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radius,
              boxShadow: NEO.shadow,
              padding: '10px 10px',
            }}
          >
            <PlusIcon />
            New Board
          </button>

          <div
            className="flex items-center gap-3 px-3 py-2"
            style={{
              background: NEO.surface,
              border: `1px solid ${NEO.border}`,
              borderRadius: NEO.radiusLg,
            }}
          >
            <span className="text-sm" style={{ color: NEO.ink }}>{displayName}</span>
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-9 h-9 rounded-full cursor-pointer"
              style={{ border: `2px solid ${NEO.bg}` }}
              onClick={handleSignOut}
              title="Click to sign out"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-lg" style={{ color: NEO.inkLight }}>
              Loading boards...
            </div>
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-20 h-20 flex items-center justify-center mb-6"
              style={{
                background: NEO.accent,
                borderRadius: NEO.radiusLg,
                color: NEO.inkLight,
              }}
            >
              <BoardIcon />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: NEO.ink }}>
              No boards yet
            </h2>
            <p className="text-sm mb-6" style={{ color: NEO.inkLight }}>
              Create your first board to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all hover:scale-105"
              style={{
                background: NEO.ink,
                color: NEO.bg,
                borderRadius: NEO.radius,
                boxShadow: NEO.shadow,
              }}
            >
              <PlusIcon />
              Create First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create new board card */}
            <div
              className="cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center aspect-[4/3]"
              style={{
                background: `${NEO.surface}80`,
                backdropFilter: 'blur(20px)',
                border: `2px dashed ${NEO.border}`,
                borderRadius: NEO.radiusLg,
                color: NEO.inkLight,
              }}
              onClick={() => setShowCreateModal(true)}
            >
              <div className="mb-3">
                <PlusIcon />
              </div>
              <span className="text-sm font-medium">New Board</span>
            </div>

            {/* Existing boards */}
            {boards
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
              .map((board) => {
                const isOwner =
                  board.owner?.[0]?.id
                    ? board.owner?.[0]?.id === userId
                    : Boolean(userId);
                const isMember = Boolean(
                  userId &&
                    board.memberships?.some((membership) => {
                      const users = Array.isArray(membership.user)
                        ? membership.user
                        : membership.user
                          ? [membership.user]
                          : [];
                      return users.some((u) => u.id === userId);
                    }),
                );

                return (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onSelect={onSelectBoard}
                    onDelete={handleDeleteBoard}
                    onChangeVisibility={handleChangeVisibility}
                    onJoin={handleJoinBoard}
                    isOwner={isOwner}
                    isMember={isMember}
                  />
                );
              })
            }
          </div>
        )}
      </main>

      {/* Create Modal */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBoard}
      />

      <style>{`
        .animate-popIn {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
