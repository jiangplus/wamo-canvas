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
import { DEFAULT_ELEMENT_WIDTH, STICKER_LIST } from "./utils/constants";
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

// ============================================================================
// VISIBILITY OPTIONS
// ============================================================================
const LockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const VISIBILITY_OPTIONS = [
  {
    value: "private",
    label: "Private",
    description: "Only you can view and edit",
    icon: LockIcon,
    color: "#6B7280",
  },
  {
    value: "protected",
    label: "Protected",
    description: "Anyone can view, only you can edit",
    icon: ShieldIcon,
    color: "#F59E0B",
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone can view and edit",
    icon: GlobeIcon,
    color: "#10B981",
  },
];

// ============================================================================
// VISIBILITY BUTTON COMPONENT
// ============================================================================
function VisibilityButton({ visibility, onChangeVisibility, isOwner }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const visibilityOption =
    VISIBILITY_OPTIONS.find((o) => o.value === visibility) ||
    VISIBILITY_OPTIONS[0];
  const VisibilityIcon = visibilityOption.icon;

  const handleVisibilityChange = (e, newVisibility) => {
    e.stopPropagation();
    onChangeVisibility(newVisibility);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="flex items-center gap-2 px-4 py-2.5 transition-all hover:scale-[1.02]"
        style={{
          background: NEO.surface,
          backdropFilter: "blur(20px)",
          border: `1px solid ${NEO.border}`,
          boxShadow: NEO.shadow,
          borderRadius: NEO.radiusLg,
          cursor: "pointer",
        }}
        title={visibilityOption.description}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{
            background: `${visibilityOption.color}15`,
            color: visibilityOption.color,
          }}
        >
          <VisibilityIcon />
        </div>
        <span className="text-sm font-medium" style={{ color: NEO.ink }}>
          {visibilityOption.label}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={NEO.inkLight}
          strokeWidth="2"
          style={{ marginLeft: "2px" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-[140]"
            onClick={() => setShowDropdown(false)}
          />
          <div
            className="absolute right-0 top-full mt-2 py-2 min-w-[220px] z-[150] animate-popIn"
            style={{
              background: NEO.surface,
              backdropFilter: "blur(20px)",
              border: `1px solid ${NEO.border}`,
              borderRadius: NEO.radiusLg,
              boxShadow: NEO.shadowHover,
            }}
          >
            <div
              className="px-4 py-2 mb-1 text-xs font-medium uppercase tracking-wide"
              style={{ color: NEO.inkLight }}
            >
              Visibility
            </div>
            {VISIBILITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = visibility === option.value;
              return (
                <button
                  key={option.value}
                  onClick={(e) => handleVisibilityChange(e, option.value)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-all ${isOwner ? "hover:bg-black/5" : ""}`}
                  style={{
                    background: isSelected
                      ? `${option.color}08`
                      : "transparent",
                    opacity: isOwner ? 1 : 0.5,
                    cursor: isOwner ? "pointer" : "not-allowed",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{
                      background: `${option.color}15`,
                      color: option.color,
                    }}
                  >
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      style={{ color: NEO.ink }}
                    >
                      {option.label}
                    </div>
                    <div className="text-xs" style={{ color: NEO.inkLight }}>
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={option.color}
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

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
  private: [
    {
      id: "pr1",
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

const getAvatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;

// ============================================================================
// MAIN APP
// ============================================================================
export default function App({ canvasId, onBack }) {
  // Get current user
  const { user } = db.useAuth();
  const userId = user?.id;
  const includeUserData = Boolean(userId);

  // Query canvas data
  const { data: canvasData, isLoading: canvasLoading, error: queryError } =
    db.useQuery(
      canvasId
        ? {
            canvases: {
              $: { where: { id: canvasId } },
              ...(includeUserData ? { owner: {} } : {}),
              elements: includeUserData
                ? { creator: {}, comments: { author: {} } }
                : { comments: {} },
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
  const isOwner = userId && canvasOwnerId && userId === canvasOwnerId;
  const canvasVisibility = canvas?.visibility || "private";
  const canEdit = Boolean(userId) && (isOwner || canvasVisibility === "public");

  const elements = useMemo(() => {
    if (!canvas?.elements) return [];
    return canvas.elements.map((el) => ({
      ...el,
      // Add creator info for display
      creatorId: el.creator?.[0]?.id || null,
      creatorName: el.creator?.[0]?.email?.split("@")[0] || "Unknown",
      avatar: getAvatarUrl(el.creator?.[0]?.email?.split("@")[0] || "unknown"),
      // Map comments
      comments:
        el.comments?.map((c) => ({
          ...c,
          authorId: c.author?.[0]?.id || null,
          author: c.author?.[0]?.email?.split("@")[0] || "Unknown",
          avatar: getAvatarUrl(
            c.author?.[0]?.email?.split("@")[0] || "unknown",
          ),
          createdAt: c.createdAt,
        })) || [],
    }));
  }, [canvas]);

  const connections = useMemo(() => {
    if (!canvas?.connections) return [];
    return canvas.connections.map((c) => ({
      id: c.id,
      from: c.fromElement?.[0]?.id,
      to: c.toElement?.[0]?.id,
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
    generateMagazineStyle(),
  );
  const [picturePool, setPicturePool] = useState(INITIAL_PICTURE_POOL);
  const [drawerImageAngles, setDrawerImageAngles] = useState({});
  const [drawerStickerAngles, setDrawerStickerAngles] = useState({});

  // ===== COMPUTED =====
  const wordCount = useMemo(
    () => (textInput.trim() ? textInput.trim().split(/\s+/).length : 0),
    [textInput],
  );

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
    const { creatorName, avatar, comments, creator, ...schemaUpdates } =
      updates;
    db.transact([tx.elements[elementId].update(schemaUpdates)]);
  }, [canEdit]);

  const addElement = useCallback(
    (data) => {
      if (!canvasId || !userId || !canEdit) return;
      const elementId = id();
      const zIndex = maxZIndex + 1;

      db.transact([
        tx.elements[elementId]
          .update({
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
          })
          .link({ canvas: canvasId })
          .link({ creator: userId }),
      ]);

      setSelectedId(elementId);
      return elementId;
    },
    [canvasId, userId, maxZIndex, canEdit],
  );

  const deleteElement = useCallback(
    (elementId) => {
      if (!elementId || !canEdit) return;
      db.transact([tx.elements[elementId].delete()]);
      if (selectedId === elementId) setSelectedId(null);
    },
    [selectedId, canEdit],
  );

  const addConnection = useCallback(
    (fromId, toId) => {
      if (!canvasId || !fromId || !toId || !canEdit) return;
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

  const changeCanvasVisibility = useCallback(
    (visibility) => {
      if (!canvasId || !isOwner) return;
      db.transact([tx.canvases[canvasId].update({ visibility })]);
    },
    [canvasId, isOwner],
  );

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
    [...picturePool.public, ...picturePool.private].forEach((i) => {
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
  const handleCanvasMouseDown = (e) => {
    if (!canEdit && interactionState !== "panning") {
      setSelectedId(null);
      setContextMenu(null);
    }
    if (lassoState.active && lassoState.elementId) {
      if (e.target.closest(`#content-${lassoState.elementId}`)) {
        setLassoState((p) => ({
          ...p,
          isDrawing: true,
          points: [{ x: e.clientX, y: e.clientY }],
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
      e.target === viewportRef.current ||
      e.target.classList.contains("canvas-content") ||
      e.target.classList.contains("canvas-grid")
    ) {
      setSelectedId(null);
      setConnectFrom(null);
      setEditingTextId(null);
      setContextMenu(null);
      dragRef.current = {
        id: null,
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
        initialViewport: { x: viewport.x, y: viewport.y },
      };
      setInteractionState("panning");
    }
  };

  const handleElementMouseDown = (e, elId, type) => {
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
          points: [{ x: e.clientX, y: e.clientY }],
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
      if (!canEdit) return;
      if (!connectFrom) {
        setConnectFrom(elId);
        setSelectedId(elId);
      } else if (connectFrom !== elId) {
        const cid = addConnection(connectFrom, elId);
        setConnectFrom(null);
        setEditingConnectionId(cid);
        setActiveTool(null);
        setTimeout(() => connectionInputRef.current?.focus(), 100);
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
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
    );

    dragRef.current = {
      id: elId,
      type,
      startX: e.clientX,
      startY: e.clientY,
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

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });

    if (lassoState.isDrawing) {
      if (!canEdit) return;
      setLassoState((p) => ({
        ...p,
        points: [...p.points, { x: e.clientX, y: e.clientY }],
      }));
      return;
    }

    if (draggedFromDrawer) {
      setDraggedFromDrawer({
        ...draggedFromDrawer,
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }
    if (interactionState === "idle") return;
    const dx = e.clientX - dragRef.current.startX,
      dy = e.clientY - dragRef.current.startY;
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
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
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
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const strA =
        Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
      updateElement(elId, { rotation: initialRot + (curA - strA) });
    }
  };

  const handleMouseUp = (e) => {
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
      const wp = getWorldCoords(e.clientX, e.clientY);
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

  // ===== CONTEXT MENU & COMMENTS =====
  const handleContextMenu = (e, elementId) => {
    if (!canEdit) return;
    e.preventDefault();
    if (!elementId) return;
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: elementId });
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
    onUndo: () => {}, // Undo not supported with real-time sync
    onShuffle: () =>
      !el.isLocked && updateElement(el.id, { style: generateMagazineStyle() }),
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
            <LockIcon />
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
  const isPrivate = !canvas?.visibility || canvas?.visibility === "private";
  const canView = canvas && (!isPrivate || isOwner);

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
            <LockIcon />
          </div>
          <div className="text-lg font-semibold mb-2" style={{ color: NEO.ink }}>
            {!canvas ? "Canvas not found" : "Access Denied"}
          </div>
          <p className="text-sm mb-6" style={{ color: NEO.inkLight }}>
            {!canvas
              ? "This canvas may have been deleted or the link is invalid."
              : "This canvas is private. Only the owner can view it."}
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => setContextMenu(null)}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[10]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`,
        }}
      />

      <Header onBack={onBack} canvasName={canvas?.name} />

      {/* Visibility Button - positioned top-right before UserMenu */}
      <div className="fixed top-8 right-[280px] z-[160]">
        <VisibilityButton
          visibility={canvasVisibility}
          onChangeVisibility={changeCanvasVisibility}
          isOwner={isOwner}
        />
      </div>

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
        onShuffle={() => setPreviewTextStyle(generateMagazineStyle())}
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
        }}
        onMouseDown={handleCanvasMouseDown}
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
              onMouseDown={handleElementMouseDown}
              onClick={(e) => {
                e.stopPropagation();
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
            transform: "translate(-50%, -50%) scale(0.85)",
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
                transform: "none",
                fontSize: `${previewTextStyle.fontSize * 0.8}px`,
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
      <ActionButtons />

      <style>{`* { font-family: "SF Pro Display", -apple-system, sans-serif; color-scheme: light; } body { background: ${NEO.bg}; margin: 0; } ::-webkit-scrollbar { display: none; } .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); } @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } } .caret-animate { animation: caretBlink 1s step-end infinite; } @keyframes caretBlink { 0%, 100% { caret-color: ${NEO.ink}; } 50% { caret-color: transparent; } }`}</style>
    </div>
  );
}
