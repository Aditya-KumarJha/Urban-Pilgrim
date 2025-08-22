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
          // Vendor chunks
          if (id.includes('react') && !id.includes('react-')) {
            return 'react-vendor';
          }
          if (id.includes('@reduxjs') || id.includes('redux-persist')) {
            return 'redux-vendor';
          }
          if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-icons')) {
            return 'ui-vendor';
          }
          // Separate media libraries to avoid conflicts
          if (id.includes('react-player')) {
            return 'react-player-vendor';
          }
          if (id.includes('@mux/mux-player-react')) {
            return 'mux-player-vendor';
          }
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('axios') || id.includes('uuid') || id.includes('react-hook-form') || id.includes('react-hot-toast')) {
            return 'utils-vendor';
          }
          // Split large media libraries
          if (id.includes('dash.all.min')) {
            return 'dash-vendor';
          }
          if (id.includes('hls.js')) {
            return 'hls-vendor';
          }
          // Split large components
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
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    target: 'es2015', // Target modern browsers for better tree-shaking
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@mux/mux-player-react'], // Exclude problematic dependency
  },
  define: {
    // Ensure proper global variable handling
    global: 'globalThis',
  },
})
