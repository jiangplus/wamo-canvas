/**
 * StickerDrawer Component
 * 贴纸抽屉 - 选择表情贴纸
 */
import React from 'react';
import Drawer from './Drawer';
import { STICKER_LIST } from '../../utils/constants';

const StickerItem = ({ sticker, angle, onDragStart }) => (
  <div 
    onMouseDown={(e) => {
      e.stopPropagation();
      onDragStart(sticker, e.clientX, e.clientY);
    }}
    className="aspect-square flex items-center justify-center text-6xl cursor-grab transition-all hover:scale-110"
    style={{ 
      background: 'transparent',
      transform: `rotate(${angle || 0}deg)`,
      filter: 'drop-shadow(0 0 0 white) drop-shadow(3px 3px 0px white) drop-shadow(-3px -3px 0px white) drop-shadow(3px -3px 0px white) drop-shadow(-3px 3px 0px white) drop-shadow(0 3px 0px white) drop-shadow(0 -3px 0px white) drop-shadow(3px 0 0px white) drop-shadow(-3px 0 0px white)'
    }}
  >
    {sticker}
  </div>
);

export const StickerDrawer = ({
  isOpen,
  onClose,
  drawerStickerAngles,
  onStickerDragStart,
}) => {
  return (
    <Drawer isOpen={isOpen} title="sticker" onClose={onClose}>
      <div className="grid grid-cols-2 gap-6 p-2">
        {STICKER_LIST.map(sticker => (
          <StickerItem
            key={sticker}
            sticker={sticker}
            angle={drawerStickerAngles[sticker]}
            onDragStart={onStickerDragStart}
          />
        ))}
      </div>
    </Drawer>
  );
};

export default StickerDrawer;
