// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo-192.png', 'logo-512.png'],

      manifest: {
        name: 'Academix - Plataforma Educativa',
        short_name: 'Academix',
        description: 'Plataforma de biblioteca virtual y hub de estudio colaborativo',
        theme_color: '#0F2340',
        background_color: '#181935',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mjs}'],
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^\//],
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/docs/,
          /^\/openapi\.json/,
          /^\/monitor/,
        ],

        runtimeCaching: [
          // ── 1. API: red primero ───────────────────────────────────
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // ── 2. Recursos offline (PDF, audio, video, etc.) ─────────
          {
            urlPattern: ({ url }) => {
              const mismoOrigen = url.origin === self.location.origin

              // Archivos del mismo servidor
              const esArchivoLocal =
                mismoOrigen &&
                /\.(pdf|html|htm|mp3|mp4|webm|wav|ogg|aac|m4a|mov)$/i.test(
                  url.pathname
                )

              // Archivos externos
              const esArchivoExterno =
                !mismoOrigen &&
                /\.(pdf|html|htm|mp3|mp4|webm|wav|ogg|aac|m4a|mov)$/i.test(
                  url.pathname
                )

              // Excluir servicios no cacheables
              const esExcluido =
                url.hostname.includes('drive.google.com') ||
                url.hostname.includes('youtube.com') ||
                url.hostname.includes('youtu.be') ||
                url.hostname.includes('fonts.googleapis.com') ||
                url.hostname.includes('fonts.gstatic.com') ||
                url.hostname.includes('openlibrary.org') ||
                url.hostname.includes('covers.openlibrary.org')

              return (esArchivoLocal || esArchivoExterno) && !esExcluido
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-recursos-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
})