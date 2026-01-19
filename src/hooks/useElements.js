/**
 * useElements Hook
 * 元素状态管理 - 处理元素的增删改查
 */
import { useState, useCallback, useMemo } from 'react';
import { generateId, DEFAULT_ELEMENT_WIDTH } from '../utils/constants';
import { generateMagazineStyle, getRandomImageShape } from '../utils/styleGenerators';

// 初始元素
const createInitialElements = () => [{
  id: '1',
  type: 'image',
  content: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
  x: 0,
  y: 0,
  width: DEFAULT_ELEMENT_WIDTH,
  height: null,
  rotation: 0,
  creatorId: 'user-ruoz',
  creatorEmail: 'ruoz@example.com',
  reactions: { '❤️': ['Ruoz', 'Gong'] },
  isLocked: false,
  texture: 'none',
  shape: getRandomImageShape(),
  scale: 1,
  zIndex: 1
}];

export const useElements = (saveHistory) => {
  const [elements, setElements] = useState(createInitialElements);
  const [selectedId, setSelectedId] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

  // 按 zIndex 排序的元素
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [elements]);

  // 获取选中的元素
  const selectedElement = useMemo(() => {
    return elements.find(el => el.id === selectedId);
  }, [elements, selectedId]);

  // 更新元素
  const updateElement = useCallback((id, updates, shouldSave = true) => {
    if (shouldSave) saveHistory(elements);
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, [elements, saveHistory]);

  // 添加元素
  const addElement = useCallback((elementData) => {
    saveHistory(elements);
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    
    const newElement = {
      id: generateId(),
      creatorId: 'local-user',
      creatorEmail: 'me@example.com',
      reactions: {},
      isLocked: false,
      texture: 'none',
      scale: 1,
      zIndex: newZIndex,
      ...elementData,
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
    return newElement;
  }, [elements, maxZIndex, saveHistory]);

  // 复制元素
  const duplicateElement = useCallback((el) => {
    saveHistory(elements);
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    
    const newElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: generateId('dp'),
      x: el.x + 40,
      y: el.y + 40,
      reactions: {},
      zIndex: newZIndex
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, [elements, maxZIndex, saveHistory]);

  // 删除元素
  const deleteElement = useCallback((el) => {
    if (el.isLocked) return;
    saveHistory(elements);
    setElements(prev => prev.filter(i => i.id !== el.id));
    setSelectedId(null);
  }, [elements, saveHistory]);

  // 切换锁定状态
  const toggleLock = useCallback((el) => {
    updateElement(el.id, { isLocked: !el.isLocked });
  }, [updateElement]);

  // 提升图层
  const moveUpLayer = useCallback((el) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    updateElement(el.id, { zIndex: newZIndex });
  }, [maxZIndex, updateElement]);

  // 复制到剪贴板
  const copyToClipboard = useCallback((el) => {
    setClipboard({ ...el });
  }, []);

  // 从剪贴板粘贴
  const pasteFromClipboard = useCallback((targetEl) => {
    if (!clipboard) return;
    saveHistory(elements);
    
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    
    const newElement = {
      ...clipboard,
      id: generateId('cp'),
      x: targetEl ? targetEl.x + 40 : clipboard.x + 40,
      y: targetEl ? targetEl.y + 40 : clipboard.y + 40,
      reactions: {},
      zIndex: newZIndex
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, [clipboard, elements, maxZIndex, saveHistory]);

  return {
    elements,
    setElements,
    sortedElements,
    selectedId,
    setSelectedId,
    selectedElement,
    clipboard,
    maxZIndex,
    setMaxZIndex,
    updateElement,
    addElement,
    duplicateElement,
    deleteElement,
    toggleLock,
    moveUpLayer,
    copyToClipboard,
    pasteFromClipboard,
  };
};

export default useElements;
