import type { Preview } from '@storybook/react'
import './storybook.css'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Welcome',
          'Features',
          [
            'Default',
            'Lazy Loading',
            'Drag & Drop',
            'Customization',
            'Keyboard Navigation',
            'Imperative API',
            'Animations',
          ],
          'Use Cases',
          ['File Explorer', 'Organization Hierarchy', 'Help Center'],
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='sb-canvas'>
        <Story />
      </div>
    ),
  ],
}

export default preview
