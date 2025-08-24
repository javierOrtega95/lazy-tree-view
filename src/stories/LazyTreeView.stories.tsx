import type { Meta, StoryObj } from '@storybook/react'
import { CHILDREN_BY_FOLDER, DEFAULT_TREE, mockLoadChildren } from '../mocks/storybook/storybook'
import LazyTreeView from '../lazy-tree-view/LazyTreeView'

const meta: Meta<typeof LazyTreeView> = {
  component: LazyTreeView,
  tags: ['autodocs'],
  argTypes: {
    initialTree: {
      description: 'The tree structure to be displayed.',
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
    initialTree: DEFAULT_TREE,
    loadChildren: (folder) => mockLoadChildren(CHILDREN_BY_FOLDER[folder.name]),
  },
}
