import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/**/*.d.ts'],
    },
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '**/*.integration.test.ts'],
    setupFiles: ['./src/tests/setup.ts'],
  },
});

