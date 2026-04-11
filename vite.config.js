/**
 * Vite Configuration for The First Dungeon Webxdc
 * Enables modern development workflow with hot reload and source maps
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src-unminified/main.js')
      },
      output: {
        dir: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    
    // Optimize for webxdc size constraints
    target: 'es2020',
    cssTarget: 'chrome80'
  },
  
  server: {
    port: 3000,
    host: true,
    open: '/index.html',
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000
    }
  },
  
  optimizeDeps: {
    include: ['pixi.js'],
    exclude: []
  },
  
  // Asset handling
  publicDir: 'assets',
  
  // Plugin configuration
  plugins: [],
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src-unminified'),
      '@core': resolve(__dirname, 'src-unminified/core'),
      '@entities': resolve(__dirname, 'src-unminified/entities'),
      '@systems': resolve(__dirname, 'src-unminified/systems'),
      '@ui': resolve(__dirname, 'src-unminified/ui'),
      '@utils': resolve(__dirname, 'src-unminified/utils'),
      '@vendor': resolve(__dirname, 'vendor')
    }
  },
  
  // Development settings
  define: {
    __DEV__: 'true',
    __VERSION__: JSON.stringify('1.1.0')
  },
  
  // CSS settings
  css: {
    devSourcemap: true
  }
});
