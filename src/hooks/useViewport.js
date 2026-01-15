/**
 * useViewport Hook
 * 视口状态管理 - 处理平移、缩放等视口操作
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { CANVAS_CONFIG } from '../utils/constants';
import { calculateElementsCenter } from '../utils/coordinates';

export const useViewport = (viewportRef, elements) => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false);

  // 缩放
  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(CANVAS_CONFIG.maxScale, prev.scale * CANVAS_CONFIG.zoomFactor)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(CANVAS_CONFIG.minScale, prev.scale / CANVAS_CONFIG.zoomFactor)
    }));
  }, []);

  // 居中到元素
  const snapToCenter = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || elements.length === 0) {
      setViewport({ x: 0, y: 0, scale: 1 });
      return;
    }
    
    const center = calculateElementsCenter(elements);
    
    const targetViewport = {
      x: (rect.width / 2) - center.x,
      y: (rect.height / 2) - center.y,
      scale: 1
    };
    
    setIsAnimating(true);
    setViewport(targetViewport);
    setTimeout(() => setIsAnimating(false), 400);
  }, [elements, viewportRef]);

  // 初始化居中
  useEffect(() => {
    const timer = setTimeout(() => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        setViewport({
          x: rect.width / 2 - 110,
          y: rect.height / 2 - 150,
          scale: 1
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [viewportRef]);

  // 滚轮缩放
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldBefore = { 
          x: mouseX / viewport.scale - viewport.x, 
          y: mouseY / viewport.scale - viewport.y 
        };
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(
          CANVAS_CONFIG.minScale, 
          Math.min(CANVAS_CONFIG.maxScale, viewport.scale * delta)
        );
        setViewport({
          x: mouseX / newScale - worldBefore.x,
          y: mouseY / newScale - worldBefore.y,
          scale: newScale
        });
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [viewport, viewportRef]);

  return {
    viewport,
    setViewport,
    isAnimating,
    zoomIn,
    zoomOut,
    snapToCenter,
  };
};

export default useViewport;
