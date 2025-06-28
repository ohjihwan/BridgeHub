import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'true',
    allowedHosts: ['thebridgehub.org'],
    port: 7700,
    proxy: {
      '/api': {
        target: 'http://localhost:7100',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

// cd front-user
// npm install
// npm run dev
// # → http://localhost:7700
