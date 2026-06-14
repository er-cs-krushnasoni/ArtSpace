import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['artspace-logo.png'],
      manifest: {
        name: 'ArtSpace Admin',
        short_name: 'ArtSpace',
        description: 'ArtSpace shop admin dashboard',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'artspace-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'artspace-logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,webp}'],
        globIgnores: ['**/artspace-logo.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['recharts', 'react', 'react-dom'],
    force: true,
  },
  build: {
    commonjsOptions: {
      include: [/recharts/, /node_modules/],
    },
  },
});