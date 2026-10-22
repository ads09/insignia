import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    globalSetup: ['./test/utils/e2e-global-setup.ts'],
    setupFiles: ['./test/utils/e2e-env.ts'],
    // All suites share one database.
    fileParallelism: false,
    hookTimeout: 30_000,
  },
});
