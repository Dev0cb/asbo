import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the build works both at a subdomain root and under a sub-path.
export default defineConfig({
  base: './',
  server: {
    port: 3100,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
