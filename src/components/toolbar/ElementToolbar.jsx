/**
 * ElementToolbar Component
 * 元素上方的工具栏
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';
import Avatar from '../ui/Avatar';
import { getAvatarUrl } from '../../utils/constants';
import {
  IconUndo,
  IconRedo,
  IconShuffle,
  IconEdit,
  IconScissors,
  IconChevronUp,
  IconCopy,
  IconLock,
  IconUnlock,
  IconTrash,
  IconRotateCcw,
  IconConnect,
  IconLink,
} from '../../icons';

export const ElementToolbar = ({
  element,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShuffle,
  onEdit,
  onLasso,
  onReset,
  onMoveUpLayer,
  onDuplicate,
  onConnect,
  onAddLink,
  onToggleLock,
  onDelete,
}) => {
  if (!element) return null;
  const creatorEmail = element.creator?.[0]?.email;
  const avatarSeed = creatorEmail ? creatorEmail.split('@')[0] : 'user';
  const creatorAvatar = getAvatarUrl(avatarSeed);

  return (
    <div 
      className="absolute flex items-start gap-2 pointer-events-auto z-[110]" 
      style={{ left: 0, bottom: `calc(100% + 12px)` }} 
      onMouseDown={e => e.stopPropagation()}
    >
      <Avatar src={creatorAvatar} size={40} />
      
      <div
        className="flex items-center gap-0.5 px-1.5 py-1"
        style={{
          background: NEO.surface,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${NEO.border}`,
          boxShadow: NEO.shadow,
          borderRadius: NEO.radiusLg
        }}
      >
        <IconButton
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
        >
          <IconUndo />
        </IconButton>

        <IconButton
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
        >
          <IconRedo />
        </IconButton>

        {element.type === 'text' && (
          <>
            <IconButton 
              onClick={onShuffle} 
              title="Shuffle Style" 
              disabled={element.isLocked}
            >
              <IconShuffle />
            </IconButton>
            <IconButton 
              onClick={onEdit} 
              title="Edit" 
              disabled={element.isLocked}
            >
              <IconEdit />
            </IconButton>
          </>
        )}
        
        {element.type === 'image' && (
          <>
            <IconButton 
              onClick={onLasso} 
              title="Lasso Crop" 
              disabled={element.isLocked}
            >
              <IconScissors />
            </IconButton>
            {/* Restore / Reset Crop Button */}
            <IconButton 
              onClick={onReset} 
              title="Restore Original" 
              disabled={element.isLocked}
            >
              <IconRotateCcw />
            </IconButton>
          </>
        )}
        
        <IconButton onClick={onMoveUpLayer} title="Move Up Layer">
          <IconChevronUp />
        </IconButton>
        
        <IconButton onClick={onDuplicate} title="Duplicate">
          <IconCopy />
        </IconButton>
        
        <IconButton onClick={onConnect} title="Add Connection">
          <IconConnect />
        </IconButton>
        
        <IconButton onClick={onAddLink} title="Add URL">
          <IconLink />
        </IconButton>

        <IconButton 
          onClick={onToggleLock} 
          title={element.isLocked ? "Unlock" : "Lock"} 
          active={element.isLocked}
        >
          {element.isLocked ? <IconLock /> : <IconUnlock />}
        </IconButton>
        
        {!element.isLocked && (
          <IconButton onClick={onDelete} title="Delete" danger>
            <IconTrash />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default ElementToolbar;
