import type { DragClassNames } from '../types/dnd'

const ROOT_NODE_ID = crypto.randomUUID()
export const ROOT_NODE = { id: ROOT_NODE_ID, name: 'root', children: [] }

export const defaultDnDclassNames: DragClassNames = {
  dragOver: 'drag-over',
  dragBefore: 'drag-before',
  dragAfter: 'drag-after',
  dropNotAllowed: 'drop-not-allowed',
}

export const BASE_NODE_INDENTATION = 28

export const DROP_BEFORE_FOLDER_PERCENT = 0.25
export const DROP_AFTER_FOLDER_PERCENT = 0.75
