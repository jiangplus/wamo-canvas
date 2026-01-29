/**
 * ImageDrawer Component
 * 图片抽屉 - 管理和选择图片
 */
import React from 'react';
import { NEO } from '../../styles/theme';
import Drawer from './Drawer';
import { IconUpload } from '../../icons';

const TabButton = ({ active, onClick, children }) => (
  <button 
    onClick={onClick} 
    className="flex-1 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-all"
    style={{ 
      background: active ? 'white' : 'transparent', 
      color: active ? NEO.ink : NEO.inkLight,
      borderRadius: NEO.radiusSm,
      boxShadow: active ? NEO.shadowSoft : 'none',
      border: 'none',
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

const ImageCard = ({ image, angle, onDragStart }) => (
  <div 
    onMouseDown={onDragStart}
    className="aspect-[3/4] overflow-hidden cursor-grab active:scale-95 transition-all"
    style={{ 
      boxShadow: NEO.shadow,
      transform: `rotate(${angle || 0}deg)`,
      borderRadius: NEO.radius,
      padding: '4px',
      background: 'white'
    }}
  >
    <img 
      src={image.url} 
      className="w-full h-full object-cover pointer-events-none" 
      style={{ borderRadius: NEO.radiusSm }} 
      alt="Gallery"
    />
  </div>
);

const UploadCard = ({ onClick }) => (
  <div 
    onClick={onClick} 
    className="aspect-[3/4] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 bg-white" 
    style={{ borderColor: NEO.accent, color: NEO.inkLight, borderRadius: NEO.radius }}
  >
    <IconUpload />
    <span className="mt-2 text-[8px] font-semibold uppercase">upload images</span>
  </div>
);

export const ImageDrawer = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  picturePool,
  drawerImageAngles,
  onUploadClick,
  onImageDragStart,
  fileInputRef,
  onFileUpload,
}) => {
  const headerContent = (
    <div
      className="flex mx-6 mt-4 p-1"
      style={{ background: NEO.accent, borderRadius: NEO.radiusSm }}
    >
      <TabButton
        active={activeTab === 'public'}
        onClick={() => onTabChange('public')}
      >
        Public
      </TabButton>
      <TabButton
        active={activeTab === 'readonly'}
        onClick={() => onTabChange('readonly')}
      >
        Readonly
      </TabButton>
    </div>
  );

  return (
    <Drawer 
      isOpen={isOpen} 
      title="image" 
      onClose={onClose}
      headerContent={headerContent}
    >
      <div className="grid grid-cols-2 gap-4">
        <UploadCard onClick={onUploadClick} />
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={onFileUpload} 
          className="hidden" 
        />
        {picturePool[activeTab].map(img => (
          <ImageCard
            key={img.id}
            image={img}
            angle={drawerImageAngles[img.id]}
            onDragStart={(e) => {
              e.stopPropagation();
              onImageDragStart(img, e.clientX, e.clientY);
            }}
          />
        ))}
      </div>
    </Drawer>
  );
};

export default ImageDrawer;
