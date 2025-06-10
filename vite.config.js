import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@public': path.resolve(__dirname, 'public'),
			'@img': path.resolve(__dirname, 'src/assets/imgs/img'),
			'@ico': path.resolve(__dirname, 'src/assets/imgs/ico'),
			'@scss': path.resolve(__dirname, 'src/assets/scss'),
			'@js': path.resolve(__dirname, 'src/assets/js'),
			'@components': path.resolve(__dirname, 'src/components'),
		},
	}
})
