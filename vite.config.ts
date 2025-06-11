
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Get the directory name using import.meta.url for ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Get API key from environment - prioritize process.env for GitHub Actions
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY;

    console.log('🔧 Vite Configuration - Environment Check:');
    console.log('- Mode:', mode);
    console.log('- process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('- process.env.API_KEY:', process.env.API_KEY ? 'Present' : 'Missing');
    console.log('- env.GEMINI_API_KEY:', env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('- env.API_KEY:', env.API_KEY ? 'Present' : 'Missing');
    console.log('- Final API key status:', apiKey ? 'Present' : 'Missing');

    if (apiKey) {
      console.log('✅ API key will be embedded in build');
    } else {
      console.warn('⚠️ No API key found - AI features will not work in production');
    }

    return {
      plugins: [react()],
      base: '/learning_sol/',
      define: {
        // Environment variables for import.meta.env (Vite standard)
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.VITE_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.MODE': JSON.stringify(mode),
        'import.meta.env.DEV': mode === 'development',
        'import.meta.env.PROD': mode === 'production',

        // Legacy process.env support
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.NODE_ENV': JSON.stringify(mode),

        // Global variables for fallback
        '__GEMINI_API_KEY__': JSON.stringify(apiKey),
        '__API_KEY__': JSON.stringify(apiKey),
        'globalThis.__GEMINI_API_KEY__': JSON.stringify(apiKey),
        'globalThis.__API_KEY__': JSON.stringify(apiKey),
        'window.__GEMINI_API_KEY__': JSON.stringify(apiKey),
        'window.__API_KEY__': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // Now __dirname is correctly defined for ESM
        }
      },
      css: {
        postcss: './postcss.config.js',
      }
    };
});