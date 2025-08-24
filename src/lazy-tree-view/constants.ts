import type { DragClassNames } from '../types/dnd'
import type { FolderNode } from '../types/tree'

const ROOT_ID = crypto.randomUUID()

export const ROOT_NODE: FolderNode = {
  id: ROOT_ID,
  name: 'root',
  children: [],
}

export const defaultDnDclassNames: DragClassNames = {
  dragOver: 'drag-over',
  dragBefore: 'drag-before',
  dragAfter: 'drag-after',
  dropNotAllowed: 'drop-not-allowed',
}

export const BASE_NODE_INDENTATION = 28

export const DROP_BEFORE_FOLDER_PERCENT = 0.1
export const DROP_MID_PERCENT = 0.5
