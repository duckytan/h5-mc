import { defineConfig } from 'vite'

export default defineConfig({
  base: '/h5-mc/', // GitHub Pages 仓库名
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  publicPath: '/h5-mc/' // 确保资源路径正确
})
