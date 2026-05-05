import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      react: path.resolve(__dirname, 'node_modules/react/index.js'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom/index.js'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client.js'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
    },
    dedupe: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    include: ['react-router-dom'],
  },
});