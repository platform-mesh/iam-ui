import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        '**/*.html',
        '**/test-setup.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        branches: 70,
        lines: 75,
      },
    },
  },
});
