import { useState, useCallback, useRef } from 'react';
import { db, tx, id } from '../lib/db';
import {
  OPERATION_TYPES,
  CONSOLIDATION_TIME_WINDOW,
  createHistoryRecord,
  extractElementState,
  canConsolidateOperations,
  consolidateOperations,
} from '../utils/historyOperations';

/**
 * Hook for managing operation history with undo/redo
 */
export function useOperationHistory(canvasId, userId) {
  const [historyStack, setHistoryStack] = useState([]); // Stack of history records for undo
  const [redoStack, setRedoStack] = useState([]); // Stack of history records for redo
  const lastOperationRef = useRef(null); // Reference to last operation for consolidation
  const lastAppliedStateRef = useRef(null); // Track last applied state for undo

  /**
   * Record an operation to history
   * @param {string} operation - Operation type
   * @param {string} elementId - Element being operated on
   * @param {object} previousState - State before operation
   * @param {object} newState - State after operation
   */
  const recordOperation = useCallback(
    async (operation, elementId, previousState, newState) => {
      if (!canvasId || !userId) return;
      const currentTime = Date.now();
      const lastOp = lastOperationRef.current;

      try {
        // Check if we can consolidate with last operation
        if (
          canConsolidateOperations(lastOp, elementId, operation, currentTime)
        ) {
          // Update last operation with new state
          const consolidated = consolidateOperations(
            { ...lastOp },
            {
              operation,
              newState,
              timestamp: currentTime,
            }
          );

          // Update the history record in database
          await db.transact([
            tx.history[lastOp.id].update({
              operation: consolidated.operation,
              newState: consolidated.newState,
              timestamp: consolidated.timestamp,
            }),
          ]);

          // Update ref
          lastOperationRef.current = {
            ...consolidated,
            id: lastOp.id,
          };

          // Update stack with consolidated record
          setHistoryStack((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...consolidated, id: lastOp.id };
            return updated;
          });

          return;
        }

        // Create new history record
        const historyId = id();
        const record = createHistoryRecord(
          operation,
          elementId,
          canvasId,
          userId,
          previousState,
          newState
        );

        await db.transact([
          tx.history[historyId]
            .update(record)
            .link({ canvas: canvasId })
            .link({ user: userId }),
        ]);

        // Update history stack with full record
        const fullRecord = { ...record, id: historyId };
        setHistoryStack((prev) => [...prev, fullRecord]);
        setRedoStack([]); // Clear redo stack on new operation

        // Update ref for consolidation
        lastOperationRef.current = fullRecord;
      } catch (error) {
        console.error('Failed to record operation:', error);
      }
    },
    [canvasId, userId]
  );

  /**
   * Undo the last operation
   * Reverts element to previousState
   */
  const undo = useCallback(
    async () => {
      if (historyStack.length === 0) return;

      const lastRecord = historyStack[historyStack.length - 1];

      try {
        // Apply previousState to undo the operation
        if (lastRecord && lastRecord.elementId && lastRecord.previousState) {
          const { operation, elementId, previousState } = lastRecord;

          // Handle different operation types
          if (operation === OPERATION_TYPES.CREATE) {
            // For CREATE undo: delete the element
            await db.transact([tx.elements[elementId].delete()]);
          } else if (operation === OPERATION_TYPES.DELETE) {
            // For DELETE undo: recreate the element with previous state
            await db.transact([
              tx.elements[elementId].update(previousState),
            ]);
          } else {
            // For UPDATE/MOVE: apply previous state
            await db.transact([
              tx.elements[elementId].update(previousState),
            ]);
          }
        }

        // Move to redo stack
        setHistoryStack((prev) => prev.slice(0, -1));
        setRedoStack((prev) => [...prev, lastRecord]);

        // Clear consolidation ref since we're changing history
        lastOperationRef.current = null;
      } catch (error) {
        console.error('Failed to undo:', error);
      }
    },
    [historyStack]
  );

  /**
   * Redo the last undone operation
   * Reapplies element to newState
   */
  const redo = useCallback(
    async () => {
      if (redoStack.length === 0) return;

      const nextRecord = redoStack[redoStack.length - 1];

      try {
        // Apply newState to redo the operation
        if (nextRecord && nextRecord.elementId && nextRecord.newState) {
          const { operation, elementId, newState } = nextRecord;

          // Handle different operation types
          if (operation === OPERATION_TYPES.CREATE) {
            // For CREATE redo: recreate the element
            await db.transact([
              tx.elements[elementId].update(newState),
            ]);
          } else if (operation === OPERATION_TYPES.DELETE) {
            // For DELETE redo: delete the element
            await db.transact([tx.elements[elementId].delete()]);
          } else {
            // For UPDATE/MOVE: apply new state
            await db.transact([
              tx.elements[elementId].update(newState),
            ]);
          }
        }

        // Move to undo stack
        setRedoStack((prev) => prev.slice(0, -1));
        setHistoryStack((prev) => [...prev, nextRecord]);

        // Clear consolidation ref
        lastOperationRef.current = null;
      } catch (error) {
        console.error('Failed to redo:', error);
      }
    },
    [redoStack]
  );

  /**
   * Clear history (useful when loading a new canvas)
   */
  const clearHistory = useCallback(() => {
    setHistoryStack([]);
    setRedoStack([]);
    lastOperationRef.current = null;
  }, []);

  return {
    recordOperation,
    undo,
    redo,
    canUndo: historyStack.length > 0,
    canRedo: redoStack.length > 0,
    clearHistory,
    historyStack,
    redoStack,
  };
}
