/**
 * Style Generators
 * Generate random style effects for canvas elements
 */
import { NEO } from '../styles/theme';

// Text font list
const TEXT_FONTS = [
  'Arbotek',
  'AvenirNextCyr',
  'Bygonest Rustic',
  'Cormorant',
  'DIN Next Slab Pro',
  'Duckie',
  'Lost Leonenst',
  'Lost Sagas',
  'Ohno Blazeface',
  'Perfectly Nostalgic',
  'FormaDJRBanner',
  'FuturaPT',
  'FuturaPTCond',
  'Handjet',
  'krifon',
  'Obviously',
  'ObviouslyNarrow',
  'OhnoCasual',
  'PortherasTest',
  'SabonNextLTPro',
  'SF Pro Display',
  'TT Alientz Trial Grotesque',
  'TT Alientz Trial Serif',
  'TT Alientz Trial Var',
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

// Image filter list
const IMAGE_FILTERS = [
  'contrast(1.5) brightness(1.1)', 
  'grayscale(1) contrast(1.3)', 
  'sepia(0.5)', 
  'brightness(0.9) contrast(1.5)', 
  'hue-rotate(90deg)'
];

/**
 * Get random image shape - hand-cut feel shape library
 * @returns {Object} { borderRadius, clipPath }
 */
export const getRandomImageShape = () => {
  const shapes = [
    // 1. Organic blob shapes - smooth and natural
    { borderRadius: '55% 45% 45% 55% / 45% 55% 55% 45%', clipPath: 'none' },
    { borderRadius: '48% 52% 52% 48% / 52% 48% 48% 52%', clipPath: 'none' },
    
    // 2. Hand-cut polygons - nearly rectangular with slight irregularity
    { borderRadius: '0px', clipPath: 'polygon(1% 1%, 99% 0%, 100% 98%, 0% 99%)' },
    { borderRadius: '0px', clipPath: 'polygon(0% 2%, 98% 1%, 99% 100%, 2% 98%)' },
    { borderRadius: '0px', clipPath: 'polygon(2% 0%, 100% 2%, 97% 99%, 1% 97%)' },
    
    // 3. Minimal irregular corners
    { borderRadius: '20px 4px 20px 4px', clipPath: 'none' },
    { borderRadius: '4px 20px 4px 20px', clipPath: 'none' }
  ];
  
  return shapes[Math.floor(Math.random() * shapes.length)];
};

// Background colors for white text (40% black, 60% from color palette)
const WHITE_TEXT_BACKGROUNDS = [
  '#000000', '#000000', '#000000', '#000000', // 40% black (4 out of 10)
  '#0E21A0', '#473472', '#3E5F44', '#4B5945', '#F96E2A', '#89AC46' // 60% colors
];

// Background colors for black text (40% white, 60% from color palette)
const BLACK_TEXT_BACKGROUNDS = [
  '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', // 40% white (4 out of 10)
  '#F2F2F2', '#F5ECE0', '#FFD93D', '#89AC46', '#F2F2F2', '#F5ECE0' // 60% colors
];

/**
 * Calculate optimal width to achieve aspect ratio between 3:4 (0.75) and 4:3 (1.33)
 * @param {string} text - The text content
 * @param {number} fontSize - Font size in pixels
 * @param {number} paddingV - Vertical padding in pixels
 * @param {number} paddingH - Horizontal padding in pixels
 * @param {string} fontWeight - 'bold' or 'normal'
 * @returns {number} Optimal width in pixels
 */
const calculateOptimalWidth = (text, fontSize, paddingV, paddingH, fontWeight) => {
  // Ensure we have some text to work with
  const actualText = text && text.trim() ? text : 'Start typing...';
  const textLength = actualText.length;
  
  // Estimate average character width based on font size and weight
  // Bold text is typically ~10% wider
  const baseCharWidth = fontSize * 0.52;
  const avgCharWidth = fontWeight === 'bold' ? baseCharWidth * 1.1 : baseCharWidth;
  
  const lineHeight = fontSize * 1.2;
  const totalTextWidth = textLength * avgCharWidth;
  
  // For very short text (< 15 chars), make a horizontal strip
  if (textLength < 15) {
    const stripWidth = Math.max(120, totalTextWidth + (paddingH * 2) + 20);
    return Math.min(stripWidth, 300);
  }
  
  // Try different widths and find one that gives aspect ratio between 0.75 and 1.33
  const minWidth = 130;
  const maxWidth = 320;
  const step = 10;
  
  let bestWidth = 200;
  let bestScore = Infinity;
  
  for (let testWidth = minWidth; testWidth <= maxWidth; testWidth += step) {
    const contentWidth = testWidth - (paddingH * 2);
    if (contentWidth <= 0) continue;
    
    const numLines = Math.ceil(totalTextWidth / contentWidth);
    const estimatedHeight = (numLines * lineHeight) + (paddingV * 2);
    const ratio = testWidth / estimatedHeight;
    
    // Target ratio between 0.75 (3:4) and 1.33 (4:3)
    // Prefer ratios closer to 1.0 (square-ish)
    if (ratio >= 0.75 && ratio <= 1.33) {
      const distanceFromIdeal = Math.abs(ratio - 1.0);
      if (distanceFromIdeal < bestScore) {
        bestWidth = testWidth;
        bestScore = distanceFromIdeal;
      }
    }
  }
  
  // If no width achieved good ratio, find the closest one
  if (bestScore === Infinity) {
    for (let testWidth = minWidth; testWidth <= maxWidth; testWidth += step) {
      const contentWidth = testWidth - (paddingH * 2);
      if (contentWidth <= 0) continue;
      
      const numLines = Math.ceil(totalTextWidth / contentWidth);
      const estimatedHeight = (numLines * lineHeight) + (paddingV * 2);
      const ratio = testWidth / estimatedHeight;
      
      // Find width that gets closest to acceptable range
      const distanceToRange = ratio < 0.75 
        ? (0.75 - ratio) 
        : ratio > 1.33 
          ? (ratio - 1.33) 
          : 0;
      
      if (distanceToRange < bestScore) {
        bestWidth = testWidth;
        bestScore = distanceToRange;
      }
    }
  }
  
  // Add slight randomness (±5%) to avoid all cards looking identical
  const randomFactor = 0.95 + Math.random() * 0.1;
  return Math.round(bestWidth * randomFactor);
};

/**
 * Generate magazine-style text - clean rectangle with optimal dimensions
 * The width is calculated to achieve aspect ratio between 3:4 and 4:3
 * Once generated, the shape is locked in like a picture
 * @param {string} text - The text content (used to calculate optimal dimensions)
 * @returns {Object} Style object
 */
export const generateMagazineStyle = (text = '') => {
  // Decide text color first (50/50 white or black)
  const isWhiteText = Math.random() > 0.5;
  
  // Pick background based on text color
  const bgPalette = isWhiteText ? WHITE_TEXT_BACKGROUNDS : BLACK_TEXT_BACKGROUNDS;
  const bgColor = bgPalette[Math.floor(Math.random() * bgPalette.length)];
  const textColor = isWhiteText ? '#FFFFFF' : '#000000';
  
  // Slight rotation for hand-cut feel
  const rotation = (Math.random() - 0.5) * 4; // -2 to 2 degrees
  
  // Small padding for tight magazine cut-out feel
  const paddingV = 4 + Math.floor(Math.random() * 2); // 4-5px
  const paddingH = 6 + Math.floor(Math.random() * 3); // 6-8px
  
  // Font size
  const fontSize = 18 + Math.floor(Math.random() * 8); // 18-25px
  
  // Font weight
  const fontWeight = Math.random() > 0.5 ? 'bold' : 'normal';
  
  // Calculate optimal width based on text to achieve good aspect ratio
  const optimalWidth = calculateOptimalWidth(text, fontSize, paddingV, paddingH, fontWeight);
  
  return {
    fontFamily: TEXT_FONTS[Math.floor(Math.random() * TEXT_FONTS.length)],
    fontSize,
    fontWeight,
    color: textColor,
    background: bgColor,
    padding: `${paddingV}px ${paddingH}px`,
    borderRadius: '0', // Perfect rectangle - no rounded corners
    transform: `rotate(${rotation}deg)`,
    boxShadow: NEO.shadowSoft,
    border: 'none',
    display: 'block',
    textAlign: 'left',
    // Calculated width for optimal aspect ratio - locked in once generated
    width: `${optimalWidth}px`,
    wordBreak: 'break-word',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
  };
};

/**
 * Get random image filter
 * @returns {string} CSS filter value
 */
export const getRandomTexture = () => {
  return IMAGE_FILTERS[Math.floor(Math.random() * IMAGE_FILTERS.length)];
};

/**
 * Generate random angle (default horizontal = 0)
 * @returns {number} Angle
 */
export const generateRandomAngle = () => 0;

/**
 * Generate small random angle (for drawer preview)
 * @param {number} range - Angle range
 * @returns {number} Angle
 */
export const generateSmallRandomAngle = (range = 8) => {
  return (Math.random() - 0.5) * range;
};
