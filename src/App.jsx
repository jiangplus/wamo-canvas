/**
 * CyberJam Canvas - 协作式无限画布
 * Real-time collaborative canvas with InstantDB
 */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

// InstantDB
import { db, id, tx } from "./lib/db";

// Theme & Utils
import { NEO } from "./styles/theme";
import {
  DEFAULT_ELEMENT_WIDTH,
  STICKER_LIST,
  getAvatarUrl,
} from "./utils/constants";
import { screenToWorld } from "./utils/coordinates";
import {
  generateMagazineStyle,
  generateSmallRandomAngle,
} from "./utils/styleGenerators";

// Components
import Header from "./components/layout/Header";
import { ActionButtons } from "./components/layout/ActionButtons";
import { Toolbar } from "./components/toolbar/Toolbar";
import { BottomControls } from "./components/toolbar/BottomControls";
import { ImageDrawer } from "./components/drawers/ImageDrawer";
import { TextDrawer } from "./components/drawers/TextDrawer";
import { StickerDrawer } from "./components/drawers/StickerDrawer";
import { CanvasElement } from "./components/canvas/CanvasElement";
import { Minimap } from "./components/canvas/Minimap";
import { Connection, ConnectionPreview } from "./components/canvas/Connection";
import { ContextMenu } from "./components/ui/ContextMenu";

// Icons
import { IconLock } from "./icons";

// Hooks & History
import { useOperationHistory } from "./hooks/useOperationHistory";
import { OPERATION_TYPES, extractElementState } from "./utils/historyOperations";


// ============================================================================
// CONSTANTS
// ============================================================================
const INITIAL_PICTURE_POOL = {
  public: [
    {
      id: "p1",
      url: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=400",
    },
    {
      id: "p2",
      url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400",
    },
  ],
  readonly: [
    {
      id: "ro1",
      url: "https://images.unsplash.com/photo-1515405299443-f71bb768a69e?w=400",
    },
  ],
};

// ============================================================================
// HELPERS
// ============================================================================
const simplifyPoints = (points, tolerance = 3) => {
  if (points.length < 3) return points;

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

  if (filtered.length < 3) return filtered;
  let currentPoints = filtered;
  for (let pass = 0; pass < 2; pass++) {
    const nextPoints = [currentPoints[0]];
    for (let i = 1; i < currentPoints.length - 1; i++) {
      const prev = currentPoints[i - 1];
      const curr = currentPoints[i];
      const next = currentPoints[i + 1];
      nextPoints.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3,
      });
    }
    nextPoints.push(currentPoints[currentPoints.length - 1]);
    currentPoints = nextPoints;
  }

  return currentPoints;
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function App({ canvasId, onBack, authLoading: authLoadingProp }) {
  // Get current user
  const { user, isLoading: authLoading } = db.useAuth();
  const userId = user?.id;
  const userEmail = user?.email;
  const userImageURL = user?.imageURL;
  const effectiveAuthLoading =
    authLoadingProp === undefined ? authLoading : authLoadingProp;

  useEffect(() => {
    if (!userId) return;
    const updates = {};
    // Set default username from email if not already set
    if (userEmail && !user?.username) {
      updates.username = userEmail.split('@')[0];
    }
    if (userImageURL) {
      updates.imageURL = userImageURL;
    }
    if (Object.keys(updates).length > 0) {
      db.transact([tx.$users[userId].update(updates)]);
    }
  }, [userId, userEmail, userImageURL, user?.username]);

  // Operation history for undo/redo
  const { recordOperation, undo, redo, canUndo, canRedo, clearHistory } =
    useOperationHistory(canvasId, userId);

  // Clear history when switching canvases
  useEffect(() => {
    clearHistory();
  }, [canvasId, clearHistory]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Query canvas data
  const { data: canvasData, isLoading: canvasLoading, error: queryError } =
    db.useQuery(
      canvasId
        ? {
          canvases: {
            $: { where: { id: canvasId } },
            owner: {},
            memberships: { user: {} },
            elements: { creator: {}, comments: { author: {} } },
            connections: {
              fromElement: {},
              toElement: {},
            },
            },
          }
        : null,
    );

  // ===== DERIVED DATA FROM INSTANTDB =====
  const canvas = canvasData?.canvases?.[0];
  const canvasOwnerId = canvas?.owner?.[0]?.id;
  const isOwner = Boolean(userId && canvasOwnerId && userId === canvasOwnerId);
  const isMember = Boolean(
    userId &&
      canvas?.memberships?.some((membership) => {
        const users = Array.isArray(membership.user)
          ? membership.user
          : membership.user
            ? [membership.user]
            : [];
        return users.some((u) => u.id === userId);
      }),
  );
  const canvasVisibility = canvas?.visibility || "public";
  const isPublic = canvasVisibility === "public";
  const ownerKnown = Boolean(canvasOwnerId);
  // Important: keep client-side editability aligned with Instant permissions.
  // We allow editing for owners and members (membership is only joinable on non-private canvases).
  // This also makes legacy/orphaned private canvases (missing owner link but with membership) editable.
  const canEdit =
    Boolean(userId) &&
    (isOwner || isMember);
  const canEditName = Boolean(userId) && isOwner;
  const hasValidOwner = Boolean(userId && user?.email);
  const currentUserName = user?.email?.split("@")[0] || "User";
  const currentUserAvatar = getAvatarUrl(currentUserName || "user");
  const [ownCommentIds, setOwnCommentIds] = useState([]);

  const elements = useMemo(() => {
    if (!canvas?.elements) return [];
    return canvas.elements.map((el) => ({
      ...el,
      // Map comments
      comments:
        el.comments?.map((c) => {
          const authorId = c.author?.[0]?.id || null;
          const isOwnFallback =
            !authorId && userId && ownCommentIds.includes(c.id);
          const authorName =
            c.author?.[0]?.email?.split("@")[0] ||
            (authorId && authorId === userId
              ? currentUserName
              : isOwnFallback
                ? currentUserName
                : "Unknown");
          const isAuthor =
            (authorId && authorId === userId) ||
            isOwnFallback ||
            (!authorId && authorName === currentUserName);
          return {
            ...c,
            authorId,
            author: authorName,
            avatar:
              authorId && authorId === userId
                ? currentUserAvatar
                : isOwnFallback
                  ? currentUserAvatar
                  : getAvatarUrl(authorName || "unknown"),
            isAuthor,
            createdAt: c.createdAt,
          };
        }) || [],
    }));
  }, [canvas, currentUserAvatar, currentUserName, ownCommentIds, userId]);

  const connections = useMemo(() => {
    if (!canvas?.connections) return [];
    // FIX: fromElement/toElement are "has one" relationships, so they're objects not arrays
    return canvas.connections.map((c) => ({
      id: c.id,
      from: c.fromElement?.id,
      to: c.toElement?.id,
      text: c.text || "",
    }));
  }, [canvas]);

  const maxZIndex = useMemo(() => {
    if (!elements.length) return 0;
    return Math.max(...elements.map((el) => el.zIndex || 0));
  }, [elements]);

  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    [elements],
  );

  // ===== REFS =====
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const connectionInputRef = useRef(null);
  const editTextRef = useRef(null);
  const newCommentRef = useRef(null);
  const editCommentInputRef = useRef(null);
  const dragRef = useRef({
    id: null,
    type: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialRot: 0,
    initialScale: 1,
    initialViewport: { x: 0, y: 0 },
  });
  const skipMouseDownRef = useRef(false);
  const skipMouseMoveRef = useRef(false);
  const skipMouseUpRef = useRef(false);
  const ignoreNextClickRef = useRef(false);

  // ===== LOCAL UI STATE =====
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [activeTab, setActiveTab] = useState("public");
  const [interactionState, setInteractionState] = useState("idle");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [draggedFromDrawer, setDraggedFromDrawer] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [newCommentTargetId, setNewCommentTargetId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [lassoState, setLassoState] = useState({
    active: false,
    isDrawing: false,
    elementId: null,
    points: [],
  });
  const [textInput, setTextInput] = useState("New Idea...");
  const [previewTextStyle, setPreviewTextStyle] = useState(
    generateMagazineStyle("New Idea..."),
  );
  const [picturePool, setPicturePool] = useState(INITIAL_PICTURE_POOL);
  const [drawerImageAngles, setDrawerImageAngles] = useState({});
  const [drawerStickerAngles, setDrawerStickerAngles] = useState({});

  const room = useMemo(() => db.room("canvas", canvasId), [canvasId]);
  const { peers: presencePeers, publishPresence } = room.usePresence({
    keys: ["selectedElementId", "userName", "avatar"],
    user: false,
  });

  useEffect(() => {
    if (!userId) return;
    publishPresence({
      userName: currentUserName,
      avatar: currentUserAvatar,
    });
  }, [currentUserAvatar, currentUserName, publishPresence, userId]);

  useEffect(() => {
    const activeElementId =
      canEdit && (editingTextId || (interactionState !== "idle" && selectedId))
        ? editingTextId || selectedId
        : null;
    publishPresence({ selectedElementId: activeElementId || null });
  }, [canEdit, editingTextId, interactionState, publishPresence, selectedId]);

  const activeEditorsByElement = useMemo(() => {
    const map = {};
    Object.values(presencePeers || {}).forEach((peer) => {
      if (!peer?.selectedElementId) return;
      const elementId = peer.selectedElementId;
      if (!map[elementId]) map[elementId] = [];
      const name = peer.userName || "Guest";
      map[elementId].push({
        id: peer.peerId,
        name,
        avatar: peer.avatar || getAvatarUrl(name),
      });
    });
    return map;
  }, [presencePeers]);

  // ===== COMPUTED =====
  const wordCount = useMemo(
    () => (textInput.trim() ? textInput.trim().split(/\s+/).length : 0),
    [textInput],
  );

  // Auto-regenerate style when text length changes significantly
  // This ensures the aspect ratio stays good as text changes
  const prevTextLengthRef = useRef(textInput.length);
  useEffect(() => {
    const currentLength = textInput.length;
    const prevLength = prevTextLengthRef.current;
    
    // Regenerate if length changed by more than 30% or crossed a threshold
    const lengthChange = Math.abs(currentLength - prevLength);
    const significantChange = lengthChange > Math.max(prevLength * 0.3, 15);
    
    if (significantChange) {
      setPreviewTextStyle(generateMagazineStyle(textInput));
      prevTextLengthRef.current = currentLength;
    }
  }, [textInput]);

  // ===== HELPERS =====
  const getWorldCoords = useCallback(
    (sx, sy) =>
      screenToWorld(
        sx,
        sy,
        viewport,
        viewportRef.current?.getBoundingClientRect(),
      ),
    [viewport],
  );
  const getElementCenter = useCallback((el) => {
    const width = el.width || DEFAULT_ELEMENT_WIDTH;
    const height =
      el.height ?? (el.type === "image" ? 140 : el.type === "text" ? 60 : 60);
    return { x: el.x + width / 2, y: el.y + height / 2 };
  }, []);

  // ===== INSTANTDB MUTATIONS =====
  const updateElement = useCallback((elementId, updates) => {
    if (!elementId || !canEdit) return;
    // Filter out non-schema fields
    const { comments, creator, ...schemaUpdates } = updates;

    // Record operation for undo/redo
    const element = elements.find((el) => el.id === elementId);
    if (element && userId) {
      const previousState = extractElementState(element, OPERATION_TYPES.UPDATE);
      const newState = { ...previousState, ...updates };
      const creatorId = element.creator?.[0]?.id;
      recordOperation(
        OPERATION_TYPES.UPDATE,
        elementId,
        previousState,
        newState,
        creatorId,
      );
    }

    db.transact([tx.elements[elementId].update(schemaUpdates)]);
  }, [canEdit, elements, userId, recordOperation]);

  const addElement = useCallback(
    (data) => {
      if (!canvasId || !userId || !canEdit || !hasValidOwner) return;
      const elementId = id();
      const zIndex = maxZIndex + 1;
      const elementData = {
        type: data.type,
        content: data.content,
        x: data.x,
        y: data.y,
        width: data.width || DEFAULT_ELEMENT_WIDTH,
        height: data.height || null,
        rotation: data.rotation || 0,
        isLocked: false,
        texture: "none",
        shape: data.shape || null,
        scale: data.scale || 1,
        zIndex,
        style: data.style || null,
        createdAt: Date.now(),
      };

      // Record CREATE operation for undo/redo
      recordOperation(OPERATION_TYPES.CREATE, elementId, null, elementData, userId);

      db.transact([
        tx.elements[elementId]
          .update(elementData)
          .link({ canvas: canvasId })
          .link({ creator: userId }),
      ]);

      setSelectedId(elementId);
      return elementId;
    },
    [canvasId, userId, maxZIndex, canEdit, hasValidOwner, recordOperation],
  );

  const deleteElement = useCallback(
    (elementId) => {
      if (!elementId || !canEdit) return;

      // Record DELETE operation for undo/redo
      const element = elements.find((el) => el.id === elementId);
      if (element && userId) {
        const previousState = extractElementState(element, OPERATION_TYPES.DELETE);
        const creatorId = element.creator?.[0]?.id;
        recordOperation(OPERATION_TYPES.DELETE, elementId, previousState, null, creatorId);
      }

      db.transact([tx.elements[elementId].delete()]);
      if (selectedId === elementId) setSelectedId(null);
    },
    [selectedId, canEdit, elements, userId, recordOperation],
  );

  const addConnection = useCallback(
    (fromId, toId) => {
      if (!canvasId || !fromId || !toId || !canEdit) {
        return;
      }
      const connectionId = id();

      db.transact([
        tx.connections[connectionId]
          .update({
            text: "",
            createdAt: Date.now(),
          })
          .link({ canvas: canvasId })
          .link({ fromElement: fromId })
          .link({ toElement: toId }),
      ]);

      return connectionId;
    },
    [canvasId, canEdit],
  );

  const updateConnection = useCallback((connectionId, text) => {
    if (!connectionId || !canEdit) return;
    db.transact([tx.connections[connectionId].update({ text })]);
  }, [canEdit]);

  const addComment = useCallback(
    (elementId, text) => {
      if (!elementId || !text.trim() || !userId || !canEdit) return;
      const commentId = id();
      setOwnCommentIds((prev) =>
        prev.includes(commentId) ? prev : [...prev, commentId],
      );

      db.transact([
        tx.comments[commentId]
          .update({
            text: text.trim(),
            createdAt: Date.now(),
          })
          .link({ element: elementId })
          .link({ author: userId }),
      ]);
    },
    [userId, canEdit],
  );

  const updateComment = useCallback((commentId, text) => {
    if (!commentId || !text.trim() || !canEdit) return;
    db.transact([tx.comments[commentId].update({ text: text.trim() })]);
  }, [canEdit]);

  const deleteComment = useCallback((commentId) => {
    if (!commentId || !canEdit) return;
    db.transact([tx.comments[commentId].delete()]);
  }, [canEdit]);


  const changeCanvasName = useCallback(
    (name) => {
      if (!canvasId || !canEditName) return;
      const nextName = name.trim();
      if (!nextName) return;
      db.transact([tx.canvases[canvasId].update({ name: nextName })]);
    },
    [canvasId, canEditName],
  );

  const [isJoining, setIsJoining] = useState(false);
  const canJoin =
    Boolean(userId) && !isOwner && !isMember && Boolean(canvas);

  const handleJoinCanvas = async () => {
    if (!canvasId || !userId || !canJoin) return;
    setIsJoining(true);
    try {
      const membershipId = id();
      await db.transact([
        tx.canvas_memberships[membershipId]
          .update({ createdAt: Date.now() })
          .link({ canvas: canvasId })
          .link({ user: userId }),
      ]);
    } finally {
      setIsJoining(false);
    }
  };

  // ===== INIT EFFECTS =====
  useEffect(() => {
    const t = setTimeout(() => {
      const r = viewportRef.current?.getBoundingClientRect();
      if (r)
        setViewport({ x: r.width / 2 - 110, y: r.height / 2 - 150, scale: 1 });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const imgAngles = {};
    [...picturePool.public, ...picturePool.readonly].forEach((i) => {
      if (!drawerImageAngles[i.id])
        imgAngles[i.id] = generateSmallRandomAngle(8);
    });
    if (Object.keys(imgAngles).length)
      setDrawerImageAngles((prev) => ({ ...prev, ...imgAngles }));
  }, [picturePool]);

  useEffect(() => {
    const angles = {};
    STICKER_LIST.forEach((s) => {
      if (!drawerStickerAngles[s]) angles[s] = generateSmallRandomAngle(12);
    });
    if (Object.keys(angles).length)
      setDrawerStickerAngles((prev) => ({ ...prev, ...angles }));
  }, []);

  useEffect(() => {
    if (!canEdit) {
      setActiveTool(null);
      setConnectFrom(null);
      setEditingConnectionId(null);
      setEditingTextId(null);
      setNewCommentTargetId(null);
      setContextMenu(null);
      setLassoState({
        active: false,
        isDrawing: false,
        elementId: null,
        points: [],
      });
    }
  }, [canEdit]);

  // ===== KEYBOARD =====
  useEffect(() => {
    const handle = (e) => {
      if (editingTextId || newCommentTargetId || editingCommentId) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        setViewport((p) => ({ ...p, scale: Math.min(3, p.scale * 1.2) }));
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        setViewport((p) => ({ ...p, scale: Math.max(0.2, p.scale / 1.2) }));
        return;
      }
      if (e.key === "Escape") {
        setContextMenu(null);
        setNewCommentTargetId(null);
        setEditingCommentId(null);
        if (lassoState.active)
          setLassoState({
            active: false,
            isDrawing: false,
            elementId: null,
            points: [],
          });
        return;
      }
      if (!selectedId) return;
      const el = elements.find((i) => i.id === selectedId);
      if (!el) return;
      if (canEdit && !el.isLocked && (e.key === "Delete" || e.key === "Backspace")) {
        deleteElement(selectedId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "c") setClipboard({ ...el });
      if (canEdit && (e.metaKey || e.ctrlKey) && e.key === "v" && clipboard) {
        addElement({
          type: clipboard.type,
          content: clipboard.content,
          x: el.x + 40,
          y: el.y + 40,
          width: clipboard.width,
          height: clipboard.height,
          rotation: clipboard.rotation,
          shape: clipboard.shape,
          scale: clipboard.scale,
          style: clipboard.style,
        });
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [
    selectedId,
    elements,
    clipboard,
    editingTextId,
    newCommentTargetId,
    editingCommentId,
    lassoState,
    deleteElement,
    addElement,
    canEdit,
  ]);

  // ===== WHEEL ZOOM & PAN =====
  useEffect(() => {
    const c = viewportRef.current;
    if (!c) return;
    const handle = (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const r = c.getBoundingClientRect();
        const mx = e.clientX - r.left,
          my = e.clientY - r.top;
        const wb = {
          x: mx / viewport.scale - viewport.x,
          y: my / viewport.scale - viewport.y,
        };
        const ns = Math.max(
          0.2,
          Math.min(3, viewport.scale * (e.deltaY > 0 ? 0.9 : 1.1)),
        );
        setViewport({ x: mx / ns - wb.x, y: my / ns - wb.y, scale: ns });
      } else {
        setViewport((p) => ({
          ...p,
          x: p.x - e.deltaX / p.scale,
          y: p.y - e.deltaY / p.scale,
        }));
      }
    };
    c.addEventListener("wheel", handle, { passive: false });
    return () => c.removeEventListener("wheel", handle);
  }, [viewport]);

  // ===== MOUSE HANDLERS =====
  const getEventPoint = (event) => {
    if ("touches" in event && event.touches?.length) {
      const touch = event.touches[0];
      return { clientX: touch.clientX, clientY: touch.clientY, target: touch.target || event.target };
    }
    if ("changedTouches" in event && event.changedTouches?.length) {
      const touch = event.changedTouches[0];
      return { clientX: touch.clientX, clientY: touch.clientY, target: touch.target || event.target };
    }
    return { clientX: event.clientX, clientY: event.clientY, target: event.target };
  };

  const shouldIgnoreMouseEvent = (ref) => {
    if (ref.current) {
      ref.current = false;
      return true;
    }
    return false;
  };

  const handleCanvasMouseDown = (e) => {
    if (!canEdit && interactionState !== "panning") {
      setSelectedId(null);
      setContextMenu(null);
    }
    const { clientX, clientY, target } = getEventPoint(e);
    if (lassoState.active && lassoState.elementId) {
      if (target.closest(`#content-${lassoState.elementId}`)) {
        setLassoState((p) => ({
          ...p,
          isDrawing: true,
          points: [{ x: clientX, y: clientY }],
        }));
        return;
      }
      setLassoState({
        active: false,
        isDrawing: false,
        elementId: null,
        points: [],
      });
    }

    if (
      target === viewportRef.current ||
      target.classList.contains("canvas-content") ||
      target.classList.contains("canvas-grid")
    ) {
      setSelectedId(null);
      setConnectFrom(null);
      setEditingTextId(null);
      setContextMenu(null);
      dragRef.current = {
        id: null,
        type: "pan",
        startX: clientX,
        startY: clientY,
        initialViewport: { x: viewport.x, y: viewport.y },
      };
      setInteractionState("panning");
    }
  };

  const handleCanvasMouseDownWrapper = (e) => {
    if (shouldIgnoreMouseEvent(skipMouseDownRef)) return;
    handleCanvasMouseDown(e);
  };

  const handleCanvasPointerDown = (e) => {
    skipMouseDownRef.current = true;
    handleCanvasMouseDown(e);
  };

  const handleElementMouseDown = (e, elId, type) => {
    ignoreNextClickRef.current = false;
    const { clientX, clientY } = getEventPoint(e);
    e.stopPropagation();
    if (!canEdit) {
      setSelectedId(elId);
      setContextMenu(null);
      return;
    }

    if (lassoState.active) {
      if (lassoState.elementId === elId) {
        setLassoState((p) => ({
          ...p,
          isDrawing: true,
          points: [{ x: clientX, y: clientY }],
        }));
      } else {
        setLassoState({
          active: false,
          isDrawing: false,
          elementId: null,
          points: [],
        });
      }
      return;
    }

    const el = elements.find((i) => i.id === elId);
    if (!el) return;

    if (activeTool === "connect") {
      e.stopPropagation(); // Ensure we stop propagation for any connect action
      if (!canEdit) {
        return;
      }
      if (!connectFrom) {
        setConnectFrom(elId);
        setSelectedId(elId);
      } else if (connectFrom !== elId) {
        e.preventDefault();
        const cid = addConnection(connectFrom, elId);
        setConnectFrom(null);
        setEditingConnectionId(cid);
        setActiveTool(null);
        ignoreNextClickRef.current = true;
        // Give React time to render the new connection and input
        setTimeout(() => connectionInputRef.current?.focus(), 200);
      }
      return;
    }
    if (
      el.isLocked &&
      (type === "move" || type.startsWith("resize") || type === "rotate")
    )
      return;
    if (!canEdit && type !== "move") return;
    setSelectedId(elId);
    const node = document.getElementById(`content-${elId}`);
    const rect = node?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const centerY = rect ? rect.top + rect.height / 2 : 0;
    const initialDist = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2),
    );

    dragRef.current = {
      id: elId,
      type,
      startX: clientX,
      startY: clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialRot: el.rotation,
      initialScale: el.scale || 1,
      centerX,
      centerY,
      initialDist,
    };
    setInteractionState(
      type === "move"
        ? "dragging"
        : type.startsWith("resize")
          ? "resizing"
          : "rotating",
    );
  };

  const handleElementMouseDownWrapper = (e, elId, type) => {
    if (shouldIgnoreMouseEvent(skipMouseDownRef)) return;
    handleElementMouseDown(e, elId, type);
  };

  const handleElementPointerDown = (e, elId, type) => {
    skipMouseDownRef.current = true;
    handleElementMouseDown(e, elId, type);
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = getEventPoint(e);
    setMousePosition({ x: clientX, y: clientY });

    if (lassoState.isDrawing) {
      if (!canEdit) return;
      setLassoState((p) => ({
        ...p,
        points: [...p.points, { x: clientX, y: clientY }],
      }));
      return;
    }

    if (draggedFromDrawer) {
      setDraggedFromDrawer({
        ...draggedFromDrawer,
        x: clientX,
        y: clientY,
      });
      return;
    }
    if (interactionState === "idle") return;
    const dx = clientX - dragRef.current.startX,
      dy = clientY - dragRef.current.startY;
    if (interactionState === "panning")
      setViewport((p) => ({
        ...p,
        x: dragRef.current.initialViewport.x + dx / p.scale,
        y: dragRef.current.initialViewport.y + dy / p.scale,
      }));
    else if (interactionState === "dragging") {
      if (!canEdit) return;
      updateElement(dragRef.current.id, {
        x: dragRef.current.initialX + dx / viewport.scale,
        y: dragRef.current.initialY + dy / viewport.scale,
      });
    } else if (interactionState === "resizing") {
      if (!canEdit) return;
      const {
        id: elId,
        initialW,
        initialScale,
        centerX,
        centerY,
        initialDist,
      } = dragRef.current;
      const el = elements.find((i) => i.id === elId);
      if (!el || initialDist === 0) return;

      const currentDist = Math.sqrt(
        Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2),
      );
      const ratio = currentDist / initialDist;

      if (el.type === "text")
        updateElement(elId, { scale: Math.max(0.5, initialScale * ratio) });
      else updateElement(elId, { width: Math.max(80, initialW * ratio) });
    } else if (interactionState === "rotating") {
      if (!canEdit) return;
      const {
        id: elId,
        startX,
        startY,
        initialRot,
        centerX,
        centerY,
      } = dragRef.current;
      const curA =
        Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      const strA =
        Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
      updateElement(elId, { rotation: initialRot + (curA - strA) });
    }
  };

  const handleMouseMoveWrapper = (e) => {
    if (shouldIgnoreMouseEvent(skipMouseMoveRef)) return;
    handleMouseMove(e);
  };

  const handlePointerMove = (e) => {
    skipMouseMoveRef.current = true;
    handleMouseMove(e);
  };

  const handleMouseUp = (e) => {
    const { clientX, clientY } = getEventPoint(e);
    if (lassoState.isDrawing) {
      if (!canEdit) return;
      const { elementId, points } = lassoState;
      const el = elements.find((i) => i.id === elementId);
      const node = document.getElementById(`content-${elementId}`);

      const smoothedPoints = simplifyPoints(points);

      if (el && node && smoothedPoints.length > 3) {
        const rect = node.getBoundingClientRect();
        const w = node.offsetWidth;
        const h = node.offsetHeight;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rad = (-el.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const polygonPoints = smoothedPoints.map((p) => {
          const pdx = p.x - cx;
          const pdy = p.y - cy;
          const rx = pdx * cos - pdy * sin;
          const ry = pdx * sin + pdy * cos;
          const pctX = ((rx + w / 2) / w) * 100;
          const pctY = ((ry + h / 2) / h) * 100;
          return `${Math.max(0, Math.min(100, pctX))}% ${Math.max(0, Math.min(100, pctY))}%`;
        });

        updateElement(elementId, {
          shape: {
            clipPath: `polygon(${polygonPoints.join(", ")})`,
            borderRadius: "0px",
          },
        });
      }
      setLassoState({
        active: false,
        isDrawing: false,
        elementId: null,
        points: [],
      });
      return;
    }

    if (draggedFromDrawer) {
      if (!canEdit) {
        setDraggedFromDrawer(null);
        setInteractionState("idle");
        return;
      }
      const wp = getWorldCoords(clientX, clientY);
      addElement({
        type: draggedFromDrawer.type,
        content:
          draggedFromDrawer.type === "image"
            ? draggedFromDrawer.data.url
            : draggedFromDrawer.type === "sticker"
              ? draggedFromDrawer.data
              : textInput,
        x: wp.x - 110,
        y: wp.y - 100,
        width: DEFAULT_ELEMENT_WIDTH,
        height: draggedFromDrawer.type === "text" ? 140 : null,
        rotation: 0,
        shape: null,
        style:
          draggedFromDrawer.type === "text" ? { ...previewTextStyle } : null,
      });
      if (draggedFromDrawer.type === "image")
        setPicturePool((p) => ({
          ...p,
          [activeTab]: p[activeTab].filter(
            (i) => i.id !== draggedFromDrawer.data.id,
          ),
        }));
      setDraggedFromDrawer(null);
    }
    setInteractionState("idle");
    dragRef.current = { id: null, type: null };
  };

  const handleMouseUpWrapper = (e) => {
    if (shouldIgnoreMouseEvent(skipMouseUpRef)) return;
    handleMouseUp(e);
  };

  const handlePointerUp = (e) => {
    skipMouseUpRef.current = true;
    handleMouseUp(e);
  };

  // ===== CONTEXT MENU & COMMENTS =====
  const handleContextMenu = (e, elementId) => {
    if (!canEdit) return;
    e.preventDefault();
    if (!elementId) return;
    const { clientX, clientY } = getEventPoint(e);
    setContextMenu({ x: clientX, y: clientY, targetId: elementId });
  };

  const startAddingComment = () => {
    if (!canEdit) return;
    if (contextMenu && contextMenu.targetId) {
      setNewCommentTargetId(contextMenu.targetId);
      setNewCommentText("");
      setContextMenu(null);
      setTimeout(() => newCommentRef.current?.focus(), 100);
    }
  };

  const addElementComment = () => {
    if (!newCommentText.trim() || !newCommentTargetId || !canEdit) return;
    addComment(newCommentTargetId, newCommentText);
    setNewCommentTargetId(null);
    setNewCommentText("");
  };

  const handleEditComment = (comment) => {
    if (!canEdit) return;
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
    setTimeout(() => editCommentInputRef.current?.focus(), 100);
  };

  const handleSaveEditComment = () => {
    if (!editingCommentId || !editingCommentText.trim() || !canEdit) return;
    updateComment(editingCommentId, editingCommentText);
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleDeleteComment = (commentId) => {
    if (!canEdit) return;
    deleteComment(commentId);
  };

  // ===== FILE HANDLING =====
  const handleFileUpload = (e) => {
    if (!canEdit) return;
    Array.from(e.target.files || []).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = (ev) => {
        const imgId = id();
        setPicturePool((p) => ({
          ...p,
          [activeTab]: [...p[activeTab], { id: imgId, url: ev.target.result }],
        }));
        setDrawerImageAngles((p) => ({
          ...p,
          [imgId]: generateSmallRandomAngle(8),
        }));
      };
      r.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const handleCanvasDrop = (e) => {
    if (!canEdit) return;
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const wp = getWorldCoords(e.clientX, e.clientY);
      addElement({
        type: "image",
        content: ev.target.result,
        x: wp.x - 110,
        y: wp.y - 100,
        width: DEFAULT_ELEMENT_WIDTH,
        rotation: 0,
        shape: null,
      });
    };
    r.readAsDataURL(f);
  };

  // ===== CONNECTION PREVIEW =====
  const connectionPreview = useMemo(() => {
    if (!connectFrom || activeTool !== "connect") return null;
    const from = elements.find((el) => el.id === connectFrom);
    if (!from) return null;
    const fromCenter = getElementCenter(from);
    const wp = getWorldCoords(mousePosition.x, mousePosition.y);
    return { x1: fromCenter.x, y1: fromCenter.y, x2: wp.x, y2: wp.y };
  }, [
    connectFrom,
    activeTool,
    elements,
    mousePosition,
    getWorldCoords,
    getElementCenter,
  ]);

  // ===== TOOLBAR ACTIONS =====
  const toolbarActions = (el) => ({
    onUndo: () => undo(),
    onRedo: () => redo(),
    canUndo,
    canRedo,
    onShuffle: () =>
      !el.isLocked && updateElement(el.id, { style: generateMagazineStyle(el.content || '') }),
    onEdit: () => {
      if (el.isLocked) return;
      setEditingTextId(el.id);
      setTimeout(() => editTextRef.current?.focus(), 100);
    },
    onLasso: () =>
      !el.isLocked &&
      setLassoState({
        active: true,
        isDrawing: false,
        elementId: el.id,
        points: [],
      }),
    onReset: () =>
      !el.isLocked &&
      updateElement(el.id, {
        shape: { clipPath: "none", borderRadius: "4px" },
      }),
    onMoveUpLayer: () => {
      updateElement(el.id, { zIndex: maxZIndex + 1 });
    },
    onDuplicate: () => {
      addElement({
        type: el.type,
        content: el.content,
        x: el.x + 40,
        y: el.y + 40,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        shape: el.shape,
        scale: el.scale,
        style: el.style,
      });
    },
    onConnect: () => {
      if (el.isLocked) return;
      setActiveTool("connect");
      setConnectFrom(el.id);
      setSelectedId(el.id);
    },
    onAddLink: () => {
      if (el.isLocked) return;
      const url = window.prompt("Enter URL for this element:", el.link || "");
      if (url !== null) {
        updateElement(el.id, { link: url });
      }
    },
    onToggleLock: () => updateElement(el.id, { isLocked: !el.isLocked }),
    onDelete: () => {
      if (!el.isLocked) deleteElement(el.id);
    },
  });

  // ===== LOADING STATE =====
  if (canvasLoading) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ background: NEO.bg }}
      >
        <div className="text-center">
          <div className="animate-pulse text-lg" style={{ color: NEO.ink }}>
            Loading canvas...
          </div>
        </div>
      </div>
    );
  }

  // Handle query error
  if (queryError) {
    console.error('Canvas query error:', queryError);
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ background: NEO.bg }}
      >
        <div
          className="text-center p-8"
          style={{
            background: NEO.surface,
            borderRadius: NEO.radiusLg,
            boxShadow: NEO.shadow,
            maxWidth: "400px",
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{ background: `${NEO.inkLight}20` }}
          >
            <IconLock />
          </div>
          <div className="text-lg font-semibold mb-2" style={{ color: NEO.ink }}>
            Unable to load canvas
          </div>
          <p className="text-sm mb-6" style={{ color: NEO.inkLight }}>
            {queryError.message || "This canvas may be private or doesn't exist."}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-sm font-medium"
            style={{
              background: NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radius,
            }}
          >
            {userId ? "Back to Boards" : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // Check access: private canvases require owner
  const canView = Boolean(canvas);


  if (!canvas || !canView) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ background: NEO.bg }}
      >
        <div
          className="text-center p-8"
          style={{
            background: NEO.surface,
            borderRadius: NEO.radiusLg,
            boxShadow: NEO.shadow,
            maxWidth: "400px",
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{ background: `${NEO.inkLight}20` }}
          >
            <IconLock />
          </div>
          <div className="text-lg font-semibold mb-2" style={{ color: NEO.ink }}>
            Canvas not found
          </div>
          <p className="text-sm mb-6" style={{ color: NEO.inkLight }}>
            This canvas may have been deleted or the link is invalid.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-sm font-medium"
            style={{
              background: NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radius,
            }}
          >
            {userId ? "Back to Boards" : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div
      className="flex h-screen w-full overflow-hidden select-none relative"
      style={{
        fontFamily:
          '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        background: NEO.bg,
        color: NEO.ink,
      }}
      onMouseMove={handleMouseMoveWrapper}
      onPointerMove={handlePointerMove}
      onMouseUp={handleMouseUpWrapper}
      onPointerUp={handlePointerUp}
      onClick={() => setContextMenu(null)}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[10]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`,
        }}
      />

      <Header
        onBack={onBack}
        canvasName={canvas?.name}
        canEditName={canEditName}
        onRename={changeCanvasName}
      />

  <Toolbar
        activeTool={activeTool}
        onToolChange={(t) => {
          if (!canEdit) return;
          setActiveTool(t);
          setConnectFrom(null);
        }}
        disabled={!canEdit}
      />

      <ImageDrawer
        isOpen={activeTool === "image"}
        onClose={() => setActiveTool(null)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        picturePool={picturePool}
        drawerImageAngles={drawerImageAngles}
        onUploadClick={() => fileInputRef.current?.click()}
        onImageDragStart={(img, x, y) =>
          setDraggedFromDrawer({ type: "image", data: img, x, y })
        }
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
      />
      <TextDrawer
        isOpen={activeTool === "text"}
        onClose={() => setActiveTool(null)}
        textInput={textInput}
        onTextChange={setTextInput}
        wordCount={wordCount}
        previewStyle={previewTextStyle}
        onShuffle={() => setPreviewTextStyle(generateMagazineStyle(textInput))}
        onDragStart={(x, y) =>
          setDraggedFromDrawer({ type: "text", data: textInput, x, y })
        }
      />
      <StickerDrawer
        isOpen={activeTool === "sticker"}
        onClose={() => setActiveTool(null)}
        drawerStickerAngles={drawerStickerAngles}
        onStickerDragStart={(s, x, y) =>
          setDraggedFromDrawer({ type: "sticker", data: s, x, y })
        }
      />

      <main
        ref={viewportRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: "#F3F2EE",
          cursor: lassoState.active
            ? "crosshair"
            : interactionState === "panning"
              ? "grabbing"
              : "grab",
          touchAction: "none",
        }}
        onMouseDown={handleCanvasMouseDownWrapper}
        onPointerDown={handleCanvasPointerDown}
        onContextMenu={(e) => handleContextMenu(e, null)}
        onDrop={handleCanvasDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          className="canvas-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${NEO.accent} 1px, transparent 1px)`,
            backgroundSize: `${30 * viewport.scale}px ${30 * viewport.scale}px`,
            backgroundPosition: `${viewport.x * viewport.scale}px ${viewport.y * viewport.scale}px`,
            opacity: 0.6,
          }}
        />
        <div
          className="canvas-content absolute"
          style={{
            transformOrigin: "0 0",
            transform: `scale(${viewport.scale}) translate(${viewport.x}px, ${viewport.y}px)`,
            transition: isAnimating
              ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          <svg
            className="absolute overflow-visible pointer-events-none"
            style={{ width: 1, height: 1 }}
          >
            {connectionPreview && <ConnectionPreview {...connectionPreview} />}
            {connections.map((c) => (
            <Connection
              key={c.id}
              connection={c}
              fromElement={elements.find((e) => e.id === c.from)}
              toElement={elements.find((e) => e.id === c.to)}
              isEditing={editingConnectionId === c.id}
              inputRef={connectionInputRef}
              onEdit={(connId) => {
                if (!canEdit) return;
                setEditingConnectionId(connId);
              }}
              onBlur={() => setEditingConnectionId(null)}
              onChange={(connId, text) => updateConnection(connId, text)}
              readOnly={!canEdit}
            />
          ))}
          </svg>

          {sortedElements.map((el) => (
            <CanvasElement
              key={el.id}
              element={el}
              isSelected={selectedId === el.id}
              isEditing={editingTextId === el.id}
              editRef={editTextRef}
              onMouseDown={handleElementMouseDownWrapper}
              onPointerDown={handleElementPointerDown}
              onClick={(e) => {
                e.stopPropagation();
                if (ignoreNextClickRef.current) {
                  ignoreNextClickRef.current = false;
                  return;
                }
                setSelectedId(el.id);
                setContextMenu(null);
              }}
              onContextMenu={(e) => handleContextMenu(e, el.id)}
              onSubmitEdit={(t) => {
                if (!canEdit) return;
                if (t.trim()) {
                  updateElement(el.id, { content: t.trim() });
                }
                setEditingTextId(null);
              }}
              onStartEdit={() => {
                if (!canEdit || el.isLocked) return;
                setEditingTextId(el.id);
              }}
              toolbarProps={toolbarActions(el)}
              comments={el.comments || []}
              canEdit={canEdit}
              currentUserId={userId}
              currentUserAvatar={currentUserAvatar}
              activeEditors={activeEditorsByElement[el.id] || []}
              isAddingComment={newCommentTargetId === el.id}
              commentText={newCommentText}
              onCommentTextChange={setNewCommentText}
              onAddCommentSubmit={addElementComment}
              onAddCommentCancel={() => {
                setNewCommentTargetId(null);
                setNewCommentText("");
              }}
              commentInputRef={newCommentRef}
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

        {lassoState.isDrawing && lassoState.points.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none z-[2000]"
            style={{ width: "100%", height: "100%" }}
          >
            <polyline
              points={lassoState.points.map((p) => `${p.x},${p.y}`).join(" ")}
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

      {draggedFromDrawer && (
        <div
          className="fixed pointer-events-none z-[1000]"
          style={{
            left: draggedFromDrawer.x,
            top: draggedFromDrawer.y,
            transform: draggedFromDrawer.type === "text" 
              ? "translate(-50%, -50%)" 
              : "translate(-50%, -50%) scale(0.85)",
            opacity: 0.95,
          }}
        >
          {draggedFromDrawer.type === "image" ? (
            <div
              style={{
                padding: "4px",
                background: "white",
                borderRadius: NEO.radius,
                boxShadow: NEO.shadow,
              }}
            >
              <img
                src={draggedFromDrawer.data.url}
                className="w-36"
                style={{ borderRadius: NEO.radiusSm }}
              />
            </div>
          ) : draggedFromDrawer.type === "sticker" ? (
            <div
              className="p-5 text-4xl"
              style={{
                filter:
                  "drop-shadow(0 0 0 white) drop-shadow(3px 3px 0px white) drop-shadow(-3px -3px 0px white)",
              }}
            >
              {draggedFromDrawer.data}
            </div>
          ) : (
            <div
              style={{
                ...previewTextStyle,
                // Keep the same style, just add a slight scale down for drag preview
                transform: `${previewTextStyle.transform || ''} scale(0.85)`.trim(),
              }}
            >
              {textInput || "..."}
            </div>
          )}
        </div>
      )}
      {activeTool === "connect" && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 z-[150] text-sm font-medium"
          style={{
            background: NEO.ink,
            color: NEO.bg,
            boxShadow: NEO.shadowHover,
            borderRadius: NEO.radiusLg,
          }}
        >
          {connectFrom
            ? "👆 Click another element to connect"
            : "👆 Click an element to start"}
        </div>
      )}
      {canJoin && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150]">
          <button
            onClick={handleJoinCanvas}
            disabled={isJoining}
            className="px-6 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
              background: isJoining ? NEO.inkLight : NEO.ink,
              color: NEO.bg,
              borderRadius: NEO.radiusLg,
              boxShadow: NEO.shadowHover,
              cursor: isJoining ? "not-allowed" : "pointer",
            }}
          >
            {isJoining ? "Joining..." : "Join to edit"}
          </button>
        </div>
      )}
      {lassoState.active && !lassoState.isDrawing && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 z-[150] text-sm font-medium animate-pulse"
          style={{
            background: NEO.ink,
            color: NEO.bg,
            boxShadow: NEO.shadowHover,
            borderRadius: NEO.radiusLg,
          }}
        >
          ✂️ Draw on the image to crop it
        </div>
      )}

      <BottomControls
        scale={viewport.scale}
        onZoomIn={() =>
          setViewport((p) => ({ ...p, scale: Math.min(3, p.scale * 1.2) }))
        }
        onZoomOut={() =>
          setViewport((p) => ({ ...p, scale: Math.max(0.2, p.scale / 1.2) }))
        }
        onSnapToCenter={() => {
          const r = viewportRef.current?.getBoundingClientRect();
          if (r && elements.length) {
            const cx =
              elements.reduce((s, e) => s + e.x + (e.width || 220) / 2, 0) /
              elements.length;
            const cy =
              elements.reduce((s, e) => s + e.y + 150, 0) / elements.length;
            setIsAnimating(true);
            setViewport({
              x: r.width / 2 - cx,
              y: r.height / 2 - cy,
              scale: 1,
            });
            setTimeout(() => setIsAnimating(false), 400);
          }
        }}
      />
      <Minimap
        elements={elements}
        selectedId={selectedId}
        viewport={viewport}
        viewportRef={viewportRef}
        onNavigate={(x, y) => {
          const r = viewportRef.current?.getBoundingClientRect();
          if (r)
            setViewport((p) => ({
              x: r.width / 2 / p.scale - x,
              y: r.height / 2 / p.scale - y,
              scale: p.scale,
            }));
        }}
      />
      <ActionButtons
        canvasId={canvasId}
        visibility={canvasVisibility}
        isOwner={isOwner}
        onVisibilityChange={(visibility) => {}}
      />

      <style>{`* { font-family: "SF Pro Display", -apple-system, sans-serif; color-scheme: light; } body { background: ${NEO.bg}; margin: 0; } ::-webkit-scrollbar { display: none; } .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); } @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } } .caret-animate { animation: caretBlink 1s step-end infinite; } @keyframes caretBlink { 0%, 100% { caret-color: ${NEO.ink}; } 50% { caret-color: transparent; } }`}</style>
    </div>
  );
}
