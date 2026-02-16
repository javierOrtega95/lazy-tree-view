import { addons } from '@storybook/manager-api'
import { create } from '@storybook/theming'

const theme = create({
  base: 'light',
  brandTitle: 'Lazy Tree View',
  brandUrl: 'https://github.com/javierOrtega95/lazy-tree-view',
  fontBase: 'system-ui, -apple-system, "Segoe UI", sans-serif',
})

addons.setConfig({ theme })
