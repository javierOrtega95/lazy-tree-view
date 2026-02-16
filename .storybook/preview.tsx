import type { Preview } from '@storybook/react'
import './storybook.css'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
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
            'Error & Retry',
            'Drag & Drop',
            'Customization',
            'Keyboard Navigation',
            'Imperative API',
            'Animations',
            'Callbacks',
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
