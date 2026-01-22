import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // 使用相对路径，兼容 GitHub Pages 子路径
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
