/**
 * Constants
 * 常量定义 - 应用中使用的各种常量
 */

// 默认元素尺寸
export const DEFAULT_ELEMENT_WIDTH = 220;
export const DEFAULT_ELEMENT_HEIGHT = 140;

// 画布配置
export const CANVAS_CONFIG = {
  minScale: 0.2,
  maxScale: 3,
  zoomFactor: 1.2,
  gridSize: 30,
  edgePanThreshold: 100,
  edgePanSpeed: 10,
};

// 小地图配置
export const MINIMAP_CONFIG = {
  width: 160,
  height: 100,
  padding: 200,
};

// 历史记录配置
export const HISTORY_CONFIG = {
  maxLength: 30,
};

// Text configuration (word limit)
export const TEXT_CONFIG = {
  maxWords: 140,
  warningThreshold: 130,
};

// 连接线配置
export const CONNECTION_CONFIG = {
  maxLabelLength: 50,
  labelMinWidth: 60,
  labelMaxWidth: 180,
};

// 贴纸列表
export const STICKER_LIST = ['✨', '☁️', '🔥', '🦋', '🍭', '🎈', '💡', '🚀', '🌈'];

// 工具列表
export const TOOL_LIST = [
  { id: 'image', label: 'Image' },
  { id: 'text', label: 'Text' },
  { id: 'sticker', label: 'Sticker' },
  { id: 'connect', label: 'Connect' },
];

// 默认头像 URL 生成
export const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;

// ID 生成器
export const generateId = (prefix = 'el') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
