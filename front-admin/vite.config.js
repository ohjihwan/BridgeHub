import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 7700,
    allowedHosts: ["admin.thebridgehub.org", "localhost", "0.0.0.0"],
    proxy: {
      "/api": {
        target: "https://api.thebridgehub.org", 
        // ALB 또는 NGINX가 라우팅해주는 도메인
        changeOrigin: true,
        secure: false, // Let's Encrypt가 아니라면 이 옵션 필요
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});