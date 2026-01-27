/**
 * CanvasElement Component
 * 画布元素组件 - 渲染各类型元素（图片、文字、贴纸）
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconLock, IconLink } from '../../icons';
import Avatar from '../ui/Avatar';
import ElementToolbar from '../toolbar/ElementToolbar';
import { ElementCommentList, CommentInput } from '../ui/Comment';

// 噪点纹理覆盖
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

// 选框组件
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

// 锁定覆盖层
const LockOverlay = ({ borderRadius }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-50 pointer-events-none" style={{ borderRadius }}>
    <div className="p-2 bg-white/90" style={{ boxShadow: NEO.shadow, borderRadius: '50%' }}>
      <IconLock />
    </div>
  </div>
);

// 图片元素
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

// 贴纸元素
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

// 文字元素
const TextElement = ({ element, scale, isEditing, editRef, onSubmitEdit, onStartEdit }) => {
  if (isEditing) {
    return (
      <textarea
        ref={editRef}
        defaultValue={element.content}
        onBlur={(e) => onSubmitEdit(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmitEdit(e.target.value); } }}
        className="w-full h-full outline-none resize-none"
        style={{ ...element.style, width: '100%', height: '100%', fontSize: `${(element.style?.fontSize || 22) * scale}px`, transform: 'none', boxShadow: NEO.shadow, border: `2px solid ${NEO.ink}` }}
        onMouseDown={(e) => e.stopPropagation()}
      />
    );
  }
  return (
    <div
      className="overflow-hidden"
      style={{
        ...element.style,
        width: '100%',
        height: 'fit-content',
        fontSize: `${(element.style?.fontSize || 22) * scale}px`,
        transform: element.style?.transform || 'none',
        boxShadow: NEO.shadow,
        border: 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
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
  editCommentInputRef
}) => {
  const scale = element.scale || 1;
  // Make width respect element.width for Text as well, scaling it to maintain aspect ratio/layout
  const scaledWidth = element.type === 'text'
    ? (element.width || 220) * scale
    : (element.width || 220);

  const scaledHeight = element.type === 'text' ? 'auto' : (element.type === 'image' ? 'auto' : (element.width || 220) * 0.65);

  const currentBorderRadius = element.type === 'image'
    ? (element.shape?.borderRadius || '4px')
    : (element.type === 'text' ? '2px' : '0px');

  return (
    <div className="absolute" style={{ left: element.x, top: element.y, zIndex: isSelected ? 100 : (element.zIndex || 20) }}>
      {/* 选中时显示工具栏 */}
      {isSelected && canEdit && <ElementToolbar element={element} {...toolbarProps} />}

      {/* 元素主体 */}
      <div
        id={`content-${element.id}`}
        className="relative group"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          transform: `rotate(${element.rotation}deg)`,
          overflow: 'visible',
          cursor: canEdit ? (element.isLocked ? 'not-allowed' : 'grab') : 'default'
        }}
        onMouseDown={(e) => onMouseDown(e, element.id, 'move')}
        onPointerDown={(e) => onPointerDown?.(e, element.id, 'move')}
        onClick={onClick}
        onContextMenu={(e) => onContextMenu(e, element.id)}
      >
        {/* 选框与手柄 */}
        {isSelected && !element.isLocked && canEdit && (
          <SelectionFrame
            onMouseDown={(e, type) => onMouseDown(e, element.id, type)}
            onPointerDown={(e, type) => onPointerDown?.(e, element.id, type)}
          />
        )}

        {/* #region agent log */}
        {(() => {
             fetch('http://127.0.0.1:7245/ingest/107c799c-6417-454c-9202-86b4f3fb5d3f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CanvasElement.jsx:render',message:'Rendering element',data:{id:element.id,type:element.type,hasGrainOverlay:true},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
             return null;
        })()}
        {/* #endregion */}

        {/* 噪点纹理 - Only for images to give them texture, not for stickers/text which need transparency */}
        {element.type === 'image' && (
          <>
            {(() => {
               // #region agent log
               fetch('http://127.0.0.1:7245/ingest/107c799c-6417-454c-9202-86b4f3fb5d3f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CanvasElement.jsx:GrainOverlay',message:'Rendering GrainOverlay for image',data:{id:element.id,type:element.type},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
               // #endregion
               return null;
            })()}
            <GrainOverlay borderRadius={currentBorderRadius} />
          </>
        )}

        {/* 元素内容 */}
        {element.type === 'image' && <ImageElement element={element} />}
        {element.type === 'sticker' && <StickerElement element={element} />}
        {element.type === 'text' && <TextElement element={element} scale={scale} isEditing={isEditing} editRef={editRef} onSubmitEdit={onSubmitEdit} onStartEdit={onStartEdit} />}

        {/* 锁定覆盖 */}
        {element.isLocked && isSelected && (
          <LockOverlay borderRadius={currentBorderRadius} />
        )}

        {/* 传送门 Button (仅当有 Link 时渲染) */}
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

      {/* 评论区域 - 显示在元素下方，宽度与元素一致 */}
      <div style={{ width: element.type === 'text' ? '100%' : scaledWidth, marginTop: '8px' }}>
        {/* 评论输入框 */}
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

        {/* 评论列表 */}
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
