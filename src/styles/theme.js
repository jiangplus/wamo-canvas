/**
 * Design System Theme
 * 设计系统主题 - 统一管理所有设计 token
 */

export const theme = {
  colors: {
    bg: '#FAF9F6',
    surface: 'rgba(255, 255, 255, 0.7)',
    ink: '#3A3A36',
    inkLight: '#A8A8A2',
    accent: '#E6E2D3',
    riceYellow: '#F0EDE0', // 更柔和的米黄色用于轮廓
    border: 'rgba(230, 226, 211, 0.4)',
    frosted: 'rgba(255, 255, 255, 0.75)',
    danger: '#F87171',
    highlight: '#60a5fa',
  },
  
  shadows: {
    soft: '0 2px 12px rgba(0, 0, 0, 0.03)',
    default: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 6px rgba(0, 0, 0, 0.02)',
    hover: '0 8px 30px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.03)',
  },
  
  radius: {
    sm: '12px',
    md: '16px',
    lg: '24px',
    full: '50%',
  },
  
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    sizes: {
      xs: '9px',
      sm: '10px',
      base: '11px',
      md: '12px',
      lg: '14px',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  zIndex: {
    canvas: 10,
    elements: 20,
    selectedElement: 100,
    drawer: 130,
    toolbar: 140,
    header: 150,
    contextMenu: 200,
    dragPreview: 1000,
  },
  
  animation: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.4s',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
};

// 向后兼容的 NEO 对象
export const NEO = {
  bg: theme.colors.bg,
  surface: theme.colors.surface,
  ink: theme.colors.ink,
  inkLight: theme.colors.inkLight,
  accent: theme.colors.accent,
  border: theme.colors.border,
  frosted: theme.colors.frosted,
  shadow: theme.shadows.default,
  shadowHover: theme.shadows.hover,
  shadowSoft: theme.shadows.soft,
  radius: theme.radius.md,
  radiusLg: theme.radius.lg,
  radiusSm: theme.radius.sm,
};

export default theme;
