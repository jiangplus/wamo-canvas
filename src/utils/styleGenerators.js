/**
 * Style Generators
 * 样式生成器 - 用于生成随机样式效果
 */
import { NEO } from '../styles/theme';

// 文字字体列表
const TEXT_FONTS = [
  '"Courier New"', 
  'Georgia', 
  '"Times New Roman"', 
  '"Arial Black"', 
  '"Helvetica Neue"', 
  'Impact',
  '"Trebuchet MS"',
  '"Lucida Console"',
  'Verdana',
  '"Palatino Linotype"'
];

// 图片滤镜列表
const IMAGE_FILTERS = [
  'contrast(1.5) brightness(1.1)', 
  'grayscale(1) contrast(1.3)', 
  'sepia(0.5)', 
  'brightness(0.9) contrast(1.5)', 
  'hue-rotate(90deg)'
];

/**
 * 获取随机图片形状 - 核心：手工剪切感形状库
 * @returns {Object} { borderRadius, clipPath }
 */
export const getRandomImageShape = () => {
  const shapes = [
    // 1. 有机液体感 (Blobs): 更加平滑稳定，模拟自然剪裁
    { borderRadius: '55% 45% 45% 55% / 45% 55% 55% 45%', clipPath: 'none' },
    { borderRadius: '48% 52% 52% 48% / 52% 48% 48% 52%', clipPath: 'none' },
    
    // 2. 剪纸感 (Hand-cut Polygons): 4边形，且极度接近矩形 (偏离度 < 2%)
    { borderRadius: '0px', clipPath: 'polygon(1% 1%, 99% 0%, 100% 98%, 0% 99%)' },
    { borderRadius: '0px', clipPath: 'polygon(0% 2%, 98% 1%, 99% 100%, 2% 98%)' },
    { borderRadius: '0px', clipPath: 'polygon(2% 0%, 100% 2%, 97% 99%, 1% 97%)' },
    
    // 3. 极简不规则圆角 (微调)
    { borderRadius: '20px 4px 20px 4px', clipPath: 'none' },
    { borderRadius: '4px 20px 4px 20px', clipPath: 'none' }
  ];
  
  return shapes[Math.floor(Math.random() * shapes.length)];
};

/**
 * 生成杂志风格文字样式 - 黑白配色，手工剪切感
 * @returns {Object} 样式对象
 */
export const generateMagazineStyle = () => {
  // 只有黑底白字或白底黑字
  const isWhiteOnBlack = Math.random() > 0.5;
  const bgColor = isWhiteOnBlack ? '#000000' : '#FFFFFF';
  const textColor = isWhiteOnBlack ? '#FFFFFF' : '#000000';
  
  // 微微不规则的矩形效果
  const skewX = (Math.random() - 0.5) * 2; // -1 到 1 度
  const rotation = (Math.random() - 0.5) * 4; // -2 到 2 度
  
  // 轻微变化的内边距，模拟手工剪切
  const paddingV = 4 + Math.floor(Math.random() * 4); // 4-7px
  const paddingH = 8 + Math.floor(Math.random() * 6); // 8-13px
  
  return {
    fontFamily: TEXT_FONTS[Math.floor(Math.random() * TEXT_FONTS.length)],
    fontSize: 20 + Math.floor(Math.random() * 6), // 20-25px
    fontWeight: Math.random() > 0.5 ? 'bold' : 'normal',
    color: textColor,
    background: bgColor,
    padding: `${paddingV}px ${paddingH}px`,
    borderRadius: '2px', // 纸张感的微弱圆角
    transform: `rotate(${rotation}deg) skewX(${skewX}deg)`,
    boxShadow: NEO.shadowSoft,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: 'fit-content',
    height: 'fit-content',
    wordBreak: 'break-word',
    minWidth: 'auto',
    minHeight: 'auto',
    lineHeight: '1.1', // 紧凑行高
    letterSpacing: '-0.02em', // 微紧字间距
  };
};

/**
 * 获取随机图片滤镜
 * @returns {string} CSS filter 值
 */
export const getRandomTexture = () => {
  return IMAGE_FILTERS[Math.floor(Math.random() * IMAGE_FILTERS.length)];
};

/**
 * 生成随机角度（默认水平 = 0）
 * @returns {number} 角度
 */
export const generateRandomAngle = () => 0;

/**
 * 生成随机小角度（用于抽屉预览）
 * @param {number} range - 角度范围
 * @returns {number} 角度
 */
export const generateSmallRandomAngle = (range = 8) => {
  return (Math.random() - 0.5) * range;
};
