import type { Meta, StoryObj } from '@storybook/react'
import LazyTreeView from '../lazy-tree-view/LazyTreeView'
import {
  CHILDREN_BY_FOLDER,
  LAZY_TREE_EXAMPLE,
  mockLoadChildren,
} from '../mocks/storybook/storybook'

const meta: Meta<typeof LazyTreeView> = {
  component: LazyTreeView,
  tags: ['autodocs'],
  argTypes: {
    initialTree: {
      description: 'The initial tree structure to be displayed.',
      control: 'object',
    },
    loadChildren: {
      description: 'Callback function to load the children of a folder asynchronously.',
      control: false,
    },
  },
}

export default meta
type Story = StoryObj<typeof LazyTreeView>

export const Default: Story = {
  args: {
    initialTree: LAZY_TREE_EXAMPLE,
    loadChildren: (folder) => mockLoadChildren(CHILDREN_BY_FOLDER[folder.name]),
  },
}
