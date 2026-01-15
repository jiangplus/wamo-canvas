/**
 * Coordinate Utilities
 * 坐标工具 - 处理屏幕坐标和世界坐标的转换
 */

/**
 * 将屏幕坐标转换为世界坐标
 * @param {number} screenX - 屏幕 X 坐标
 * @param {number} screenY - 屏幕 Y 坐标
 * @param {Object} viewport - 视口状态 { x, y, scale }
 * @param {DOMRect} containerRect - 容器的 getBoundingClientRect()
 * @returns {Object} { x, y } 世界坐标
 */
export const screenToWorld = (screenX, screenY, viewport, containerRect) => {
  if (!containerRect) return { x: screenX, y: screenY };
  return {
    x: (screenX - containerRect.left) / viewport.scale - viewport.x,
    y: (screenY - containerRect.top) / viewport.scale - viewport.y
  };
};

/**
 * 将世界坐标转换为屏幕坐标
 * @param {number} worldX - 世界 X 坐标
 * @param {number} worldY - 世界 Y 坐标
 * @param {Object} viewport - 视口状态 { x, y, scale }
 * @param {DOMRect} containerRect - 容器的 getBoundingClientRect()
 * @returns {Object} { x, y } 屏幕坐标
 */
export const worldToScreen = (worldX, worldY, viewport, containerRect) => {
  if (!containerRect) return { x: worldX, y: worldY };
  return {
    x: (worldX + viewport.x) * viewport.scale + containerRect.left,
    y: (worldY + viewport.y) * viewport.scale + containerRect.top
  };
};

/**
 * 计算元素的边界
 * @param {Array} elements - 元素数组
 * @param {number} padding - 边界外扩距离
 * @returns {Object} { minX, maxX, minY, maxY }
 */
export const calculateElementsBounds = (elements, padding = 200) => {
  if (elements.length === 0) {
    return { minX: -500, maxX: 500, minY: -500, maxY: 500 };
  }
  
  return {
    minX: Math.min(...elements.map(el => el.x)) - padding,
    maxX: Math.max(...elements.map(el => el.x + (el.width || 220))) + padding,
    minY: Math.min(...elements.map(el => el.y)) - padding,
    maxY: Math.max(...elements.map(el => el.y + 300)) + padding,
  };
};

/**
 * 计算元素中心点
 * @param {Array} elements - 元素数组
 * @returns {Object} { x, y } 中心坐标
 */
export const calculateElementsCenter = (elements) => {
  if (elements.length === 0) return { x: 0, y: 0 };
  
  const centerX = elements.reduce((sum, el) => sum + el.x + (el.width || 220) / 2, 0) / elements.length;
  const centerY = elements.reduce((sum, el) => sum + el.y + 150, 0) / elements.length;
  
  return { x: centerX, y: centerY };
};

/**
 * 计算两点之间的距离
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns {number} 距离
 */
export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * 计算两点之间的角度（度数）
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns {number} 角度（度）
 */
export const angleBetweenPoints = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};
