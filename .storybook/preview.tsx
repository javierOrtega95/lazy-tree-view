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
  },
  decorators: [
    (Story) => (
      <div className="sb-canvas">
        <Story />
      </div>
    ),
  ],
}

export default preview
