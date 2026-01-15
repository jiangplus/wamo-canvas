/**
 * useHistory Hook
 * 历史记录管理 - 实现撤销/重做功能
 */
import { useState, useCallback } from 'react';
import { HISTORY_CONFIG } from '../utils/constants';

export const useHistory = (setElements, setSelectedId) => {
  const [history, setHistory] = useState([]);

  // 保存当前状态到历史记录
  const saveHistory = useCallback((elements) => {
    setHistory(prev => {
      const newHistory = [...prev, JSON.parse(JSON.stringify(elements))];
      // 限制历史记录长度
      if (newHistory.length > HISTORY_CONFIG.maxLength) {
        return newHistory.slice(-HISTORY_CONFIG.maxLength);
      }
      return newHistory;
    });
  }, []);

  // 撤销
  const undo = useCallback(() => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    setElements(previousState);
    setHistory(prev => prev.slice(0, -1));
    setSelectedId(null);
  }, [history, setElements, setSelectedId]);

  // 检查是否可以撤销
  const canUndo = history.length > 0;

  return {
    history,
    saveHistory,
    undo,
    canUndo,
  };
};

export default useHistory;
