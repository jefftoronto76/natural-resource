import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors tsconfig "paths": ["@/*" -> ["./*", "./src/*"]]. More
      // specific alias first — @/lib/* routes to src/lib/ where shared
      // utilities (blockTypes, blockOrder, supabase-admin, etc.) live.
      // The general @/* fallback handles everything else (components,
      // app, test).
      '@/lib': resolve(__dirname, 'src/lib'),
      '@/test': resolve(__dirname, 'test'),
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
