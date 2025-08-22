import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries must be loaded first
          if (id.includes('react') && !id.includes('react-')) {
            return 'react-core';
          }
          if (id.includes('react-dom')) {
            return 'react-dom-core';
          }
          if (id.includes('react-router-dom')) {
            return 'react-router-core';
          }
          
          // Redux and state management
          if (id.includes('@reduxjs') || id.includes('redux-persist')) {
            return 'redux-vendor';
          }
          
          // UI libraries - load after React core
          if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-icons')) {
            return 'ui-vendor';
          }
          
          // Media libraries
          if (id.includes('react-player')) {
            return 'media-vendor';
          }
          if (id.includes('@mux/mux-player-react')) {
            return 'mux-vendor';
          }
          
          // Firebase and utilities
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('axios') || id.includes('uuid') || id.includes('react-hook-form') || id.includes('react-hot-toast')) {
            return 'utils-vendor';
          }
          
          // Large media libraries
          if (id.includes('dash.all.min')) {
            return 'dash-vendor';
          }
          if (id.includes('hls.js')) {
            return 'hls-vendor';
          }
          
          // Application chunks
          if (id.includes('Sessions') || id.includes('Retreats') || id.includes('Guides')) {
            return 'main-features';
          }
          if (id.includes('Home')) {
            return 'home-page';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@mux/mux-player-react'],
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom',
    },
  },
})
