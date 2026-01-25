import type { DragClassNames } from '../types/dnd'
import type { FolderNode } from '../types/tree'

const ROOT_NODE_ID = crypto.randomUUID()
export const ROOT_NODE: FolderNode = { id: ROOT_NODE_ID, name: 'root', children: [] }

export const defaultDnDclassNames: DragClassNames = {
  dragOver: 'drag-over',
  dragBefore: 'drag-before',
  dragAfter: 'drag-after',
  dropNotAllowed: 'drop-not-allowed',
}
