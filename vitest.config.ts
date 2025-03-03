import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [
      './client/__tests__/setup.ts',
      './server/__tests__/test-env.ts'
    ],
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['node_modules', 'test'],
    },
    testTimeout: 30000, // Set global test timeout to 30 seconds
  },
}); 