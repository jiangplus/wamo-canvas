/**
 * CanvasElement Component
 * Canvas element component - renders various element types (image, text, sticker)
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconLock, IconLink } from '../../icons';
import Avatar from '../ui/Avatar';
import ElementToolbar from '../toolbar/ElementToolbar';
import { ElementCommentList, CommentInput } from '../ui/Comment';

// Grain texture overlay
const GrainOverlay = ({ borderRadius }) => (
  <div
    className="absolute inset-0 pointer-events-none z-[5]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      opacity: 0.08,
      mixBlendMode: 'multiply',
      borderRadius
    }}
  />
);

// Selection frame component
const SelectionFrame = ({ onMouseDown, onPointerDown }) => {
  const triggerMouse = (e, type) => {
    e.stopPropagation();
    onMouseDown?.(e, type);
  };
  const triggerPointer = (e, type) => {
    e.stopPropagation();
    onPointerDown ? onPointerDown(e, type) : onMouseDown?.(e, type);
  };
  return (
  <>
    {/* Visible Framing Box */}
    <div className="absolute inset-0 border-[1.5px] border-[#60a5fa] pointer-events-none z-10" />

    {/* Edges - Resize (Standard Resize Shape) */}
    {/* Top */}
    <div
      className="absolute -top-1 left-2 right-2 h-2 cursor-ns-resize z-20"
      onMouseDown={(e) => triggerMouse(e, 'resize-n')}
      onPointerDown={(e) => triggerPointer(e, 'resize-n')}
    />
    {/* Bottom */}
    <div
      className="absolute -bottom-1 left-2 right-2 h-2 cursor-ns-resize z-20"
      onMouseDown={(e) => triggerMouse(e, 'resize-s')}
      onPointerDown={(e) => triggerPointer(e, 'resize-s')}
    />
    {/* Left */}
    <div
      className="absolute top-2 bottom-2 -left-1 w-2 cursor-ew-resize z-20"
      onMouseDown={(e) => triggerMouse(e, 'resize-w')}
      onPointerDown={(e) => triggerPointer(e, 'resize-w')}
    />
    {/* Right */}
    <div
      className="absolute top-2 bottom-2 -right-1 w-2 cursor-ew-resize z-20"
      onMouseDown={(e) => triggerMouse(e, 'resize-e')}
      onPointerDown={(e) => triggerPointer(e, 'resize-e')}
    />

    {/* Corners - Rotate (Rotation Shape) */}
    {/* Top Left */}
    <div
      className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center cursor-alias z-30"
      onMouseDown={(e) => triggerMouse(e, 'rotate')}
      onPointerDown={(e) => triggerPointer(e, 'rotate')}
    >
       <div className="w-2 h-2 bg-white border border-[#60a5fa] rounded-full" />
    </div>
    {/* Top Right */}
    <div
      className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center cursor-alias z-30"
      onMouseDown={(e) => triggerMouse(e, 'rotate')}
      onPointerDown={(e) => triggerPointer(e, 'rotate')}
    >
       <div className="w-2 h-2 bg-white border border-[#60a5fa] rounded-full" />
    </div>
    {/* Bottom Left */}
    <div
      className="absolute -bottom-3 -left-3 w-6 h-6 flex items-center justify-center cursor-alias z-30"
      onMouseDown={(e) => triggerMouse(e, 'rotate')}
      onPointerDown={(e) => triggerPointer(e, 'rotate')}
    >
       <div className="w-2 h-2 bg-white border border-[#60a5fa] rounded-full" />
    </div>
    {/* Bottom Right */}
    <div
      className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center cursor-alias z-30"
      onMouseDown={(e) => triggerMouse(e, 'rotate')}
      onPointerDown={(e) => triggerPointer(e, 'rotate')}
    >
       <div className="w-2 h-2 bg-white border border-[#60a5fa] rounded-full" />
    </div>
  </>
  );
};

// Lock overlay
const LockOverlay = ({ borderRadius }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-50 pointer-events-none" style={{ borderRadius }}>
    <div className="p-2 bg-white/90" style={{ boxShadow: NEO.shadow, borderRadius: '50%' }}>
      <IconLock />
    </div>
  </div>
);

// Image element
const ImageElement = ({ element }) => (
  <div
    className="w-full h-full"
    style={{
      filter: `
        drop-shadow(2px 2px 0 white)
        drop-shadow(-2px -2px 0 white)
        drop-shadow(2px -2px 0 white)
        drop-shadow(-2px 2px 0 white)
        drop-shadow(0 3px 0 white)
        drop-shadow(0 -3px 0 white)
        drop-shadow(3px 0 0 white)
        drop-shadow(-3px 0 0 white)
        drop-shadow(${NEO.shadow})
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible'
    }}
  >
    <img
      src={element.content}
      className="w-full h-auto block"
      draggable="false"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: element.shape?.borderRadius || '4px',
        clipPath: element.shape?.clipPath || 'none',
        filter: element.texture !== 'none' ? element.texture : 'none',
      }}
      alt="Canvas element"
    />
  </div>
);

// Sticker element
const StickerElement = ({ element }) => (
  <div
    className="flex items-center justify-center h-full"
    style={{
      padding: '16px',
      filter: 'drop-shadow(0 0 0 white) drop-shadow(3px 3px 0px white) drop-shadow(-3px -3px 0px white) drop-shadow(3px -3px 0px white) drop-shadow(-3px 3px 0px white) drop-shadow(0 3px 0px white) drop-shadow(0 -3px 0px white) drop-shadow(3px 0 0px white) drop-shadow(-3px 0 0px white)'
    }}
  >
    <span className="text-6xl">{element.content}</span>
  </div>
);

// Text element - renders as a fixed-shape card (like a picture)
const TextElement = ({ element, isEditing, editRef, onSubmitEdit, onStartEdit }) => {
  // Ensure text is left-aligned by default
  const textAlign = element.style?.textAlign || 'left';
  // Get the fixed width from style to maintain shape consistency
  const fixedWidth = element.style?.width || 'auto';
  
  if (isEditing) {
    return (
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onSubmitEdit(e.target.innerText)}
        onKeyDown={(e) => { 
          if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            onSubmitEdit(e.target.innerText); 
          } 
        }}
        className="outline-none"
        style={{ 
          ...element.style, 
          transform: 'none',
          boxShadow: NEO.shadow, 
          // Use outline so it doesn't affect the card's dimensions
          outline: `2px solid ${NEO.ink}`,
          textAlign,
          width: fixedWidth,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          cursor: 'text',
          display: 'block',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {element.content}
      </div>
    );
  }
  return (
    <div
      style={{
        ...element.style,
        transform: 'none', // Rotation is handled by the container
        boxShadow: NEO.shadowSoft,
        border: 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        textAlign,
      }}
      onDoubleClick={onStartEdit}
    >
      {element.content}
    </div>
  );
};

export const CanvasElement = ({
  element,
  isSelected,
  isEditing,
  editRef,
  onMouseDown,
  onPointerDown,
  onClick,
  onContextMenu,
  onSubmitEdit,
  onStartEdit,
  toolbarProps,
  // Comments Props
  comments = [],
  canEdit = false,
  currentUserId,
  currentUserAvatar,
  activeEditors = [],
  isAddingComment,
  commentText,
  onCommentTextChange,
  onAddCommentSubmit,
  onAddCommentCancel,
  commentInputRef,
  // Comment Edit Props
  onDeleteComment,
  onEditComment,
  editingCommentId,
  editingCommentText,
  onEditingCommentTextChange,
  onSaveEditComment,
  onCancelEditComment,
  editCommentInputRef,
  // Evolution Mode
  isEvolutionMode = false
}) => {
  const scale = element.scale || 1;
  
  // For text elements, use 'auto' to let the style control the size
  // For images and stickers, use element.width
  const scaledWidth = element.type === 'text'
    ? 'auto'
    : (element.width || 220);

  const scaledHeight = element.type === 'text' ? 'auto' : (element.type === 'image' ? 'auto' : (element.width || 220) * 0.65);

  const currentBorderRadius = element.type === 'image'
    ? (element.shape?.borderRadius || '4px')
    : '0px'; // Perfect rectangle for text

  // For text elements, combine the style rotation with the element rotation and scale
  // This ensures the selection box scales with the content
  const textStyleRotation = element.type === 'text' && element.style?.transform 
    ? element.style.transform 
    : '';
  const baseRotation = element.rotation || 0;
  
  // Build transform: for text, include scale and style rotation; for others, just element rotation
  const containerTransform = element.type === 'text'
    ? `${textStyleRotation} rotate(${baseRotation}deg) scale(${scale})`
    : `rotate(${baseRotation}deg)`;

  return (
    <div
      className="absolute"
      style={{
        left: element.x,
        top: element.y,
        zIndex: isSelected ? 100 : (element.zIndex || 20),
        transition: isEvolutionMode ? 'left 0.1s ease-out, top 0.1s ease-out, transform 0.1s ease-out, opacity 0.15s ease-out' : 'none',
        willChange: isEvolutionMode ? 'left, top, transform' : 'auto',
      }}
    >
      {/* Show toolbar when selected */}
      {isSelected && canEdit && <ElementToolbar element={element} {...toolbarProps} />}

      {/* Element body */}
      <div
        id={`content-${element.id}`}
        className="relative group"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          transform: containerTransform,
          transformOrigin: 'center center',
          overflow: 'visible',
          cursor: canEdit ? (element.isLocked ? 'not-allowed' : 'grab') : 'default',
          transition: isEvolutionMode ? 'transform 0.1s ease-out' : 'none',
        }}
        onMouseDown={(e) => onMouseDown(e, element.id, 'move')}
        onPointerDown={(e) => onPointerDown?.(e, element.id, 'move')}
        onClick={onClick}
        onContextMenu={(e) => onContextMenu(e, element.id)}
      >
        {/* Selection frame and handles */}
        {isSelected && !element.isLocked && canEdit && (
          <SelectionFrame
            onMouseDown={(e, type) => onMouseDown(e, element.id, type)}
            onPointerDown={(e, type) => onPointerDown?.(e, element.id, type)}
          />
        )}


        {/* Grain texture - Only for images to give them texture, not for stickers/text which need transparency */}
        {element.type === 'image' && (
          <>
            <GrainOverlay borderRadius={currentBorderRadius} />
          </>
        )}

        {/* Element content */}
        {element.type === 'image' && <ImageElement element={element} />}
        {element.type === 'sticker' && <StickerElement element={element} />}
        {element.type === 'text' && <TextElement element={element} isEditing={isEditing} editRef={editRef} onSubmitEdit={onSubmitEdit} onStartEdit={onStartEdit} />}

        {/* Lock overlay */}
        {element.isLocked && isSelected && (
          <LockOverlay borderRadius={currentBorderRadius} />
        )}

        {/* Portal button (only render when element has a link) */}
        {element.link && (
          <a 
            href={element.link} 
            target="_blank"
            rel="noopener noreferrer"
            className="
              absolute -top-5 -right-5 
              w-10 h-10 rounded-full 
              flex items-center justify-center
              transform transition-all duration-300
              opacity-40 group-hover:opacity-100 scale-90 group-hover:scale-100
              z-[60] cursor-pointer
            "
            style={{
              background: 'white',
              border: `1px solid ${NEO.border}`,
              boxShadow: NEO.shadow,
              color: NEO.ink
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            title={element.link}
          >
            <IconLink size={20} />
          </a>
        )}
      </div>

      {activeEditors.length > 0 && (
        <div
          className="absolute -right-2 top-2 flex flex-col gap-1 z-[120]"
          style={{ pointerEvents: 'none' }}
        >
          {activeEditors.slice(0, 3).map((editor) => (
            <div
              key={editor.id}
              className="flex items-center gap-1 px-1.5 py-1"
              style={{
                background: 'white',
                border: `1px solid ${NEO.border}`,
                borderRadius: NEO.radius,
                boxShadow: NEO.shadowSoft,
              }}
            >
              <Avatar src={editor.avatar} size={18} />
              <span
                className="text-[9px] font-semibold max-w-[80px] truncate"
                style={{ color: NEO.ink }}
              >
                {editor.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Comments area - displayed below element with matching width */}
      <div style={{ width: element.type === 'text' ? '100%' : scaledWidth, marginTop: '8px' }}>
        {/* Comment input */}
        {isAddingComment && (
          <CommentInput
            value={commentText}
            onChange={onCommentTextChange}
            onSubmit={onAddCommentSubmit}
            onCancel={onAddCommentCancel}
            inputRef={commentInputRef}
            avatarUrl={currentUserAvatar}
          />
        )}

        {/* Comment list */}
        <ElementCommentList
          comments={comments}
          currentUserId={currentUserId}
          onDelete={onDeleteComment}
          onEdit={onEditComment}
          editingId={editingCommentId}
          editingText={editingCommentText}
          onEditingTextChange={onEditingCommentTextChange}
          onSaveEdit={onSaveEditComment}
          onCancelEdit={onCancelEditComment}
          editInputRef={editCommentInputRef}
        />
      </div>
    </div>
  );
};

export default CanvasElement;
