import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const cleanApiUrl = (env.API_URL || 'http://localhost:5000').replace(/\/+$/, '');

  return {
    base: mode === 'production' ? '/varna/' : '/',
    logLevel: 'error',
    envPrefix: ['VITE_', 'API_'],
    define: {
      'import.meta.env.API_URL': JSON.stringify(cleanApiUrl)
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'VARNA - Artisan Marketplace',
          short_name: 'VARNA',
          description: 'Bridging Rural India to the World',
          theme_color: '#D97706',
          background_color: '#FAF5EE',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              // Fix: Convert to Regex string so 'env' variable isn't executed inside the browser's Service Worker isolating environment
              urlPattern: new RegExp('^' + cleanApiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 1 Day
                }
              }
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                }
              }
            }
          ]
        }
      })
    ],
  }
})
