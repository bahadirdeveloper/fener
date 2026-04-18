import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'

function buildInfo() {
  let sha = 'dev'
  try { sha = execSync('git rev-parse --short HEAD').toString().trim() } catch { /* noop */ }
  return { sha, builtAt: new Date().toISOString() }
}
const BUILD = buildInfo()

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(BUILD.sha),
    __BUILD_AT__: JSON.stringify(BUILD.builtAt)
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: '/',
        name: 'Fener — Acil İletişim',
        short_name: 'Fener',
        description: 'Afet anında internetsiz çalışan açık kaynak iletişim ağı.',
        lang: 'tr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A0A08',
        theme_color: '#0A0A08',
        categories: ['utilities', 'safety', 'emergency'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: 'Ben İyiyim', short_name: 'İyiyim', url: '/durum?t=ok' },
          { name: 'Yardım Lazım', short_name: 'Yardım', url: '/durum?t=help' },
          { name: 'Acil Bilgi Kartı', short_name: 'Kart', url: '/kart' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fener-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fener-osm-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 90 }
            }
          },
          {
            urlPattern: /^https:\/\/protomaps\.github\.io\/basemaps-assets\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fener-map-glyphs',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 180 }
            }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  build: {
    target: 'es2020',
    sourcemap: false
  }
})
