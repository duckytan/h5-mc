import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // 开发服务器热更新配置
    hmr: {
      overlay: true, // 显示错误覆盖层
    },
    // 开发服务器代理配置
    proxy: {
      // 如果需要 API 代理，在这里配置
    },
  },
  build: {
    outDir: 'dist',
    // 生成 Source Map
    sourcemap: true,
    // 生产环境优化配置
    target: 'es2020',
    rollupOptions: {
      output: {
        // 代码分割配置
        manualChunks: {
          three: ['three'],
        },
        // 优化输出文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  // 优化配置
  optimizeDeps: {
    include: ['three'],
  },
});
