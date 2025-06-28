import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 7700,
    proxy: {
  '/api': {
    target: 'https://api.thebridgehub.org',
     // nginx나 ALB로 라우팅된 도메인일 경우
    changeOrigin: true,
    secure: false, 
    // HTTPS인데 인증서 self-signed일 경우 필요
  },
},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
