import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 7000
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
		},
	}
})

/*
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7000
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),    // 일반 사용자 엔트리
        admin: path.resolve(__dirname, 'admin.html')     // 관리자 엔트리
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public'),
      '@img': path.resolve(__dirname, 'src/assets/imgs/img'),
      '@ico': path.resolve(__dirname, 'src/assets/imgs/ico'),
      '@scss': path.resolve(__dirname, 'src/assets/scss'),
      '@js': path.resolve(__dirname, 'src/assets/js'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  }
})
*/

// 일반 유저 페이지 → http://localhost:7000/
// 관리자 페이지 → http://localhost:7000/admin.html

// cd C:\Users\minwo\Desktop\중간프로젝트\front-server -> npm run dev