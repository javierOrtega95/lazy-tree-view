import type { BranchNode } from '../types/tree'
import { generateUUID } from './utils/uuid'

const ROOT_NODE_ID = generateUUID()
export const ROOT_NODE: BranchNode = { id: ROOT_NODE_ID, name: 'root', children: [] }
