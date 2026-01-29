/**
 * History Operation Types for Undo/Redo Feature
 */

// Operation types
export const OPERATION_TYPES = {
  CREATE: 'create',      // Element creation
  DELETE: 'delete',      // Element deletion
  UPDATE: 'update',      // Property update (style, content, lock status, etc.)
  MOVE: 'move',          // Position/size/rotation change
};

// Time window for consolidating similar consecutive operations (in milliseconds)
// Operations within this window on the same element will be consolidated into one entry
export const CONSOLIDATION_TIME_WINDOW = 500;

/**
 * Create a history record for an operation
 * @param {string} operation - Operation type (CREATE, DELETE, UPDATE, MOVE)
 * @param {string} elementId - Element ID being operated on
 * @param {string} canvasId - Canvas ID
 * @param {string} userId - User ID performing the operation
 * @param {object} previousState - State before operation (for undo)
 * @param {object} newState - State after operation (for redo)
 * @returns {object} History record for database transaction
 */
export function createHistoryRecord(
  operation,
  elementId,
  canvasId,
  userId,
  previousState,
  newState
) {
  return {
    operation,
    elementId,
    previousState,
    newState,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };
}

/**
 * Extract relevant state for history based on operation type
 * @param {object} element - Element object
 * @param {string} operation - Operation type
 * @returns {object} Relevant state fields for the operation
 */
export function extractElementState(element, operation) {
  switch (operation) {
    case OPERATION_TYPES.CREATE:
      return {
        type: element.type,
        content: element.content,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        scale: element.scale,
        zIndex: element.zIndex,
        isLocked: element.isLocked,
        style: element.style,
        texture: element.texture,
        shape: element.shape,
        link: element.link,
      };

    case OPERATION_TYPES.MOVE:
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        scale: element.scale,
        zIndex: element.zIndex,
      };

    case OPERATION_TYPES.UPDATE:
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        scale: element.scale,
        zIndex: element.zIndex,
        content: element.content,
        style: element.style,
        isLocked: element.isLocked,
        texture: element.texture,
        shape: element.shape,
        link: element.link,
      };

    case OPERATION_TYPES.DELETE:
      return {
        type: element.type,
        content: element.content,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        scale: element.scale,
        zIndex: element.zIndex,
        isLocked: element.isLocked,
        style: element.style,
        texture: element.texture,
        shape: element.shape,
        link: element.link,
      };

    default:
      return element;
  }
}

/**
 * Determine operation type based on what changed
 * @param {object} previousState - Previous element state
 * @param {object} newState - New element state
 * @returns {string} Operation type
 */
export function determineOperationType(previousState, newState) {
  if (!previousState) return OPERATION_TYPES.CREATE;
  if (!newState) return OPERATION_TYPES.DELETE;

  // Check if only position/rotation/scale changed
  if (
    previousState.x !== newState.x ||
    previousState.y !== newState.y ||
    previousState.rotation !== newState.rotation ||
    previousState.scale !== newState.scale ||
    previousState.zIndex !== newState.zIndex
  ) {
    // If other properties also changed, it's an update, not just move
    const otherPropsChanged =
      previousState.content !== newState.content ||
      previousState.isLocked !== newState.isLocked ||
      JSON.stringify(previousState.style) !== JSON.stringify(newState.style);

    return otherPropsChanged ? OPERATION_TYPES.UPDATE : OPERATION_TYPES.MOVE;
  }

  return OPERATION_TYPES.UPDATE;
}

/**
 * Check if two operations can be consolidated
 * Operations can be consolidated if:
 * - They are on the same element
 * - They are the same operation type (or both position-related: MOVE, UPDATE)
 * - They occur within the consolidation time window
 * @param {object} lastOperation - Last recorded operation
 * @param {string} elementId - Element ID of new operation
 * @param {string} operationType - Type of new operation
 * @param {number} currentTime - Current timestamp
 * @returns {boolean} Whether operations can be consolidated
 */
export function canConsolidateOperations(
  lastOperation,
  elementId,
  operationType,
  currentTime
) {
  if (!lastOperation) return false;

  // Check if same element
  if (lastOperation.elementId !== elementId) return false;

  // CREATE and DELETE cannot be consolidated
  if (
    operationType === OPERATION_TYPES.CREATE ||
    operationType === OPERATION_TYPES.DELETE ||
    lastOperation.operation === OPERATION_TYPES.CREATE ||
    lastOperation.operation === OPERATION_TYPES.DELETE
  ) {
    return false;
  }

  // Check if within time window
  const timeSinceLastOp = currentTime - lastOperation.timestamp;
  if (timeSinceLastOp > CONSOLIDATION_TIME_WINDOW) return false;

  // Both should be position-related (MOVE or UPDATE) or same type
  return (
    lastOperation.operation === operationType ||
    (lastOperation.operation === OPERATION_TYPES.MOVE && operationType === OPERATION_TYPES.UPDATE) ||
    (lastOperation.operation === OPERATION_TYPES.UPDATE && operationType === OPERATION_TYPES.MOVE)
  );
}

/**
 * Consolidate two operations into one
 * The new operation's previousState stays the same, but newState gets updated
 * @param {object} lastOperation - Last recorded operation to consolidate with
 * @param {object} newOperation - New operation to consolidate
 * @returns {object} Consolidated operation
 */
export function consolidateOperations(lastOperation, newOperation) {
  return {
    ...lastOperation,
    operation: newOperation.operation || lastOperation.operation,
    newState: newOperation.newState, // Update new state to latest
    timestamp: newOperation.timestamp, // Update timestamp to latest
  };
}
