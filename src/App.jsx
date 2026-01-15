/**
 * CyberJam Canvas - 协作式无限画布
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Theme & Utils
import { NEO } from './styles/theme';
import { generateId, getAvatarUrl, DEFAULT_ELEMENT_WIDTH, STICKER_LIST } from './utils/constants';
import { screenToWorld } from './utils/coordinates';
import { generateMagazineStyle, generateSmallRandomAngle } from './utils/styleGenerators';

// Components
import Header from './components/layout/Header';
import { ActionButtons } from './components/layout/ActionButtons';
import { Toolbar } from './components/toolbar/Toolbar';
import { BottomControls } from './components/toolbar/BottomControls';
import { ImageDrawer } from './components/drawers/ImageDrawer';
import { TextDrawer } from './components/drawers/TextDrawer';
import { StickerDrawer } from './components/drawers/StickerDrawer';
import { CanvasElement } from './components/canvas/CanvasElement';
import { Minimap } from './components/canvas/Minimap';
import { Connection, ConnectionPreview } from './components/canvas/Connection';
import { ContextMenu } from './components/ui/ContextMenu';

// ============================================================================
// INITIAL DATA
// ============================================================================
const INITIAL_ELEMENTS = [{
  id: '1', type: 'image',
  content: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
  x: 0, y: 0, width: DEFAULT_ELEMENT_WIDTH, height: null, rotation: 0,
  creator: 'Ruoz', avatar: getAvatarUrl('Ruoz'),
  reactions: { '❤️': ['Ruoz', 'Gong'] },
  isLocked: false, texture: 'none', shape: null, scale: 1, zIndex: 1
}];

const INITIAL_PICTURE_POOL = {
  public: [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=400' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400' }
  ],
  private: [{ id: 'pr1', url: 'https://images.unsplash.com/photo-1515405299443-f71bb768a69e?w=400' }]
};

// ============================================================================
// HELPERS
// ============================================================================
const simplifyPoints = (points, tolerance = 3) => {
  if (points.length < 3) return points;
  
  // 1. Distance Filter
  const filtered = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = filtered[filtered.length - 1];
    const dx = points[i].x - last.x;
    const dy = points[i].y - last.y;
    if (dx * dx + dy * dy > tolerance * tolerance) {
      filtered.push(points[i]);
    }
  }
  filtered.push(points[points.length - 1]);
  
  // 2. Smoothing (Simple Moving Average)
  if (filtered.length < 3) return filtered;
  const smoothed = [filtered[0]];
  // Multiple passes for smoother look
  let currentPoints = filtered;
  for (let pass = 0; pass < 2; pass++) {
    const nextPoints = [currentPoints[0]];
    for (let i = 1; i < currentPoints.length - 1; i++) {
      const prev = currentPoints[i - 1];
      const curr = currentPoints[i];
      const next = currentPoints[i + 1];
      nextPoints.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3
      });
    }
    nextPoints.push(currentPoints[currentPoints.length - 1]);
    currentPoints = nextPoints;
    smoothed.length = 0;
    smoothed.push(...currentPoints);
  }
  
  return smoothed;
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  // Refs
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const connectionInputRef = useRef(null);
  const editTextRef = useRef(null);
  const newCommentRef = useRef(null);
  const editCommentInputRef = useRef(null);
  const dragRef = useRef({ id: null, type: null, startX: 0, startY: 0, initialX: 0, initialY: 0, initialW: 0, initialRot: 0, initialScale: 1, initialViewport: { x: 0, y: 0 } });

  // Core State
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [elements, setElements] = useState(INITIAL_ELEMENTS);
  const [history, setHistory] = useState([]);
  const [connections, setConnections] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

  // UI State
  const [activeTool, setActiveTool] = useState(null);
  const [activeTab, setActiveTab] = useState('public');
  const [interactionState, setInteractionState] = useState('idle');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [draggedFromDrawer, setDraggedFromDrawer] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [newCommentTargetId, setNewCommentTargetId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Comment Edit State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  
  // Lasso State
  const [lassoState, setLassoState] = useState({ active: false, isDrawing: false, elementId: null, points: [] });

  // Text Drawer State
  const [textInput, setTextInput] = useState('New Idea...');
  // Initialize with a random style
  const [previewTextStyle, setPreviewTextStyle] = useState(generateMagazineStyle()); 
  const [picturePool, setPicturePool] = useState(INITIAL_PICTURE_POOL);
  const [drawerImageAngles, setDrawerImageAngles] = useState({});
  const [drawerStickerAngles, setDrawerStickerAngles] = useState({});

  // Computed
  const wordCount = useMemo(() => textInput.trim() ? textInput.trim().split(/\s+/).length : 0, [textInput]);
  const sortedElements = useMemo(() => [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)), [elements]);

  // ===== HELPERS =====
  const getWorldCoords = useCallback((sx, sy) => screenToWorld(sx, sy, viewport, viewportRef.current?.getBoundingClientRect()), [viewport]);
  const saveHistory = useCallback(() => setHistory(prev => [...prev, JSON.parse(JSON.stringify(elements))].slice(-30)), [elements]);

  const updateElement = useCallback((id, updates, save = true) => {
    if (save) saveHistory();
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, [saveHistory]);

  const addElement = useCallback((data) => {
    saveHistory();
    const zIndex = maxZIndex + 1;
    setMaxZIndex(zIndex);
    const el = { id: generateId(), creator: 'Me', avatar: getAvatarUrl('Me'), reactions: {}, isLocked: false, texture: 'none', scale: 1, zIndex, ...data };
    setElements(prev => [...prev, el]);
    setSelectedId(el.id);
  }, [maxZIndex, saveHistory]);

  // ===== INIT EFFECTS =====
  useEffect(() => {
    // Center viewport
    const t = setTimeout(() => {
      const r = viewportRef.current?.getBoundingClientRect();
      if (r) setViewport({ x: r.width / 2 - 110, y: r.height / 2 - 150, scale: 1 });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Init drawer angles
    const imgAngles = {};
    [...picturePool.public, ...picturePool.private].forEach(i => { if (!drawerImageAngles[i.id]) imgAngles[i.id] = generateSmallRandomAngle(8); });
    if (Object.keys(imgAngles).length) setDrawerImageAngles(prev => ({ ...prev, ...imgAngles }));
  }, [picturePool]);

  useEffect(() => {
    const angles = {};
    STICKER_LIST.forEach(s => { if (!drawerStickerAngles[s]) angles[s] = generateSmallRandomAngle(12); });
    if (Object.keys(angles).length) setDrawerStickerAngles(prev => ({ ...prev, ...angles }));
  }, []);

  // ===== KEYBOARD =====
  useEffect(() => {
    const handle = (e) => {
      if (editingTextId || newCommentTargetId || editingCommentId) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (history.length) { setElements(history.at(-1)); setHistory(p => p.slice(0, -1)); setSelectedId(null); } return; }
      if ((e.metaKey || e.ctrlKey) && e.key === '=') { e.preventDefault(); setViewport(p => ({ ...p, scale: Math.min(3, p.scale * 1.2) })); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') { e.preventDefault(); setViewport(p => ({ ...p, scale: Math.max(0.2, p.scale / 1.2) })); return; }
      if (e.key === 'Escape') { 
        setContextMenu(null); 
        setNewCommentTargetId(null); 
        setEditingCommentId(null);
        if (lassoState.active) setLassoState({ active: false, isDrawing: false, elementId: null, points: [] });
        return; 
      }
      if (!selectedId) return;
      const el = elements.find(i => i.id === selectedId);
      if (!el?.isLocked && (e.key === 'Delete' || e.key === 'Backspace')) { saveHistory(); setElements(p => p.filter(i => i.id !== selectedId)); setSelectedId(null); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') setClipboard({ ...el });
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && clipboard) { const z = maxZIndex + 1; setMaxZIndex(z); saveHistory(); setElements(p => [...p, { ...clipboard, id: generateId('cp'), x: el.x + 40, y: el.y + 40, zIndex: z }]); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [selectedId, elements, clipboard, history, editingTextId, newCommentTargetId, editingCommentId, maxZIndex, saveHistory, lassoState]);

  // ===== WHEEL ZOOM & PAN =====
  useEffect(() => {
    const c = viewportRef.current;
    if (!c) return;
    const handle = (e) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const r = c.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        const wb = { x: mx / viewport.scale - viewport.x, y: my / viewport.scale - viewport.y };
        const ns = Math.max(0.2, Math.min(3, viewport.scale * (e.deltaY > 0 ? 0.9 : 1.1)));
        setViewport({ x: mx / ns - wb.x, y: my / ns - wb.y, scale: ns });
      } else {
        // Pan
        // Note: dividing by scale ensures the pan speed feels 1:1 with finger movement regardless of zoom level
        setViewport(p => ({
          ...p,
          x: p.x - e.deltaX / p.scale,
          y: p.y - e.deltaY / p.scale
        }));
      }
    };
    c.addEventListener('wheel', handle, { passive: false });
    return () => c.removeEventListener('wheel', handle);
  }, [viewport]);

  // ===== MOUSE HANDLERS =====
  const handleCanvasMouseDown = (e) => {
    // If drawing lasso, don't pan or deselect
    if (lassoState.active && lassoState.elementId) {
      if (e.target.closest(`#content-${lassoState.elementId}`)) {
        setLassoState(p => ({ ...p, isDrawing: true, points: [{ x: e.clientX, y: e.clientY }] }));
        return;
      }
      // Clicked outside while ready to lasso -> cancel lasso
      setLassoState({ active: false, isDrawing: false, elementId: null, points: [] });
    }

    if (e.target === viewportRef.current || e.target.classList.contains('canvas-content') || e.target.classList.contains('canvas-grid')) {
      setSelectedId(null); setConnectFrom(null); setEditingTextId(null); setContextMenu(null);
      dragRef.current = { id: null, type: 'pan', startX: e.clientX, startY: e.clientY, initialViewport: { x: viewport.x, y: viewport.y } };
      setInteractionState('panning');
    }
  };

  const handleElementMouseDown = (e, id, type) => {
    e.stopPropagation();
    
    // Lasso Mode Check
    if (lassoState.active) {
      if (lassoState.elementId === id) {
        setLassoState(p => ({ ...p, isDrawing: true, points: [{ x: e.clientX, y: e.clientY }] }));
      } else {
        // Clicked another element -> cancel lasso
        setLassoState({ active: false, isDrawing: false, elementId: null, points: [] });
      }
      return;
    }

    const el = elements.find(i => i.id === id);
    if (activeTool === 'connect') {
      if (!connectFrom) { setConnectFrom(id); setSelectedId(id); }
      else if (connectFrom !== id) {
        const cid = generateId('cn');
        setConnections(p => [...p, { id: cid, from: connectFrom, to: id, text: '' }]);
        setConnectFrom(null); setEditingConnectionId(cid); setActiveTool(null);
        setTimeout(() => connectionInputRef.current?.focus(), 100);
      }
      return;
    }
    if (el.isLocked && (type === 'move' || type.startsWith('resize') || type === 'rotate')) return;
    if (type !== 'move') saveHistory();
    setSelectedId(id);
    const node = document.getElementById(`content-${id}`);
    const rect = node?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const centerY = rect ? rect.top + rect.height / 2 : 0;
    const initialDist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

    dragRef.current = { 
      id, type, startX: e.clientX, startY: e.clientY, 
      initialX: el.x, initialY: el.y, initialW: el.width, 
      initialRot: el.rotation, initialScale: el.scale || 1, 
      centerX, centerY, initialDist
    };
    setInteractionState(type === 'move' ? 'dragging' : type.startsWith('resize') ? 'resizing' : 'rotating');
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });

    // Lasso Drawing
    if (lassoState.isDrawing) {
      setLassoState(p => ({ ...p, points: [...p.points, { x: e.clientX, y: e.clientY }] }));
      return;
    }

    if (draggedFromDrawer) { setDraggedFromDrawer({ ...draggedFromDrawer, x: e.clientX, y: e.clientY }); return; }
    if (interactionState === 'idle') return;
    const dx = e.clientX - dragRef.current.startX, dy = e.clientY - dragRef.current.startY;
    if (interactionState === 'panning') setViewport(p => ({ ...p, x: dragRef.current.initialViewport.x + dx / p.scale, y: dragRef.current.initialViewport.y + dy / p.scale }));
    else if (interactionState === 'dragging') updateElement(dragRef.current.id, { x: dragRef.current.initialX + dx / viewport.scale, y: dragRef.current.initialY + dy / viewport.scale }, false);
    else if (interactionState === 'resizing') {
      const { id, initialW, initialScale, centerX, centerY, initialDist } = dragRef.current;
      const el = elements.find(i => i.id === id);
      if (!el || initialDist === 0) return;

      const currentDist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
      const ratio = currentDist / initialDist;

      if (el.type === 'text') updateElement(id, { scale: Math.max(0.5, initialScale * ratio) }, false);
      else updateElement(id, { width: Math.max(80, initialW * ratio) }, false);
    }
    else if (interactionState === 'rotating') {
      const { id, startX, startY, initialRot, centerX, centerY } = dragRef.current;
      const curA = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const strA = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
      updateElement(id, { rotation: initialRot + (curA - strA) }, false);
    }
  };

  const handleMouseUp = (e) => {
    // Finish Lasso
    if (lassoState.isDrawing) {
      const { elementId, points } = lassoState;
      const el = elements.find(i => i.id === elementId);
      const node = document.getElementById(`content-${elementId}`);
      
      // Apply smoothing before processing
      const smoothedPoints = simplifyPoints(points);
      
      if (el && node && smoothedPoints.length > 3) {
        const rect = node.getBoundingClientRect();
        const w = node.offsetWidth;
        const h = node.offsetHeight;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rad = -el.rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const polygonPoints = smoothedPoints.map(p => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          // Rotate point back to element local space
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          // Convert to percentage
          const pctX = ((rx + w / 2) / w) * 100;
          const pctY = ((ry + h / 2) / h) * 100;
          return `${Math.max(0, Math.min(100, pctX))}% ${Math.max(0, Math.min(100, pctY))}%`;
        });
        
        updateElement(elementId, { 
          shape: { 
            clipPath: `polygon(${polygonPoints.join(', ')})`,
            borderRadius: '0px'
          } 
        });
      }
      setLassoState({ active: false, isDrawing: false, elementId: null, points: [] });
      return;
    }

    if (draggedFromDrawer) {
      const wp = getWorldCoords(e.clientX, e.clientY);
      addElement({
        type: draggedFromDrawer.type,
        content: draggedFromDrawer.type === 'image' ? draggedFromDrawer.data.url : draggedFromDrawer.type === 'sticker' ? draggedFromDrawer.data : textInput,
        x: wp.x - 110, y: wp.y - 100, width: DEFAULT_ELEMENT_WIDTH,
        height: draggedFromDrawer.type === 'text' ? 140 : null, rotation: 0,
        shape: null,
        style: draggedFromDrawer.type === 'text' ? { ...previewTextStyle } : {},
      });
      if (draggedFromDrawer.type === 'image') setPicturePool(p => ({ ...p, [activeTab]: p[activeTab].filter(i => i.id !== draggedFromDrawer.data.id) }));
      setDraggedFromDrawer(null);
    }
    setInteractionState('idle');
    dragRef.current = { id: null, type: null };
  };

  // ===== CONTEXT MENU & COMMENTS =====
  const handleContextMenu = (e, elementId) => {
    e.preventDefault();
    if (!elementId) return; // Only allow context menu on elements
    setContextMenu({ 
      x: e.clientX, 
      y: e.clientY, 
      targetId: elementId 
    });
  };

  const startAddingComment = () => {
    if (contextMenu && contextMenu.targetId) {
      setNewCommentTargetId(contextMenu.targetId);
      setNewCommentText('');
      setContextMenu(null);
      setTimeout(() => newCommentRef.current?.focus(), 100);
    }
  };

  const addElementComment = () => {
    if (!newCommentText.trim() || !newCommentTargetId) return;
    setComments(p => [...p, {
      id: generateId('c'),
      targetId: newCommentTargetId,
      author: 'Me',
      avatar: getAvatarUrl('Me'),
      text: newCommentText.trim(),
      timestamp: Date.now()
    }]);
    setNewCommentTargetId(null);
    setNewCommentText('');
  };

  // Comment Actions
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
    setTimeout(() => editCommentInputRef.current?.focus(), 100);
  };

  const handleSaveEditComment = () => {
    if (!editingCommentId || !editingCommentText.trim()) return;
    setComments(p => p.map(c => c.id === editingCommentId ? { ...c, text: editingCommentText.trim() } : c));
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = (commentId) => {
    setComments(p => p.filter(c => c.id !== commentId));
  };

  // ===== FILE HANDLING =====
  const handleFileUpload = (e) => {
    Array.from(e.target.files || []).forEach(f => {
      if (!f.type.startsWith('image/')) return;
      const r = new FileReader();
      r.onload = (ev) => { const id = generateId('img'); setPicturePool(p => ({ ...p, [activeTab]: [...p[activeTab], { id, url: ev.target.result }] })); setDrawerImageAngles(p => ({ ...p, [id]: generateSmallRandomAngle(8) })); };
      r.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f?.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = (ev) => { const wp = getWorldCoords(e.clientX, e.clientY); addElement({ type: 'image', content: ev.target.result, x: wp.x - 110, y: wp.y - 100, width: DEFAULT_ELEMENT_WIDTH, rotation: 0, shape: null }); };
    r.readAsDataURL(f);
  };

  // ===== CONNECTION PREVIEW =====
  const connectionPreview = useMemo(() => {
    if (!connectFrom || activeTool !== 'connect') return null;
    const from = elements.find(el => el.id === connectFrom);
    if (!from) return null;
    const x1 = from.x + (from.width || 220) / 2, y1 = from.y + (from.type === 'image' ? 140 : 60);
    const wp = getWorldCoords(mousePosition.x, mousePosition.y);
    return { x1, y1, x2: wp.x, y2: wp.y };
  }, [connectFrom, activeTool, elements, mousePosition, getWorldCoords]);

  // ===== TOOLBAR ACTIONS =====
  const toolbarActions = (el) => ({
    onUndo: () => { if (history.length) { setElements(history.at(-1)); setHistory(p => p.slice(0, -1)); setSelectedId(null); } },
    onShuffle: () => !el.isLocked && updateElement(el.id, { style: generateMagazineStyle() }), // Re-enabled style shuffle
    onEdit: () => !el.isLocked && setEditingTextId(el.id) && setTimeout(() => editTextRef.current?.focus(), 100),
    onLasso: () => !el.isLocked && setLassoState({ active: true, isDrawing: false, elementId: el.id, points: [] }),
    onReset: () => !el.isLocked && updateElement(el.id, { shape: { clipPath: 'none', borderRadius: '4px' } }),
    onMoveUpLayer: () => { const z = maxZIndex + 1; setMaxZIndex(z); updateElement(el.id, { zIndex: z }); },
    onDuplicate: () => { const z = maxZIndex + 1; setMaxZIndex(z); saveHistory(); setElements(p => [...p, { ...JSON.parse(JSON.stringify(el)), id: generateId('dp'), x: el.x + 40, y: el.y + 40, zIndex: z }]); },
    onToggleLock: () => updateElement(el.id, { isLocked: !el.isLocked }),
    onDelete: () => { if (!el.isLocked) { saveHistory(); setElements(p => p.filter(i => i.id !== el.id)); setSelectedId(null); } },
  });

  // ===== RENDER =====
  return (
    <div className="flex h-screen w-full overflow-hidden select-none relative" style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', background: NEO.bg, color: NEO.ink }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={() => setContextMenu(null)}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[10]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />

      <Header />
      <Toolbar activeTool={activeTool} onToolChange={(t) => { setActiveTool(t); setConnectFrom(null); }} />
      
      <ImageDrawer isOpen={activeTool === 'image'} onClose={() => setActiveTool(null)} activeTab={activeTab} onTabChange={setActiveTab} picturePool={picturePool} drawerImageAngles={drawerImageAngles} onUploadClick={() => fileInputRef.current?.click()} onImageDragStart={(img, x, y) => setDraggedFromDrawer({ type: 'image', data: img, x, y })} fileInputRef={fileInputRef} onFileUpload={handleFileUpload} />
      <TextDrawer isOpen={activeTool === 'text'} onClose={() => setActiveTool(null)} textInput={textInput} onTextChange={setTextInput} wordCount={wordCount} previewStyle={previewTextStyle} onShuffle={() => setPreviewTextStyle(generateMagazineStyle())} onDragStart={(x, y) => setDraggedFromDrawer({ type: 'text', data: textInput, x, y })} />
      <StickerDrawer isOpen={activeTool === 'sticker'} onClose={() => setActiveTool(null)} drawerStickerAngles={drawerStickerAngles} onStickerDragStart={(s, x, y) => setDraggedFromDrawer({ type: 'sticker', data: s, x, y })} />

      <main 
        ref={viewportRef} 
        className="flex-1 relative overflow-hidden" 
        style={{ 
          background: '#F3F2EE', 
          cursor: lassoState.active ? 'crosshair' : (interactionState === 'panning' ? 'grabbing' : 'grab') 
        }} 
        onMouseDown={handleCanvasMouseDown} 
        onContextMenu={(e) => handleContextMenu(e, null)}
        onDrop={handleCanvasDrop} 
        onDragOver={e => e.preventDefault()}
      >
        <div className="canvas-grid absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${NEO.accent} 1px, transparent 1px)`, backgroundSize: `${30 * viewport.scale}px ${30 * viewport.scale}px`, backgroundPosition: `${viewport.x * viewport.scale}px ${viewport.y * viewport.scale}px`, opacity: 0.6 }} />
        <div className="canvas-content absolute" style={{ transformOrigin: '0 0', transform: `scale(${viewport.scale}) translate(${viewport.x}px, ${viewport.y}px)`, transition: isAnimating ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none' }}>
          <svg className="absolute overflow-visible pointer-events-none" style={{ width: 1, height: 1 }}>
            {connectionPreview && <ConnectionPreview {...connectionPreview} />}
            {connections.map(c => <Connection key={c.id} connection={c} fromElement={elements.find(e => e.id === c.from)} toElement={elements.find(e => e.id === c.to)} isEditing={editingConnectionId === c.id} inputRef={connectionInputRef} onEdit={setEditingConnectionId} onBlur={() => setEditingConnectionId(null)} onChange={(id, text) => setConnections(p => p.map(x => x.id === id ? { ...x, text } : x))} />)}
          </svg>
          
          {/* Elements */}
          {sortedElements.map(el => (
            <CanvasElement 
              key={el.id} 
              element={el} 
              isSelected={selectedId === el.id} 
              isEditing={editingTextId === el.id} 
              editRef={editTextRef} 
              onMouseDown={handleElementMouseDown} 
              onClick={e => { e.stopPropagation(); setSelectedId(el.id); setContextMenu(null); }} 
              onContextMenu={(e) => handleContextMenu(e, el.id)}
              onSubmitEdit={t => { if (t.trim()) { saveHistory(); updateElement(el.id, { content: t.trim() }); } setEditingTextId(null); }} 
              onStartEdit={() => !el.isLocked && setEditingTextId(el.id)} 
              toolbarProps={toolbarActions(el)}
              // Comments Props
              comments={comments.filter(c => c.targetId === el.id)}
              isAddingComment={newCommentTargetId === el.id}
              commentText={newCommentText}
              onCommentTextChange={setNewCommentText}
              onAddCommentSubmit={addElementComment}
              onAddCommentCancel={() => { setNewCommentTargetId(null); setNewCommentText(''); }}
              commentInputRef={newCommentRef}
              // Comment Edit Props
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
              editingCommentId={editingCommentId}
              editingCommentText={editingCommentText}
              onEditingCommentTextChange={setEditingCommentText}
              onSaveEditComment={handleSaveEditComment}
              onCancelEditComment={handleCancelEditComment}
              editCommentInputRef={editCommentInputRef}
            />
          ))}
        </div>

        {/* Lasso Overlay */}
        {lassoState.isDrawing && lassoState.points.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none z-[2000]" style={{ width: '100%', height: '100%' }}>
            <polyline 
              points={lassoState.points.map(p => `${p.x},${p.y}`).join(' ')} 
              fill="none" 
              stroke={NEO.ink} 
              strokeWidth={2} 
              strokeDasharray="4 4" 
            />
          </svg>
        )}
      </main>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onAddComment={startAddingComment} 
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {draggedFromDrawer && <div className="fixed pointer-events-none z-[1000]" style={{ left: draggedFromDrawer.x, top: draggedFromDrawer.y, transform: 'translate(-50%, -50%) scale(0.85)', opacity: 0.95 }}>{draggedFromDrawer.type === 'image' ? <div style={{ padding: '4px', background: 'white', borderRadius: NEO.radius, boxShadow: NEO.shadow }}><img src={draggedFromDrawer.data.url} className="w-36" style={{ borderRadius: NEO.radiusSm }} /></div> : draggedFromDrawer.type === 'sticker' ? <div className="p-5 text-4xl" style={{ filter: 'drop-shadow(0 0 0 white) drop-shadow(3px 3px 0px white) drop-shadow(-3px -3px 0px white)' }}>{draggedFromDrawer.data}</div> : <div style={{ ...previewTextStyle, transform: 'none', fontSize: `${previewTextStyle.fontSize * 0.8}px` }}>{textInput || "..."}</div>}</div>}
      {activeTool === 'connect' && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 z-[150] text-sm font-medium" style={{ background: NEO.ink, color: NEO.bg, boxShadow: NEO.shadowHover, borderRadius: NEO.radiusLg }}>{connectFrom ? '👆 Click another element to connect' : '👆 Click an element to start'}</div>}
      {lassoState.active && !lassoState.isDrawing && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 z-[150] text-sm font-medium animate-pulse" style={{ background: NEO.ink, color: NEO.bg, boxShadow: NEO.shadowHover, borderRadius: NEO.radiusLg }}>✂️ Draw on the image to crop it</div>}

      <BottomControls scale={viewport.scale} onZoomIn={() => setViewport(p => ({ ...p, scale: Math.min(3, p.scale * 1.2) }))} onZoomOut={() => setViewport(p => ({ ...p, scale: Math.max(0.2, p.scale / 1.2) }))} onSnapToCenter={() => { const r = viewportRef.current?.getBoundingClientRect(); if (r && elements.length) { const cx = elements.reduce((s, e) => s + e.x + (e.width || 220) / 2, 0) / elements.length; const cy = elements.reduce((s, e) => s + e.y + 150, 0) / elements.length; setIsAnimating(true); setViewport({ x: r.width / 2 - cx, y: r.height / 2 - cy, scale: 1 }); setTimeout(() => setIsAnimating(false), 400); } }} />
      <Minimap elements={elements} selectedId={selectedId} viewport={viewport} viewportRef={viewportRef} onNavigate={(x, y) => { const r = viewportRef.current?.getBoundingClientRect(); if (r) setViewport(p => ({ x: r.width / 2 / p.scale - x, y: r.height / 2 / p.scale - y, scale: p.scale })); }} />
      <ActionButtons />

      <style>{`* { font-family: "SF Pro Display", -apple-system, sans-serif; color-scheme: light; } body { background: ${NEO.bg}; margin: 0; } ::-webkit-scrollbar { display: none; } .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); } @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } } .caret-animate { animation: caretBlink 1s step-end infinite; } @keyframes caretBlink { 0%, 100% { caret-color: ${NEO.ink}; } 50% { caret-color: transparent; } }`}</style>
    </div>
  );
}
