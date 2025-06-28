import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 올바른 설정: 외부 접속 허용
    port: 7000,
    allowedHosts: ['thebridgehub.org'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@img": path.resolve(__dirname, "src/assets/imgs/img"),
      "@ico": path.resolve(__dirname, "src/assets/imgs/ico"),
      "@scss": path.resolve(__dirname, "src/assets/scss"),
      "@js": path.resolve(__dirname, "src/assets/js"),
      "@page": path.resolve(__dirname, "src/page"),
      "@components": path.resolve(__dirname, "src/page/components"),
      "@common": path.resolve(__dirname, "src/page/common"),
      "@json": path.resolve(__dirname, "src/json"),
      "@dev": path.resolve(__dirname, "dev"),
    },
  },
});