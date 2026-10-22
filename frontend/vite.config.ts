import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    // The page and the API share an address that never resolves: a request
    // without a mock fails instead of reaching a backend running locally, and
    // being same-origin, requests need no CORS preflight.
    environmentOptions: { jsdom: { url: 'http://api.test' } },
    env: { VITE_API_BASE_URL: 'http://api.test' },
    setupFiles: ['./src/test/setup.tsx'],
    css: false,
    restoreMocks: true,
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.test.{ts,tsx}'],
    },
  },
});
