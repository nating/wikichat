import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    environmentMatchGlobs: [
      ['tests/unit/ui/**', 'jsdom'],  // frontend React tests
      ['tests/unit/api/**', 'node'],  // backend API tests
      ['tests/unit/lib/**', 'node'],  // backend logic
    ],
    setupFiles: ['tests/setup/vitest.setup.ts'], // ✅ Add this line
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});