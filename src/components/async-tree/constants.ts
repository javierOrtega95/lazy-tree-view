import { FolderNode } from './types'

const ROOT_ID = crypto.randomUUID()

export const ROOT_NODE: FolderNode = {
  id: ROOT_ID,
  name: 'root',
  children: [],
}

export const defaultDnDclassNames = {
  dragOver: 'drag-over',
  dragBefore: 'drag-before',
  dragAfter: 'drag-after',
  dropNotAllowed: 'drop-not-allowed',
}

export const TREE_NODE_INDENTATION = 12

export const DROP_BEFORE_PERCENT = 0.1
export const DROP_MID_PERCENT = 0.5
export const DROP_AFTER_FOLDER_PERCENT = 0.7
