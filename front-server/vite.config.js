import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		port: 7000,
		proxy: {
			'/api': {
				target: 'http://localhost:7100',
				changeOrigin: true,
				secure: false
			}
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@img': path.resolve(__dirname, 'src/assets/imgs/img'),
			'@ico': path.resolve(__dirname, 'src/assets/imgs/ico'),
			'@scss': path.resolve(__dirname, 'src/assets/scss'),
			'@js': path.resolve(__dirname, 'src/assets/js'),
			'@page': path.resolve(__dirname, 'src/page'),
			'@components': path.resolve(__dirname, 'src/page/components'),
			'@common': path.resolve(__dirname, 'src/page/common'),
			'@json': path.resolve(__dirname, 'src/json'),
			'@dev': path.resolve(__dirname, 'dev'),
		},
	}
})
