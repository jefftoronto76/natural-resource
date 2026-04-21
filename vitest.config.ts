import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors tsconfig "paths": ["@/*" -> "./*"]. The secondary
      // "./src/*" mapping isn't needed for admin-side tests since
      // the admin tree lives under ./components/ and ./app/, not
      // ./src/. Add a second alias if a test ever needs src/.
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
  },
})
