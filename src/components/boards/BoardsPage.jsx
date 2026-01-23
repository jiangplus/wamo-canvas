/**
 * BoardsPage - Canvas board management page
 * Updated: Grid-based organic distribution, Super slow motion, Images uncropped.
 * Text limited to 15 chars.
 */
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { db, id, tx } from '../../lib/db';
import { clearStoredAuthToken } from '../../lib/authStorage';

// --- Configuration ---
// Available fonts based on @font-face rules
const AVAILABLE_FONTS = ['FuturaPT-Light', 'SF-Pro-Display-Light'];

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
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Hook for extremely slow, curved organic motion
function useCurvedMotion(seed, speedModifier = 1, rangeModifier = 1) {
    const elementRef = useRef(null);
    const requestRef = useRef();
    
    // Generate stable random motion parameters based on seed
    const params = useMemo(() => {
        const seededRandom = (s) => {
            const x = Math.sin(s * 9999) * 10000;
            return x - Math.floor(x);
        };
        const r = (offset) => seededRandom(seed + offset);
        
        // Base speed reduced drastically (almost 0) for barely perceptible breathing
        const baseSpeed = 0.00005 * speedModifier;
        const baseRange = 25 * rangeModifier; 

        return {
            // Frequencies for X and Y axes
            fx1: (0.5 + r(1)) * baseSpeed,
            fy1: (0.5 + r(2)) * baseSpeed,
            fx2: (0.8 + r(3)) * baseSpeed, 
            fy2: (0.8 + r(4)) * baseSpeed,
            // Phases
            p1: r(5) * Math.PI * 2,
            p2: r(6) * Math.PI * 2,
            p3: r(7) * Math.PI * 2,
            p4: r(8) * Math.PI * 2,
            // Ranges
            rx1: (0.7 + r(9) * 0.6) * baseRange,
            ry1: (0.7 + r(10) * 0.6) * baseRange,
            rx2: (0.3 + r(11) * 0.4) * baseRange,
            ry2: (0.3 + r(12) * 0.4) * baseRange,
        };
    }, [seed, speedModifier, rangeModifier]);

    const animate = (time) => {
        const { fx1, fy1, fx2, fy2, p1, p2, p3, p4, rx1, ry1, rx2, ry2 } = params;
        
        const x = Math.sin(time * fx1 + p1) * rx1 + Math.cos(time * fx2 + p2) * rx2;
        const y = Math.cos(time * fy1 + p3) * ry1 + Math.sin(time * fy2 + p4) * ry2;

        if (elementRef.current) {
            elementRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [params]);

    return elementRef;
}


// --- Components ---

function DreamyElement({ element, style, textSnippet, seed }) {
  const { xStr, yStr, width, height, opacity, zIndex } = style;
  
  const isImage = element.type === 'image';
  const isText = element.type === 'text';

  const motionSpeed = isText ? 0.7 : 1.0;
  const motionRange = isText ? 1.2 : 0.8;
  
  const motionRef = useCurvedMotion(seed, motionSpeed, motionRange);
  const elementRef = isImage ? null : motionRef;

  const wrapperStyle = {
    position: 'absolute',
    left: xStr,
    top: yStr,
    width: width,
    height: height === 'auto' ? 'auto' : height,
    zIndex: zIndex,
    opacity: opacity,
    transform: isImage ? 'translate(-50%, -50%)' : undefined,
    willChange: isImage ? 'auto' : 'transform',
    backgroundColor: 'transparent',
  };
  
  // Image rendering - No crop (contain), No background
  if (isImage) {
    return (
      <div style={wrapperStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `url(${element.content}) center/contain no-repeat`,
          }}
        />
      </div>
    );
  }

  if (element.type === 'sticker') {
    return (
      <div ref={elementRef} style={{ ...wrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: width * 0.6,
            lineHeight: 1,
          }}
        >
          {element.content}
        </div>
      </div>
    );
  }

  if (isText) {
    return (
      <div ref={elementRef} style={wrapperStyle}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: `${textSnippet.fontFamily}, sans-serif`,
              color: '#111',
              fontSize: `${textSnippet.fontSize}px`,
              fontWeight: 400,
              opacity: textSnippet.opacityVariation, 
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textAlign: 'center',
              width: '100%',
              lineHeight: 1.3,
            }}
          >
            {textSnippet.fullText}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Updated: Grid-based placement logic
function BoardCoverArt({ elements = [] }) {
  const coverData = useMemo(() => {
    if (!elements || elements.length === 0) {
      return null;
    }

    const boardSeed = elements[0]?.id?.charCodeAt(0) || 42;
    let rngState = boardSeed;
    const seededRandom = () => {
      const x = Math.sin(rngState++) * 10000;
      return x - Math.floor(x);
    };
    const rand = (mod = 1) => seededRandom() * mod;

    const shuffled = [...elements].sort(() => seededRandom() - 0.5);
    
    // Select 9 - 18 items
    const count = 9 + Math.floor(rand(10));
    const safeCount = Math.min(count, shuffled.length);
    const selected = shuffled.slice(0, safeCount);
    
    // --- Grid Calculation (Stratified Sampling) ---
    // 1. Calculate optimal grid size (approx square)
    const cols = Math.ceil(Math.sqrt(safeCount));
    const rows = Math.ceil(safeCount / cols);
    
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    // 2. Generate all available slot indices
    const slots = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            slots.push({ r, c });
        }
    }

    // 3. Shuffle slots to assign elements randomly to grid cells
    const shuffledSlots = slots.sort(() => seededRandom() - 0.5);

    const styledElements = [];

    selected.forEach((el, index) => {
      const elSeed = el.id?.charCodeAt(0) + index;
      const isImage = el.type === 'image';
      const isText = el.type === 'text';
      
      // Get a unique slot for this element
      const slot = shuffledSlots[index] || { r: 0, c: 0 };

      let widthUnit, heightUnit; 

      if (isImage) {
        // Large images preserved
        widthUnit = 40 + rand(10); 
        heightUnit = widthUnit * (0.7 + rand(0.6)); 
      } else if (isText) {
        widthUnit = 25 + rand(20); 
        heightUnit = 12 + rand(8); 
      } else {
        widthUnit = 10 + rand(10);
        heightUnit = widthUnit;
      }

      // --- Position Generation within the Grid Cell ---
      const paddingX = cellWidth * 0.1; 
      const paddingY = cellHeight * 0.1;
      
      const localX = paddingX + rand(cellWidth - paddingX * 2);
      const localY = paddingY + rand(cellHeight - paddingY * 2);
      
      // Final global percentage
      const finalX = (slot.c * cellWidth) + localX;
      const finalY = (slot.r * cellHeight) + localY;

      const xStr = `${finalX}%`;
      const yStr = `${finalY}%`;
      const cssWidth = `${widthUnit}%`;
      const cssHeight = isText ? 'auto' : `${heightUnit}%`;
      
      const zIndex = isImage ? Math.floor(rand(5)) : 5 + Math.floor(rand(10));
      
      let textSnippet = null;
      if (isText) {
        const randomFontIndex = Math.floor(rand(AVAILABLE_FONTS.length));
        const randomSize = 13 + Math.floor(rand(3));
        const randomOpacity = 0.4 + rand(0.6);

        // --- Text Limit Logic ---
        let content = el.content || 'Untitled';
        if (content.length >15) {
            content = content.slice(0, 15) + '...';
        }

        textSnippet = { 
            fullText: content,
            fontFamily: AVAILABLE_FONTS[randomFontIndex],
            fontSize: randomSize,
            opacityVariation: randomOpacity
        };
      }
      
      styledElements.push({
        element: el,
        style: { xStr, yStr, width: cssWidth, height: cssHeight, opacity: 1.0, zIndex },
        textSnippet,
        seed: elSeed 
      });
    });
    
    return {
      elements: styledElements,
    };
  }, [elements]);
  
  if (!coverData || coverData.elements.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-30">
         <div className="w-8 h-8 rounded-full bg-gray-200" />
      </div>
    );
  }
  
  const { elements: styledElements } = coverData;
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {styledElements.map(({ element, style, textSnippet, seed }) => (
        <DreamyElement
          key={element.id}
          element={element}
          style={style}
          textSnippet={textSnippet}
          seed={seed}
        />
      ))}
    </div>
  );
}

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
            placeholder="💃 let's jam"
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
      className="group relative aspect-[4/3] bg-white rounded-[32px] cursor-pointer transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden"
      onClick={() => onSelect(board.id)}
      style={{ 
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' 
      }}
    >
      {/* Menu Button */}
      <div className="absolute top-6 right-6 z-30" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            showMenu 
              ? 'bg-white/80 backdrop-blur-md text-gray-900 shadow-sm' 
              : 'text-gray-500/70 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          <MoreHorizontalIcon />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-fadeIn z-40">
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

      {/* Cover Art Area */}
      <div className="flex-1 relative bg-[#F8F8F7]">
        {/* The actual elements */}
        <BoardCoverArt elements={board.elements || []} />
        
        {/* Vignette Mask Overlay */}
        <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.8) 75%, rgba(255,255,255,1) 100%)',
                mixBlendMode: 'lighten' 
            }}
        />
      </div>

      {/* Content at bottom */}
      <div className="mt-auto pointer-events-none p-6 pt-4 z-30 relative">
        <div className="absolute inset-0 -top-12 bg-gradient-to-t from-white via-white/90 to-transparent -z-10" />
        <h3 
          className="text-[28px] text-gray-900 leading-tight mb-2 truncate relative"
          style={{ fontFamily: 'SF-Pro-Display-Light, sans-serif' }}
        >
           {board.name || 'Untitled'}
        </h3>
        
        <p 
          className="text-sm text-gray-400 relative"
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
            elements: {},
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