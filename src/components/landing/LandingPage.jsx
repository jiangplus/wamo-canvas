import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// --- 1. Interaction Variants ---
const subtleInteraction = {
  hover: { scale: 1.02, y: -2, transition: { duration: 0.2, ease: "easeOut" } },
  tap: { scale: 0.98, y: 0, transition: { duration: 0.1 } }
};

// --- Color Palettes ---
const ALL_COLORS = ['#F35476', '#FFDD00', '#FF6606', '#64C6FD', '#BFFF00', '#2200FF'];
const STAR_COLORS = ['#FD7960', '#6238FF', '#BACF8B'];

// --- 2. Helper Components for Shapes (Updated for Drag) ---

// Helper: Sparse Position Generator (Avoid center 30%-70%)
const getSparsePos = () => {
  let pos = { top: 0, left: 0 };
  while (true) {
    pos.top = Math.random() * 90;
    pos.left = Math.random() * 90;
    // 如果位置在中心区域则重试，确保分布在四周
    const isCenterY = pos.top > 25 && pos.top < 75;
    const isCenterX = pos.left > 25 && pos.left < 75;
    if (!(isCenterY && isCenterX)) break;
  }
  return pos;
};

// Draggable Circle
const DraggableCircle = ({ size, color, opacity = 1, zIndex = 0, style }) => (
  <motion.div
    drag
    dragMomentum={false}
    style={{
      width: typeof size === 'number' ? size : size, // Allow string size (e.g. vw)
      height: typeof size === 'number' ? size : size,
      backgroundColor: color,
      opacity: opacity,
      borderRadius: '50%',
      boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4)',
      zIndex: zIndex,
      cursor: 'grab',
      pointerEvents: 'auto',
      ...style
    }}
  />
);

// --- 3. Asset Configuration (Restored & Updated Draggability) ---
// Using vw for top positions to maintain relative vertical layout regardless of aspect ratio
const stickers = [
  // Text String: top ~17.4vw
  { id: 'text-string', src: '/assets/text on a string.svg', alt: 'Text String', className: 'w-[72%]', initial: { top: '12vw', left: '9vw', rotate: -3 }, zIndex: 5, drag: false }, 
  
  // Flyer: top ~ -3vw
  { id: 'flyer', src: '/assets/flyer.png', alt: 'Flyer', className: 'w-[21.5%] brightness-95 sepia-[0.3] contrast-[0.9]', initial: { top: '-3vw', left: '70%', rotate: 100 }, zIndex: 10, drag: true },
  
  // Matisse: top 0vw
  { id: 'matisse', src: '/assets/matisse.png', alt: 'Dancers', className: 'w-[25%]', initial: { top: '0vw', left: '35%', rotate: 0 }, zIndex: 15, drag: true },
  
  // Star.svg: top 3vw
  { id: 'star-svg', src: '/assets/Star.svg', alt: 'Star', className: 'w-[8%]', initial: { top: '3vw', left: '58%', rotate: 15 }, zIndex: 16, drag: true },
  
  // Cat: top -1.2vw (preserved relative to string)
  { id: 'cat', src: '/assets/cat_astronaut.png', alt: 'Cat', className: 'w-[28%]', initial: { top: '-1.2vw', left: '-1%', rotate: 120 }, zIndex: 20, drag: true },
  
  // Phone: top 31.8vw (preserved relative to string)
  { id: 'phone', src: '/assets/phone.png', alt: 'Phone', className: 'w-[17%]', initial: { top: '27vw', left: '79vw', rotate: 3 }, zIndex: 31, drag: true },
  
  // Hand Right: top 1.8vw
  { id: 'hand-right', src: '/assets/right_hand.png', alt: 'Right Hand', className: 'w-[34%]', initial: { top: '1.8vw', left: '68%', rotate: 9.8 }, zIndex: 30, drag: "y" },
  
  // Hand Left: top 28.2vw
  { id: 'hand-left', src: '/assets/left_hand.png', alt: 'Left Hand', className: 'w-[35%]', initial: { top: '28.2vw', left: '-2%', rotate: 0 }, zIndex: 35, drag: "y" },
];

// Win95 Popup (Draggable + Scaled)
const Win95Popup = ({ onOkClick }) => (
  <motion.div
    drag
    dragMomentum={false}
    // Using em units for internal sizing, driven by fontSize (vw)
    className="absolute z-40 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black shadow-[1px_1px_0px_0px_#000]"
    style={{ 
      top: '40vw', 
      left: '40vw',
      // Responsive font size base with minimum limit but no maximum limit for bigger screens
      fontSize: 'max(10px, 0.8vw)', 
      width: '26em',
      padding: '0.2em'
    }}
  >
    <div className="flex justify-between items-center bg-[#000080] px-[0.3em] py-[0.15em] cursor-grab active:cursor-grabbing">
      <span className="text-white font-handjet-medium tracking-wide select-none ml-[0.2em]" style={{ fontSize: '1.1em' }}>Community detected</span>
      <div className="flex gap-[0.15em]">
        {['_', '□', 'X'].map((icon, i) => (
          <div key={i} className="bg-[#c0c0c0] flex items-center justify-center font-black border-t border-l border-white border-r border-b border-black shadow-[1px_1px_0px_0px_#000]" 
               style={{ width: '1.2em', height: '1em', fontSize: '0.8em' }}>{icon}</div>
        ))}
      </div>
    </div>
    <div className="flex items-center font-handjet-regular text-black tracking-wide leading-tight" style={{ padding: '2em', fontSize: '1.5em' }}>
      <div className="ml-[0.1em]">Attention! You are about to connect<br/>deeply with the world.</div>
    </div>
    <div className="flex justify-center pb-[1em]" style={{ gap: '1.5em' }}>
      {['Cancel', 'OK'].map((btnText) => (
        <button 
          key={btnText}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={btnText === 'OK' ? onOkClick : undefined}
          className="bg-[#c0c0c0] font-handjet-regular border-t border-l border-white border-r-2 border-b-2 border-black shadow-[1px_1px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] focus:outline-none"
          style={{ minWidth: '5em', padding: '0.2em 1em', fontSize: '1.2em' }}
        >
          {btnText}
        </button>
      ))}
    </div>
  </motion.div>
);

const KeyCluster = ({ onClick }) => (
  // top: 50% -> 30vw
  <div className="absolute z-50 flex items-center justify-center pointer-events-auto" style={{ top: '27vw', left: '62%', transform: 'translate(-50%, 0)' }}>
    {["/assets/key right arrow.png", "/assets/create key.png", "/assets/together key.png"].map((src, index) => (
      <motion.img 
        key={index} 
        src={src} 
        onClick={onClick} 
        variants={subtleInteraction} 
        whileHover="hover" 
        whileTap="tap" 
        className={`object-contain cursor-pointer select-none ${index > 0 ? '-ml-[7.5vw]' : ''}`} 
        style={{ zIndex: index, position: 'relative', width: '15vw', height: '15vw' }} 
      />
    ))}
  </div>
);

// Text Words (Draggable)
const DraggableWord = ({ text, color, rotate, fontClass, fontSize, zIndex = 50 }) => (
  <motion.div
    drag
    dragMomentum={false}
    variants={subtleInteraction}
    whileHover="hover"
    whileTap="tap"
    className={`inline-block px-[0.1em] py-0 m-[1px] text-white cursor-grab leading-none ${fontClass}`}
    style={{ backgroundColor: color, zIndex, clipPath: 'polygon(2% 0%, 100% 2%, 98% 100%, 0% 95%)', rotate, pointerEvents: 'auto', fontSize }}
  >
    {text}
  </motion.div>
);

const RansomNote = () => (
  // top: 37% -> 22.2vw
  // Added responsive padding to ensure line breaks happen as intended or scale down enough
  <div className="absolute z-20 flex flex-col items-center justify-center w-full pointer-events-none" style={{ top: '20vw', left: '0vw' }}>
    <div className="flex flex-col items-center justify-center gap-[0.4vw] w-full max-w-[90vw] select-none pointer-events-none">
      
      {/* Line 1 */}
      <div className="flex flex-wrap items-center justify-center gap-[0.4vw]">
        <DraggableWord text="the" color="#B0D85A" rotate={2} fontClass="font-arbotek" fontSize="2.5vw" />
        <DraggableWord text="UNIVERSE" color="#1A00AE" rotate={-1} fontClass="font-handjet font-bold" fontSize="4.5vw" />
        <span className="text-gray-800 font-arbotek italic ml-[0.2vw] leading-none pointer-events-auto" style={{ fontSize: '2.5vw' }}>is just one big</span>
      </div>

      {/* Line 2 */}
      <div className="flex flex-wrap items-center justify-center gap-[0.4vw]">
        <DraggableWord text="COLLAGE" color="#EC5B00" rotate={3} fontClass="font-bygonest" fontSize="3.5vw" />
        <span className="text-gray-600 font-arbotek mx-[0.2vw] leading-none pointer-events-auto" style={{ fontSize: '2.5vw' }}>on an</span>
        <DraggableWord text="infinite canvas" color="#865792" rotate={-2} fontClass="font-krifon italic" fontSize="3.5vw" />
      </div>

    </div>
  </div>
);

// --- 7. Main Page Component ---
export default function LandingPage({ onLoginClick }) {
  // 生成随机装饰数据 (Circles only, no duplicated colors)
  const decorations = useMemo(() => {
    // Shuffle colors to ensure no duplicates for the first 6
    const shuffledColors = [...ALL_COLORS].sort(() => Math.random() - 0.5);
    
    const smallCircles = Array.from({ length: 6 }).map((_, i) => ({
      id: `sc-${i}`,
      // 5% smaller: 36 * 0.95 = 34.2, 55 * 0.95 = 52.25
      size: Math.random() * (52.25 - 34.2) + 34.2,
      color: shuffledColors[i],
      pos: getSparsePos()
    }));

    return { smallCircles };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#F3F3F3] overflow-hidden font-sans selection:bg-pink-300">
      <style>{`
        @font-face { font-family: 'Arbotek-Light'; src: url('/assets/fonts/Arbotek-Light.otf') format('opentype'); }
        @font-face { font-family: 'Handjet-Light'; src: url('/assets/fonts/Handjet-Light.ttf') format('truetype'); }
        @font-face { font-family: 'Bygonest-Rustic-Regular'; src: url('/assets/fonts/Bygonest Rustic Regular.otf') format('opentype'); }
        @font-face { font-family: 'Krifon-Regular'; src: url('/assets/fonts/krifon-regular.otf') format('opentype'); }
        @font-face { font-family: 'Handjet-Medium'; src: url('/assets/fonts/Handjet-Medium.ttf') format('truetype'); }
        @font-face { font-family: 'Handjet-Regular'; src: url('/assets/fonts/Handjet-Regular.ttf') format('truetype'); }
        .font-arbotek { font-family: 'Arbotek-Light', serif; }
        .font-handjet { font-family: 'Handjet-Light', sans-serif; }
        .font-bygonest { font-family: 'Bygonest-Rustic-Regular', cursive; }
        .font-krifon { font-family: 'Krifon-Regular', serif; }
        .font-handjet-medium { font-family: 'Handjet-Medium', sans-serif; }
        .font-handjet-regular { font-family: 'Handjet-Regular', sans-serif; }
      `}</style>

      {/* --- LAYER 0: Lowest Layer (Big Circles - Draggable now) --- */}
      <div className="absolute inset-0 z-0">
        {/* Cat Astronaut Circle */}
        <DraggableCircle size="20vw" color="#F35476" opacity={0.1} style={{ position: 'absolute', top: '3%', left: '-3%', minWidth: '200px', minHeight: '200px' }} />
        {/* Window Circle */}
        <DraggableCircle size="35vw" color="#C7D3FF" opacity={0.9} style={{ position: 'absolute', top: '65%', left: '15%', minWidth: '220px', minHeight: '220px' }} />
        {/* Bottom Circle */}
        <DraggableCircle size="45vw" color="#2200FF" opacity={0.1} style={{ position: 'absolute', bottom: '-5%', left: '70%', minWidth: '200px', minHeight: '200px' }} />
      </div>

      {/* --- Stickers (Standard Layers) --- */}
      {stickers.map((item) => (
        <motion.div
          key={item.id}
          // 关键修改：左右手限制只能 Y 轴拖动
          drag={item.drag === "y" ? "y" : item.drag}
          dragMomentum={false}
          // 关键修改：左右手限制 Left Right Constraints，确保不乱跑
          dragConstraints={item.drag === "y" ? { left: 0, right: 0 } : undefined}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.95 }}
          className={`absolute ${item.className}`}
          style={{ top: item.initial.top, left: item.initial.left, zIndex: item.zIndex }}
          initial={{ rotate: item.initial.rotate, opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img src={item.src} alt={item.alt} className="w-full h-full object-contain select-none pointer-events-none" />
        </motion.div>
      ))}

      <Win95Popup onOkClick={onLoginClick} />
      <RansomNote />
      <KeyCluster onClick={onLoginClick} />

      {/* --- LAYER TOP: Small Circles (Draggable) --- */}
      <div className="absolute inset-0 z-[60] pointer-events-none">
        {/* Removed the blocking pointer-events-auto wrapper. The circles themselves have pointer-events: auto */}
        {decorations.smallCircles.map(c => (
          <DraggableCircle key={c.id} size={c.size} color={c.color} opacity={1} style={{ position: 'absolute', top: `${c.pos.top}%`, left: `${c.pos.left}%` }} />
        ))}
      </div>

      {/* --- Noise Overlay (Top of all layers) --- */}
      <div 
        className="fixed inset-0 z-[9999] pointer-events-none opacity-40 mix-blend-overlay"
        style={{ backgroundImage: 'url(/assets/noise.svg)' }}
      />
    </div>
  );
}
