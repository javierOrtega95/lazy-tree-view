import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isStorybook = process.argv.some((arg) => arg.includes('storybook'))

export default defineConfig({
  plugins: [
    react(),
    !isStorybook &&
      dts({
        // Only emit declarations for the library source, not stories/tests
        include: ['src/lazy-tree-view', 'src/types', 'src/css-modules.d.ts'],
        // Use the app tsconfig (excludes vite.config.ts which confuses api-extractor)
        tsconfigPath: './tsconfig.app.json',
        // Roll up all .d.ts into a single file matching the JS output
        rollupTypes: true,
      }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lazy-tree-view/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Don't bundle React — the consumer's project provides it
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
