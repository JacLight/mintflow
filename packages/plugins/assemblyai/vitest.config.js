import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '@mintflow/common': '../../common/src/index.ts'
    }
  }
});
