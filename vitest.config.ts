import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next'],
    testTimeout: 30000, // 30 seconds for AI operations
    hookTimeout: 10000, // 10 seconds for setup/teardown
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/lib': resolve(__dirname, './lib'),
      '@/components': resolve(__dirname, './components'),
      '@/app': resolve(__dirname, './app'),
      '@/services': resolve(__dirname, './services'),
      '@/prisma': resolve(__dirname, './prisma'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
