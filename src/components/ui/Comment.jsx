/**
 * Comment Component
 * 评论气泡组件
 */
import React, { useState } from 'react';
import { NEO } from '../../styles/theme';
import Avatar from './Avatar';
import { IconCheck, IconClose, IconEdit, IconTrash } from '../../icons';

const TruncatedText = ({ text }) => {
  const words = text.split(/\s+/);
  const isTooLong = words.length > 140;
  
  const displayText = isTooLong ? words.slice(0, 140).join(' ') + '...' : text;

  return (
    <p 
      className="text-[11px] leading-relaxed" 
      style={{ color: NEO.ink }}
      title={isTooLong ? text : undefined}
    >
      {displayText}
    </p>
  );
};

// Consistent Rounded Icon Button
const RoundedIconButton = ({ onClick, children, variant = 'default', title, className = '' }) => {
  const baseClasses = "w-6 h-6 flex items-center justify-center rounded-full transition-all shadow-sm active:scale-95";
  const variants = {
    default: "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:border-gray-300",
    primary: "bg-black text-white hover:bg-gray-800 border border-transparent",
    danger: "bg-white border border-gray-200 hover:bg-red-50 text-red-500 hover:border-red-200"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      title={title}
      type="button"
      style={{ borderRadius: '9999px' }}
    >
      {children}
    </button>
  );
};

export const CommentInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  onCancel, 
  inputRef,
  avatarUrl,
  isEditing = false
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="bg-white p-2 flex flex-col gap-2 animate-popIn"
      style={{ 
        borderRadius: NEO.radius, 
        boxShadow: NEO.shadow, 
        border: `1px solid ${NEO.border}`,
        width: '100%',
        position: 'relative',
        zIndex: 1000,
        marginTop: isEditing ? 0 : '16px'
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex gap-2 items-start">
         <div className="mt-1">
            <Avatar
              src={
                avatarUrl ||
                "https://api.dicebear.com/7.x/notionists/svg?seed=Me"
              }
              size={24}
            />
         </div>
         <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEditing ? "Edit comment..." : "Add a comment..."}
            className="w-full p-2 text-[11px] outline-none resize-none bg-gray-50"
            style={{ 
              borderRadius: NEO.radiusSm,
              border: '1px solid transparent',
              minHeight: '40px'
            }}
            rows="2"
          />
      </div>
      
      <div className="flex gap-2 justify-end">
        <RoundedIconButton onClick={onCancel} variant="default" title="Cancel">
          <IconClose size={12} />
        </RoundedIconButton>
        <RoundedIconButton onClick={onSubmit} variant="primary" title={isEditing ? "Save" : "Post"}>
          <IconCheck size={12} />
        </RoundedIconButton>
      </div>
    </div>
  );
};

export const ElementCommentList = ({ 
  comments, 
  currentUserId,
  onDelete, 
  onEdit, 
  editingId, 
  editingText, 
  onEditingTextChange, 
  onSaveEdit, 
  onCancelEdit,
  editInputRef 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const reversedComments = [...comments].reverse();
  const visibleComments = expanded ? reversedComments : reversedComments.slice(0, 3);
  const hasMore = comments.length > 3;

  if (comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-4 w-full">
      {visibleComments.map((comment) => {
        if (editingId === comment.id) {
          return (
            <CommentInput 
              key={comment.id}
              value={editingText}
              onChange={onEditingTextChange}
              onSubmit={onSaveEdit}
              onCancel={onCancelEdit}
              inputRef={editInputRef}
              isEditing={true}
            />
          );
        }

        return (
          <div key={comment.id} className="flex gap-2 items-start animate-popIn group/comment">
            <div className="relative group shrink-0 mt-1">
              <Avatar src={comment.avatar} size={24} />
              {/* Hover Tooltip: Name & Time */}
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-black/80 text-white text-[9px] rounded whitespace-nowrap z-50 pointer-events-none"
              >
                <span className="font-bold">{comment.author}</span>
                <span className="mx-1 opacity-50">|</span>
                <span className="opacity-80">
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Just now'}
                </span>
              </div>
            </div>
            
            <div className="relative flex-1 min-w-0">
              <div 
                className="bg-white p-2.5 relative group/bubble"
                style={{ 
                  borderRadius: '2px 12px 12px 12px', // Speech bubble shape
                  boxShadow: NEO.shadowSoft,
                  border: `1px solid ${NEO.border}`,
                }}
              >
                <TruncatedText text={comment.text} />
              </div>

              {/* Action Buttons - Outside the bubble, top aligned */}
              {currentUserId && comment.authorId === currentUserId && (
                <div className="absolute left-full top-0 ml-2 flex gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                  <RoundedIconButton 
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(comment); }}
                    variant="default"
                    title="Edit"
                  >
                    <IconEdit size={12} />
                  </RoundedIconButton>
                  <RoundedIconButton 
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(comment.id); }}
                    variant="danger"
                    title="Delete"
                  >
                    <IconTrash size={12} />
                  </RoundedIconButton>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {hasMore && !expanded && (
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          className="flex items-center justify-center p-1 w-full"
          style={{ color: NEO.inkLight, fontSize: '12px' }}
        >
          ▼
        </button>
      )}
    </div>
  );
};
