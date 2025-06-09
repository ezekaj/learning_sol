
import path from 'path';
import { URL, fileURLToPath } from 'url'; // Import URL and fileURLToPath
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Get the directory name using import.meta.url for ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // Now __dirname is correctly defined for ESM
        }
      }
    };
});