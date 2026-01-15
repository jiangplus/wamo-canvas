import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- Neomorphism Style Constants ---
const NEO = {
  bg: '#FAF9F6',
  surface: 'rgba(255, 255, 255, 0.7)',
  ink: '#3A3A36',
  inkLight: '#A8A8A2',
  accent: '#E6E2D3',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
  shadowHover: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
  border: 'rgba(230, 226, 211, 0.4)',
};

// --- Icon Components (with explicit colors for visibility) ---
// #region agent log
const Icon = ({ children, size = 22 }) => {
  fetch('http://127.0.0.1:7244/ingest/ff3ad053-2be3-42e3-b12b-ce5b29e71fc0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:Icon',message:'Icon render FIXED',data:{size,hasChildren:!!children,childrenType:typeof children,strokeColor:'currentColor'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A-B-E',runId:'post-fix'})}).catch(()=>{});
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
};
// #endregion

const IconImage = () => <Icon><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Icon>;
const IconType = () => <Icon><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></Icon>;
const IconSmile = () => <Icon><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></Icon>;
const IconConnect = () => <Icon><path d="M4 20 C 4 10, 20 14, 20 4" strokeDasharray="3 2" /><path d="M2 18l2 2 2-2M18 6l2-2 2 2" /></Icon>;
const IconTrash = () => <Icon size={18}><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></Icon>;
const IconCopy = () => <Icon size={18}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></Icon>;
const IconLock = () => <Icon size={18}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Icon>;
const IconUnlock = () => <Icon size={18}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></Icon>;
const IconShuffle = () => <Icon size={18}><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></Icon>;
const IconEdit = () => <Icon size={18}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>;
const IconUndo = () => <Icon size={18}><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></Icon>;
const IconMagic = () => <Icon size={18}><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M17.66 19.07l1.41 1.41M20 12h2M17.66 4.93l1.41-1.41"/></Icon>;
const IconScissors = () => <Icon size={18}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/></Icon>;
const IconCrop = () => <Icon size={18}><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></Icon>;
const IconPlus = () => <Icon size={18}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const IconMessage = () => <Icon size={18}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Icon>;
const IconShare = () => <Icon><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></Icon>;
const IconPublish = () => <Icon><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></Icon>;
const IconUpload = () => <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>;
const IconZoomIn = () => <Icon size={20}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></Icon>;
const IconZoomOut = () => <Icon size={20}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></Icon>;
const IconHome = () => <Icon size={20}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>;
const IconTarget = () => <Icon size={20}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;

// --- Circular Icon Button Component ---
// #region agent log
const IconButton = ({ onClick, title, active, danger, disabled, children }) => {
  const bgColor = active ? NEO.ink : 'transparent';
  const textColor = active ? NEO.bg : danger ? '#F87171' : NEO.ink;
  fetch('http://127.0.0.1:7244/ingest/ff3ad053-2be3-42e3-b12b-ce5b29e71fc0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:IconButton',message:'IconButton render v3',data:{title,active,danger,disabled,bgColor,textColor},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F-G-H',runId:'post-fix-2'})}).catch(()=>{});
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '50%',
        transition: 'all 0.2s',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
};
// #endregion

// --- Style Generators ---
const generateMagazineStyle = () => {
  const fonts = ['"SF Pro Display"', 'Georgia', 'monospace', '"Courier New"'];
  const colors = ['#3A3A36', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
  const bgColors = ['#FAF9F6', '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe', '#fce7f3'];
  return {
    fontFamily: fonts[Math.floor(Math.random() * fonts.length)],
    fontSize: 22,
    color: colors[Math.floor(Math.random() * colors.length)],
    background: bgColors[Math.floor(Math.random() * bgColors.length)],
    padding: '24px',
    borderRadius: '24px',
    transform: `rotate(${(Math.random() - 0.5) * 8}deg)`,
    boxShadow: NEO.shadow,
    border: `1px solid ${NEO.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    wordBreak: 'break-word'
  };
};

const getRandomTexture = () => {
  const filters = ['contrast(1.5) brightness(1.1)', 'grayscale(1) contrast(1.3)', 'sepia(0.5)', 'brightness(0.9) contrast(1.5)', 'hue-rotate(90deg)'];
  return filters[Math.floor(Math.random() * filters.length)];
};

const getRandomShape = () => {
  const shapes = ['24px', '32px', '50%', '30% 70% 70% 30% / 30% 30% 70% 70%', '20px 20px 0 20px', '0 20px 20px 0'];
  return shapes[Math.floor(Math.random() * shapes.length)];
};

const EMOJI_LIST = ['❤️', '🔥', '✨', '💡', '👍', '👀', '🎯', '💯', '🚀', '💪', '🎨', '💭'];

export default function App() {
  // ===== VIEWPORT STATE =====
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  
  // ===== ELEMENTS STATE =====
  const [elements, setElements] = useState([
    { id: '1', type: 'image', content: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400', x: 0, y: 0, width: 220, height: null, rotation: 0, creator: 'Ruoz', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ruoz', reactions: { '❤️': ['Ruoz', 'Gong'] }, isLocked: false, texture: 'none', shape: '24px', scale: 1 },
  ]);

  // ===== OTHER STATE =====
  const [history, setHistory] = useState([]);
  const [connections, setConnections] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [activeTab, setActiveTab] = useState('public');
  const [draggedFromDrawer, setDraggedFromDrawer] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [interactionState, setInteractionState] = useState('idle');

  const [textInput, setTextInput] = useState('New Idea...');
  const [previewTextStyle, setPreviewTextStyle] = useState(generateMagazineStyle());

  const [picturePool, setPicturePool] = useState({
    public: [{ id: 'p1', url: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=400' }, { id: 'p2', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400' }],
    private: [{ id: 'pr1', url: 'https://images.unsplash.com/photo-1515405299443-f71bb768a69e?w=400' }]
  });

  // ===== REFS =====
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const connectionInputRef = useRef(null);
  const dragRef = useRef({ id: null, type: null, startX: 0, startY: 0, initialX: 0, initialY: 0, initialW: 0, initialRot: 0, initialScale: 1, initialViewport: { x: 0, y: 0 } });

  const wordCount = useMemo(() => textInput.trim() ? textInput.trim().split(/\s+/).length : 0, [textInput]);

  // ===== COMPUTED: Bounds of all elements =====
  const elementsBounds = useMemo(() => {
    if (elements.length === 0) return { minX: -500, maxX: 500, minY: -500, maxY: 500 };
    const padding = 200;
    return {
      minX: Math.min(...elements.map(el => el.x)) - padding,
      maxX: Math.max(...elements.map(el => el.x + (el.width || 220))) + padding,
      minY: Math.min(...elements.map(el => el.y)) - padding,
      maxY: Math.max(...elements.map(el => el.y + 300)) + padding,
    };
  }, [elements]);

  // ===== COORDINATE CONVERSION =====
  const screenToWorld = useCallback((screenX, screenY) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    return {
      x: (screenX - rect.left) / viewport.scale - viewport.x,
      y: (screenY - rect.top) / viewport.scale - viewport.y
    };
  }, [viewport]);

  // ===== HISTORY =====
  const saveHistory = () => setHistory(prev => [...prev, JSON.parse(JSON.stringify(elements))].slice(-30));
  const undo = () => {
    if (history.length === 0) return;
    setElements(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
    setSelectedId(null);
  };

  // ===== VIEWPORT CONTROLS =====
  const zoomIn = () => setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }));
  const zoomOut = () => setViewport(prev => ({ ...prev, scale: Math.max(0.2, prev.scale / 1.2) }));

  // Animated snap to center
  const snapToCenter = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || elements.length === 0) {
      setViewport({ x: 0, y: 0, scale: 1 });
      return;
    }
    
    // Calculate center of all elements
    const centerX = elements.reduce((sum, el) => sum + el.x + (el.width || 220) / 2, 0) / elements.length;
    const centerY = elements.reduce((sum, el) => sum + el.y + 150, 0) / elements.length;
    
    const targetViewport = {
      x: (rect.width / 2) / 1 - centerX,
      y: (rect.height / 2) / 1 - centerY,
      scale: 1
    };
    
    setIsAnimating(true);
    setViewport(targetViewport);
    setTimeout(() => setIsAnimating(false), 400);
  }, [elements]);

  // Center viewport on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        setViewport({
          x: rect.width / 2 - 110,
          y: rect.height / 2 - 150,
          scale: 1
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === '=') { e.preventDefault(); zoomIn(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') { e.preventDefault(); zoomOut(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') { e.preventDefault(); snapToCenter(); return; }
      
      if (!selectedId) return;
      const el = elements.find(i => i.id === selectedId);
      if (!el || el.isLocked) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') { 
        saveHistory(); 
        setElements(prev => prev.filter(i => i.id !== selectedId)); 
        setSelectedId(null); 
      }
      if ((e.metaKey || e.ctrlKey)) {
        if (e.key === 'c') setClipboard({ ...el });
        if (e.key === 'v' && clipboard) { 
          saveHistory(); 
          const nId = `cp-${Date.now()}`; 
          setElements([...elements, { ...clipboard, id: nId, x: el.x + 40, y: el.y + 40, creator: 'Me', reactions: {} }]); 
          setSelectedId(nId); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, clipboard, history, snapToCenter]);

  // ===== PASTE TEXT =====
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const text = e.clipboardData.getData('text');
      if (!text) return;
      
      const words = text.trim().split(/\s+/).slice(0, 140);
      saveHistory();
      const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
      
      const newEl = {
        id: `el-${Date.now()}`, type: 'text', content: words.join(' '),
        x: centerWorld.x - 110, y: centerWorld.y - 70, width: 220, height: 140,
        rotation: 0, creator: 'Me', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me',
        reactions: {}, isLocked: false, texture: 'none', shape: '24px',
        style: generateMagazineStyle(), scale: 1
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [screenToWorld]);

  // ===== WHEEL ZOOM =====
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldBefore = { x: mouseX / viewport.scale - viewport.x, y: mouseY / viewport.scale - viewport.y };
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.2, Math.min(3, viewport.scale * delta));
        setViewport({
          x: mouseX / newScale - worldBefore.x,
          y: mouseY / newScale - worldBefore.y,
          scale: newScale
        });
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [viewport]);

  // ===== DROP FILES =====
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      saveHistory();
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const newEl = {
        id: `el-${Date.now()}`, type: 'image', content: event.target.result,
        x: worldPos.x - 110, y: worldPos.y - 100, width: 220, height: null,
        rotation: 0, creator: 'Me', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me',
        reactions: {}, isLocked: false, texture: 'none', shape: '24px', scale: 1
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    };
    reader.readAsDataURL(file);
  };

  // ===== FILE UPLOAD =====
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setPicturePool(prev => ({
          ...prev,
          [activeTab]: [...prev[activeTab], { id: `img-${Date.now()}-${Math.random()}`, url: event.target.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // ===== MOUSE HANDLERS =====
  const handleCanvasMouseDown = (e) => {
    if (e.target === viewportRef.current || e.target.classList.contains('canvas-content') || e.target.classList.contains('canvas-grid')) {
      setSelectedId(null);
      setConnectFrom(null);
      setShowEmojiPicker(null);
      dragRef.current = { id: null, type: 'pan', startX: e.clientX, startY: e.clientY, initialViewport: { x: viewport.x, y: viewport.y } };
      setInteractionState('panning');
    }
  };

  const handleElementMouseDown = (e, id, type) => {
    e.stopPropagation();
    const el = elements.find(i => i.id === id);
    
    if (activeTool === 'connect') {
      if (type === 'move' && !el.isLocked) {
        setSelectedId(id);
        dragRef.current = { id, type: 'move', startX: e.clientX, startY: e.clientY, initialX: el.x, initialY: el.y };
        setInteractionState('dragging');
        return;
      }
      if (!connectFrom) setConnectFrom(id);
      else if (connectFrom !== id) {
        const newConnId = `cn-${Date.now()}`;
        setConnections([...connections, { id: newConnId, from: connectFrom, to: id, text: '' }]);
        setConnectFrom(null);
        setEditingConnectionId(newConnId);
        setTimeout(() => connectionInputRef.current?.focus(), 100);
      }
      return;
    }
    
    if (el.isLocked && (type === 'move' || type.startsWith('resize') || type === 'rotate')) return;
    if (type !== 'move') saveHistory();
    setSelectedId(id);
    
    const node = document.getElementById(`content-${id}`);
    const rect = node?.getBoundingClientRect();
    dragRef.current = {
      id, type, startX: e.clientX, startY: e.clientY,
      initialX: el.x, initialY: el.y, initialW: el.width,
      initialRot: el.rotation, initialScale: el.scale || 1,
      centerX: rect ? rect.left + rect.width / 2 : 0,
      centerY: rect ? rect.top + rect.height / 2 : 0
    };
    setInteractionState(type === 'move' ? 'dragging' : type.startsWith('resize') ? 'resizing' : 'rotating');
  };

  const handleMouseMove = (e) => {
    if (draggedFromDrawer) {
      setDraggedFromDrawer({ ...draggedFromDrawer, x: e.clientX, y: e.clientY });
      return;
    }
    if (interactionState === 'idle') return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    if (interactionState === 'panning') {
      setViewport(prev => ({
        ...prev,
        x: dragRef.current.initialViewport.x + dx / prev.scale,
        y: dragRef.current.initialViewport.y + dy / prev.scale
      }));
    } else if (interactionState === 'dragging') {
      const { id, initialX, initialY } = dragRef.current;
      const newX = initialX + dx / viewport.scale;
      const newY = initialY + dy / viewport.scale;
      updateEl(id, { x: newX, y: newY }, false);
      
      // Auto-pan when dragging near edges
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const edgeThreshold = 100;
        const panSpeed = 10 / viewport.scale;
        let panX = 0, panY = 0;
        if (e.clientX - rect.left < edgeThreshold) panX = panSpeed;
        if (rect.right - e.clientX < edgeThreshold) panX = -panSpeed;
        if (e.clientY - rect.top < edgeThreshold) panY = panSpeed;
        if (rect.bottom - e.clientY < edgeThreshold) panY = -panSpeed;
        if (panX || panY) {
          setViewport(prev => ({ ...prev, x: prev.x + panX, y: prev.y + panY }));
        }
      }
    } else if (interactionState === 'resizing') {
      const { id, initialW, initialScale } = dragRef.current;
      const el = elements.find(i => i.id === id);
      if (el?.type === 'text') {
        updateEl(id, { scale: Math.max(0.5, initialScale + dx / 200) }, false);
      } else {
        updateEl(id, { width: Math.max(80, initialW + dx / viewport.scale) }, false);
      }
    } else if (interactionState === 'rotating') {
      const { id, startX, startY, initialRot, centerX, centerY } = dragRef.current;
      const curA = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const strA = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
      updateEl(id, { rotation: initialRot + (curA - strA) }, false);
    }
  };

  const handleMouseUp = (e) => {
    if (draggedFromDrawer) {
      saveHistory();
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const newEl = {
        id: `el-${Date.now()}`, type: draggedFromDrawer.type,
        content: draggedFromDrawer.type === 'image' ? draggedFromDrawer.data.url : (draggedFromDrawer.type === 'sticker' ? draggedFromDrawer.data : textInput),
        x: worldPos.x - 110, y: worldPos.y - 100,
        width: 220, height: draggedFromDrawer.type === 'text' ? 140 : null,
        rotation: 0, creator: 'Me', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me',
        reactions: {}, isLocked: false, texture: 'none', shape: '24px',
        style: draggedFromDrawer.type === 'text' ? { ...previewTextStyle } : {}, scale: 1
      };
      setElements([...elements, newEl]);
      if (draggedFromDrawer.type === 'image') {
        setPicturePool({ ...picturePool, [activeTab]: picturePool[activeTab].filter(i => i.id !== draggedFromDrawer.data.id) });
      }
      setSelectedId(newEl.id);
      setDraggedFromDrawer(null);
    }
    setInteractionState('idle');
    dragRef.current = { id: null, type: null };
  };

  // ===== ELEMENT OPERATIONS =====
  const updateEl = (id, updates, shouldSave = true) => {
    if (shouldSave) saveHistory();
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const duplicate = (el) => {
    saveHistory();
    const newEl = { ...JSON.parse(JSON.stringify(el)), id: `dp-${Date.now()}`, x: el.x + 40, y: el.y + 40, creator: 'Me', reactions: {} };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const deleteElement = (el) => {
    if (el.isLocked) return;
    saveHistory();
    setElements(elements.filter(i => i.id !== el.id));
    setSelectedId(null);
  };

  const toggleLock = (el) => updateEl(el.id, { isLocked: !el.isLocked });

  // Toggle emoji reaction (click to add/remove)
  const toggleReaction = (elId, emoji) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elId) return el;
      const reactions = { ...el.reactions };
      if (!reactions[emoji]) reactions[emoji] = [];
      
      if (reactions[emoji].includes('Me')) {
        // Remove reaction
        reactions[emoji] = reactions[emoji].filter(u => u !== 'Me');
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        // Add reaction
        reactions[emoji] = [...reactions[emoji], 'Me'];
      }
      return { ...el, reactions };
    }));
    setShowEmojiPicker(null);
  };

  const addComment = (elId) => {
    const text = prompt("Add a comment...");
    if (!text) return;
    setComments([...comments, {
      id: `c-${Date.now()}`, targetId: elId, author: 'Me',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me', text, hearts: 0
    }]);
  };

  // ===== MINIMAP =====
  const minimapSize = { width: 160, height: 100 };
  const minimapScale = useMemo(() => {
    const worldWidth = elementsBounds.maxX - elementsBounds.minX;
    const worldHeight = elementsBounds.maxY - elementsBounds.minY;
    return Math.min(minimapSize.width / worldWidth, minimapSize.height / worldHeight, 0.05);
  }, [elementsBounds]);

  const handleMinimapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / minimapScale + elementsBounds.minX;
    const clickY = (e.clientY - rect.top) / minimapScale + elementsBounds.minY;
    
    const viewportRect = viewportRef.current?.getBoundingClientRect();
    if (viewportRect) {
      setIsAnimating(true);
      setViewport({
        x: viewportRect.width / 2 / viewport.scale - clickX,
        y: viewportRect.height / 2 / viewport.scale - clickY,
        scale: viewport.scale
      });
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  return (
    <div 
      className="flex h-screen w-full overflow-hidden select-none relative"
      style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', background: NEO.bg, color: NEO.ink }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Paper texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[10]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />

      {/* --- Logo --- */}
      <div className="fixed top-8 left-8 z-[150] flex items-center gap-3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: NEO.ink, color: NEO.bg, boxShadow: NEO.shadow }}>
          <IconMagic />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-xs uppercase tracking-[0.2em]">CyberJam</span>
          <span className="text-[9px] font-medium uppercase" style={{ color: NEO.inkLight }}>Symbiotic Space</span>
        </div>
      </div>

      {/* --- Online Users --- */}
      <div className="fixed top-8 right-8 z-[150] flex items-center gap-4 rounded-full px-4 py-2" style={{ background: NEO.surface, backdropFilter: 'blur(20px)', border: `1px solid ${NEO.border}`, boxShadow: NEO.shadow }}>
        <div className="flex -space-x-3">
          {[1,2,3].map(i => (
            <div key={i} className="w-9 h-9 rounded-full overflow-hidden bg-white" style={{ border: `2px solid ${NEO.bg}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i+50}`} className="w-full h-full" />
            </div>
          ))}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: NEO.inkLight }}>+2 Online</span>
        <div className="w-11 h-11 rounded-full overflow-hidden bg-white ml-2" style={{ border: '2px solid white', boxShadow: NEO.shadow }}>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Me" className="w-full h-full" />
        </div>
      </div>

      {/* --- Left Toolbar --- */}
      <aside onMouseDown={e => e.stopPropagation()} className="fixed top-1/2 left-8 -translate-y-1/2 flex flex-col items-center py-4 px-3 gap-2 z-[140] rounded-full" style={{ background: NEO.surface, backdropFilter: 'blur(20px)', border: `1px solid ${NEO.border}`, boxShadow: NEO.shadow }}>
        {[{ icon: IconImage, id: 'image' }, { icon: IconType, id: 'text' }, { icon: IconSmile, id: 'sticker' }, { icon: IconConnect, id: 'connect' }].map(tool => (
          <IconButton key={tool.id} onClick={() => { setActiveTool(activeTool === tool.id ? null : tool.id); setConnectFrom(null); }} active={activeTool === tool.id}>
            <tool.icon />
          </IconButton>
        ))}
      </aside>

      {/* --- Drawer --- */}
      <div 
        onMouseDown={e => e.stopPropagation()}
        className={`fixed top-8 left-28 bottom-8 w-80 flex flex-col rounded-[32px] overflow-hidden transition-all duration-500 z-[130] ${activeTool && activeTool !== 'connect' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: `1px solid ${NEO.border}`, boxShadow: NEO.shadow }}
      >
        <div className="p-8 pb-4 flex items-center justify-between">
          <h2 className="text-[10px] uppercase font-semibold tracking-widest" style={{ color: NEO.inkLight }}>{activeTool}</h2>
          <IconButton onClick={() => setActiveTool(null)}><span style={{ fontSize: 16 }}>✕</span></IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {activeTool === 'image' && (
            <>
              <div className="flex gap-4 mb-6">
                <button onClick={() => setActiveTab('public')} className={`text-[10px] font-semibold uppercase pb-1 ${activeTab === 'public' ? 'border-b-2' : ''}`} style={{ borderColor: activeTab === 'public' ? NEO.ink : 'transparent', color: activeTab === 'public' ? NEO.ink : NEO.inkLight }}>Public</button>
                <button onClick={() => setActiveTab('private')} className={`text-[10px] font-semibold uppercase pb-1 ${activeTab === 'private' ? 'border-b-2' : ''}`} style={{ borderColor: activeTab === 'private' ? NEO.ink : 'transparent', color: activeTab === 'private' ? NEO.ink : NEO.inkLight }}>Private</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 bg-white" style={{ borderColor: NEO.accent, color: NEO.inkLight }}>
                  <IconUpload />
                  <span className="mt-2 text-[8px] font-semibold uppercase">upload images</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                {picturePool[activeTab].map(img => (
                  <div key={img.id} onMouseDown={(e) => { e.stopPropagation(); setDraggedFromDrawer({ type: 'image', data: img, x: e.clientX, y: e.clientY }); }} className="aspect-[3/4] rounded-[24px] overflow-hidden cursor-grab active:scale-95 transition-all hover:shadow-lg" style={{ boxShadow: NEO.shadow }}>
                    <img src={img.url} className="w-full h-full object-cover pointer-events-none" />
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTool === 'text' && (
            <div className="flex flex-col gap-6">
              <div className="relative">
                <textarea value={textInput} onChange={(e) => { if(e.target.value.trim().split(/\s+/).length <= 140) setTextInput(e.target.value); }} className="w-full rounded-[20px] p-4 text-xs italic outline-none" style={{ background: NEO.bg, border: `1px solid ${NEO.accent}`, color: NEO.ink }} rows="4" />
                <div className={`absolute bottom-3 right-4 text-[9px] font-semibold ${wordCount >= 130 ? 'text-rose-400' : ''}`} style={{ color: wordCount >= 130 ? undefined : NEO.inkLight }}>{wordCount}/140</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: NEO.inkLight }}>Preview</span>
                <button onClick={() => setPreviewTextStyle(generateMagazineStyle())} className="w-12 h-12 rounded-full flex items-center justify-center text-lg" style={{ background: NEO.ink, color: NEO.bg, boxShadow: NEO.shadow }}>🎲</button>
              </div>
              <div onMouseDown={(e) => { e.stopPropagation(); setDraggedFromDrawer({ type: 'text', data: textInput, x: e.clientX, y: e.clientY }); }} className="flex justify-center p-4 cursor-grab hover:scale-105 transition-transform">
                <div style={{...previewTextStyle, width: 200, height: 130, transform: 'none', fontSize: `${previewTextStyle.fontSize}px`}}>{textInput || "Start typing..."}</div>
              </div>
            </div>
          )}
          {activeTool === 'sticker' && (
            <div className="grid grid-cols-3 gap-3">
              {['✨', '☁️', '🔥', '🦋', '🍭', '🎈', '💡', '🚀', '🌈'].map(s => (
                <div key={s} onMouseDown={(e) => { e.stopPropagation(); setDraggedFromDrawer({ type: 'sticker', data: s, x: e.clientX, y: e.clientY }); }} className="aspect-square rounded-[20px] flex items-center justify-center text-3xl cursor-grab transition-all hover:scale-110 bg-white" style={{ border: `1px dashed ${NEO.accent}` }}>{s}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== INFINITE CANVAS ===== */}
      <main
        ref={viewportRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: '#F3F2EE', cursor: interactionState === 'panning' ? 'grabbing' : 'grab' }}
        onMouseDown={handleCanvasMouseDown}
        onDrop={handleCanvasDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Dot grid */}
        <div 
          className="canvas-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${NEO.accent} 1px, transparent 1px)`,
            backgroundSize: `${30 * viewport.scale}px ${30 * viewport.scale}px`,
            backgroundPosition: `${viewport.x * viewport.scale}px ${viewport.y * viewport.scale}px`,
            opacity: 0.6
          }}
        />
        
        {/* Canvas content */}
        <div
          className="canvas-content absolute"
          style={{
            transformOrigin: '0 0',
            transform: `scale(${viewport.scale}) translate(${viewport.x}px, ${viewport.y}px)`,
            transition: isAnimating ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: 'transform'
          }}
        >
          {/* Connections */}
          <svg className="absolute overflow-visible pointer-events-none" style={{ width: 1, height: 1 }}>
            {connections.map(conn => {
              const from = elements.find(el => el.id === conn.from);
              const to = elements.find(el => el.id === conn.to);
              if (!from || !to) return null;
              const x1 = from.x + (from.width||220)/2, y1 = from.y + (from.type==='image'?140:60);
              const x2 = to.x + (to.width||220)/2, y2 = to.y + (to.type==='image'?140:60);
              const midX = (x1+x2)/2, midY = (y1+y2)/2;
              const angle = Math.atan2(y2-y1, x2-x1) * (180/Math.PI);
              const isEditing = editingConnectionId === conn.id;
              return (
                <g key={conn.id} className="pointer-events-auto">
                  <path d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`} stroke="#C4C4BE" strokeWidth={2} strokeDasharray="6 4" fill="none" />
                  <foreignObject x={midX - 75} y={midY - 20} width="150" height="40" style={{ transform: `rotate(${Math.abs(angle) > 90 ? angle + 180 : angle}deg)`, transformOrigin: 'center' }}>
                    <input 
                      ref={isEditing ? connectionInputRef : null}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setEditingConnectionId(conn.id); }}
                      onBlur={() => setEditingConnectionId(null)}
                      placeholder="describe..."
                      className={`w-full bg-transparent text-[11px] text-center italic outline-none font-medium ${isEditing ? 'caret-animate' : ''}`}
                      style={{ color: NEO.ink }}
                      value={conn.text}
                      onChange={(e) => setConnections(prev => prev.map(c => c.id === conn.id ? {...c, text: e.target.value} : c))}
                    />
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Elements */}
          {elements.map((el) => {
            const isSelected = selectedId === el.id;
            const scale = el.scale || 1;
            const scaledWidth = el.type === 'text' ? (el.width || 220) * scale : (el.width || 220);
            const scaledHeight = el.type === 'text' ? (el.height || 140) * scale : (el.type === 'image' ? 'auto' : (el.width || 220) * 0.65);
            const hasReactions = Object.keys(el.reactions).length > 0;
            const hasComments = comments.filter(c => c.targetId === el.id).length > 0;
            
            return (
              <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, zIndex: isSelected ? 100 : 20 }}>
                
                {/* Toolbar above element */}
                {isSelected && (
                  <div className="absolute flex items-start gap-2 pointer-events-auto z-[110]" style={{ left: 0, bottom: `calc(100% + 12px)` }} onMouseDown={e => e.stopPropagation()}>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white" style={{ border: '2px solid white', boxShadow: NEO.shadow }}>
                      <img src={el.avatar} className="w-full h-full" />
                    </div>
                    <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-full" style={{ background: NEO.surface, backdropFilter: 'blur(20px)', border: `1px solid ${NEO.border}`, boxShadow: NEO.shadow }}>
                      <IconButton onClick={undo} title="Undo"><IconUndo /></IconButton>
                      
                      {el.type === 'text' && (
                        <>
                          <IconButton onClick={() => !el.isLocked && updateEl(el.id, { style: generateMagazineStyle() })} title="Shuffle" disabled={el.isLocked}><IconShuffle /></IconButton>
                          <IconButton onClick={() => { if (!el.isLocked) { const t = prompt("Edit", el.content); if(t) updateEl(el.id, { content: t }); }}} title="Edit" disabled={el.isLocked}><IconEdit /></IconButton>
                        </>
                      )}
                      {el.type === 'image' && (
                        <>
                          <IconButton onClick={() => !el.isLocked && updateEl(el.id, { texture: getRandomTexture() })} title="Filter" disabled={el.isLocked}><IconMagic /></IconButton>
                          <IconButton onClick={() => !el.isLocked && updateEl(el.id, { shape: getRandomShape() })} title="Shape" disabled={el.isLocked}><IconScissors /></IconButton>
                          <IconButton onClick={() => !el.isLocked && updateEl(el.id, { texture: 'none', shape: '24px' })} title="Reset" disabled={el.isLocked}><IconCrop /></IconButton>
                        </>
                      )}
                      
                      <IconButton onClick={() => duplicate(el)} title="Duplicate"><IconCopy /></IconButton>
                      <IconButton onClick={() => toggleLock(el)} title={el.isLocked ? "Unlock" : "Lock"} active={el.isLocked}>{el.isLocked ? <IconLock /> : <IconUnlock />}</IconButton>
                      {!el.isLocked && <IconButton onClick={() => deleteElement(el)} title="Delete" danger><IconTrash /></IconButton>}
                    </div>
                  </div>
                )}

                {/* Element content */}
                <div
                  id={`content-${el.id}`}
                  className={`relative group ${isSelected ? 'shadow-2xl' : ''}`}
                  style={{
                    width: scaledWidth, height: scaledHeight,
                    transform: `rotate(${el.rotation}deg)`,
                    borderRadius: el.shape || '24px',
                    filter: el.texture || 'none',
                    overflow: 'visible',
                    cursor: el.isLocked ? 'not-allowed' : 'grab'
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, el.id, 'move')}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                >
                  {/* Resize handles */}
                  {isSelected && !el.isLocked && (<>
                    <div className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-10" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'resize-n')} />
                    <div className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize z-10" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'resize-s')} />
                    <div className="absolute top-0 -left-1 bottom-0 w-2 cursor-ew-resize z-10" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'resize-w')} />
                    <div className="absolute top-0 -right-1 bottom-0 w-2 cursor-ew-resize z-10" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'resize-e')} />
                    <div className="absolute -top-5 -left-5 w-6 h-6 cursor-nwse-resize z-20" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'rotate')} />
                    <div className="absolute -top-5 -right-5 w-6 h-6 cursor-nesw-resize z-20" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'rotate')} />
                    <div className="absolute -bottom-5 -left-5 w-6 h-6 cursor-nesw-resize z-20" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'rotate')} />
                    <div className="absolute -bottom-5 -right-5 w-6 h-6 cursor-nwse-resize z-20" onMouseDown={(e) => handleElementMouseDown(e, el.id, 'rotate')} />
                    <div className="absolute -inset-1 border-2 border-dashed rounded-[inherit] pointer-events-none" style={{ borderColor: `${NEO.ink}30` }} />
                  </>)}

                  {/* Grain */}
                  <div className="absolute inset-0 pointer-events-none z-[5] rounded-[inherit]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, opacity: 0.08, mixBlendMode: 'multiply' }} />

                  {el.type === 'image' ? (
                    <div className="p-3 overflow-hidden bg-white" style={{ boxShadow: `${NEO.shadow}, 0 0 0 4px white`, borderRadius: el.shape || '24px', border: `1px solid ${NEO.border}` }}>
                      <img src={el.content} className="w-full h-auto block rounded-[20px]" draggable="false" />
                    </div>
                  ) : el.type === 'sticker' ? (
                    <div className="flex items-center justify-center h-full bg-white" style={{ borderRadius: '32px', padding: '16px', boxShadow: `${NEO.shadow}, 0 0 0 5px white`, border: `1px solid ${NEO.border}` }}>
                      <span className="text-6xl">{el.content}</span>
                    </div>
                  ) : (
                    <div className="overflow-hidden" style={{ ...el.style, width: '100%', height: '100%', fontSize: `${(el.style?.fontSize || 22) * scale}px`, transform: el.style?.transform || 'none', borderRadius: '24px', boxShadow: `${NEO.shadow}, 0 0 0 4px white`, border: `1px solid ${NEO.border}` }}>{el.content}</div>
                  )}
                  
                  {el.isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-50 pointer-events-none rounded-[inherit]">
                      <div className="rounded-full p-2 bg-white/90" style={{ boxShadow: NEO.shadow }}><IconLock /></div>
                    </div>
                  )}
                </div>

                {/* ===== REACTIONS & COMMENTS SECTION (Below Element) ===== */}
                <div 
                  className="absolute left-0 w-full pointer-events-auto z-10" 
                  style={{ top: `calc(100% + 12px)` }}
                  onMouseDown={e => e.stopPropagation()}
                >
                  {/* Reactions row + Add buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Existing reactions */}
                    {Object.entries(el.reactions).map(([emoji, users]) => {
                      const hasMyReaction = users.includes('Me');
                      return (
                        <button
                          key={emoji}
                          onClick={(e) => { e.stopPropagation(); toggleReaction(el.id, emoji); }}
                          className="rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                          style={{ 
                            background: hasMyReaction ? `${NEO.ink}15` : 'rgba(255,255,255,0.9)',
                            border: `1.5px solid ${hasMyReaction ? NEO.ink : NEO.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                          }}
                        >
                          <span>{emoji}</span>
                          <span className="text-xs font-semibold" style={{ color: NEO.ink }}>{users.length}</span>
                        </button>
                      );
                    })}
                    
                    {/* Add emoji button */}
                    {isSelected && (
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(showEmojiPicker === el.id ? null : el.id); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10"
                          style={{ border: `1.5px dashed ${NEO.accent}`, color: NEO.inkLight }}
                        >
                          <IconPlus />
                        </button>
                        
                        {/* Emoji picker */}
                        {showEmojiPicker === el.id && (
                          <div 
                            className="absolute left-0 top-full mt-2 p-2 grid grid-cols-6 gap-1 z-[120] rounded-[20px]"
                            style={{ background: 'white', border: `1px solid ${NEO.border}`, boxShadow: NEO.shadowHover }}
                            onMouseDown={e => e.stopPropagation()}
                          >
                            {EMOJI_LIST.map(emoji => (
                              <button 
                                key={emoji} 
                                onClick={(e) => { e.stopPropagation(); toggleReaction(el.id, emoji); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all hover:scale-125 hover:bg-slate-50"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Add comment button */}
                    {isSelected && (
                      <button
                        onClick={(e) => { e.stopPropagation(); addComment(el.id); }}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10"
                        style={{ border: `1.5px dashed ${NEO.accent}`, color: NEO.inkLight }}
                      >
                        <IconMessage />
                      </button>
                    )}
                  </div>

                  {/* Comments */}
                  {(isSelected || hasComments) && comments.filter(c => c.targetId === el.id).length > 0 && (
                    <div className="flex flex-col gap-3 mt-3" style={{ maxWidth: scaledWidth + 80 }}>
                      {comments.filter(c => c.targetId === el.id).map(c => (
                        <div key={c.id} className="flex gap-3 animate-popIn">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white" style={{ border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                              <img src={c.avatar} className="w-full h-full" />
                            </div>
                            <span className="text-[8px] font-semibold uppercase" style={{ color: NEO.inkLight }}>{c.author}</span>
                          </div>
                          <div className="p-3 rounded-[20px] relative flex-1 bg-white" style={{ border: `1px solid ${NEO.border}`, boxShadow: NEO.shadow }}>
                            <p className="text-[11px] italic leading-relaxed" style={{ color: NEO.ink }}>{c.text}</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setComments(prev => prev.map(item => item.id === c.id ? {...item, hearts: item.hearts+1} : item)); }}
                              className="absolute -right-2 -bottom-2 rounded-full px-2 py-0.5 text-[10px] hover:scale-110 active:scale-95 transition-all bg-white"
                              style={{ border: `1px solid ${NEO.border}`, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                            >
                              ❤️ {c.hearts}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Dragged preview */}
      {draggedFromDrawer && (
        <div className="fixed pointer-events-none z-[1000]" style={{ left: draggedFromDrawer.x, top: draggedFromDrawer.y, transform: 'translate(-50%, -50%) scale(0.85)', opacity: 0.95 }}>
          {draggedFromDrawer.type === 'image' ? (
            <img src={draggedFromDrawer.data.url} className="w-36 rounded-[24px]" style={{ boxShadow: `${NEO.shadowHover}, 0 0 0 4px white` }} />
          ) : draggedFromDrawer.type === 'sticker' ? (
            <div className="p-5 rounded-[28px] text-4xl bg-white" style={{ boxShadow: `${NEO.shadowHover}, 0 0 0 4px white` }}>{draggedFromDrawer.data}</div>
          ) : (
            <div style={{...previewTextStyle, width: 160, height: 100, transform: 'none', boxShadow: `${NEO.shadowHover}, 0 0 0 4px white`, fontSize: `${previewTextStyle.fontSize * 0.8}px`, borderRadius: '20px'}}>{textInput || "..."}</div>
          )}
        </div>
      )}

      {/* Connection mode indicator */}
      {activeTool === 'connect' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full z-[150] text-sm font-medium" style={{ background: NEO.ink, color: NEO.bg, boxShadow: NEO.shadowHover }}>
          {connectFrom ? '👆 Click another element' : '👆 Click an element to start'}
        </div>
      )}

      {/* ===== BOTTOM CONTROLS ===== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-2 rounded-full z-[140]" style={{ background: NEO.surface, backdropFilter: 'blur(20px)', border: `1px solid ${NEO.border}`, boxShadow: NEO.shadow }} onMouseDown={e => e.stopPropagation()}>
        <IconButton onClick={zoomOut} title="Zoom Out"><IconZoomOut /></IconButton>
        <span className="text-xs font-semibold px-2 min-w-[50px] text-center" style={{ color: NEO.ink }}>{Math.round(viewport.scale * 100)}%</span>
        <IconButton onClick={zoomIn} title="Zoom In"><IconZoomIn /></IconButton>
        <div className="w-px h-6" style={{ background: NEO.accent }} />
        <IconButton onClick={snapToCenter} title="Center View (Cmd+0)"><IconTarget /></IconButton>
      </div>

      {/* ===== MINIMAP ===== */}
      <div 
        className="fixed bottom-6 left-6 rounded-[16px] overflow-hidden z-[140] cursor-pointer"
        style={{ 
          width: minimapSize.width, 
          height: minimapSize.height, 
          background: 'rgba(255,255,255,0.9)', 
          backdropFilter: 'blur(10px)',
          border: `1px solid ${NEO.border}`, 
          boxShadow: NEO.shadow 
        }}
        onClick={handleMinimapClick}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Elements as dots */}
        {elements.map(el => (
          <div
            key={el.id}
            className="absolute rounded-sm"
            style={{
              left: (el.x - elementsBounds.minX) * minimapScale,
              top: (el.y - elementsBounds.minY) * minimapScale,
              width: Math.max(4, (el.width || 220) * minimapScale),
              height: Math.max(3, 150 * minimapScale),
              background: selectedId === el.id ? NEO.ink : NEO.inkLight,
              opacity: selectedId === el.id ? 1 : 0.5
            }}
          />
        ))}
        
        {/* Viewport indicator */}
        {viewportRef.current && (
          <div
            className="absolute border-2 rounded-sm pointer-events-none"
            style={{
              left: (-viewport.x - elementsBounds.minX) * minimapScale,
              top: (-viewport.y - elementsBounds.minY) * minimapScale,
              width: (viewportRef.current.clientWidth / viewport.scale) * minimapScale,
              height: (viewportRef.current.clientHeight / viewport.scale) * minimapScale,
              borderColor: '#60a5fa',
              background: 'rgba(96, 165, 250, 0.1)'
            }}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[140]">
        <button className="group relative" style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backgroundColor: 'white', boxShadow: NEO.shadow, color: NEO.ink }}>
          <IconShare />
          <div className="absolute right-full mr-3 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ borderRadius: '9999px', background: NEO.ink, color: NEO.bg }}>Share</div>
        </button>
        <button className="group relative" style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backgroundColor: NEO.ink, color: NEO.bg, boxShadow: NEO.shadowHover }}>
          <IconPublish />
          <div className="absolute right-full mr-3 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ borderRadius: '9999px', background: NEO.ink, color: NEO.bg }}>Publish</div>
        </button>
      </div>

      <style>{`
        * { font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif; color-scheme: light; }
        body { background-color: ${NEO.bg}; margin: 0; }
        ::-webkit-scrollbar { display: none; }
        .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .caret-animate { animation: caretBlink 1s step-end infinite; }
        @keyframes caretBlink { 0%, 100% { caret-color: ${NEO.ink}; } 50% { caret-color: transparent; } }
      `}</style>
    </div>
  );
}
