import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Monorepo: Expo trae otra copia de React; forzar una sola.
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Todo el bundle (incluye protocolo SOS y buenas prácticas) queda en caché la primera visita.
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      manifest: {
        name: 'Reto Same · Tortugas de Same',
        short_name: 'Reto Same',
        description: 'Qué hacer si ves una tortuga en la playa de Same, Tonchigüe y Atacames.',
        lang: 'es',
        theme_color: '#194171',
        background_color: '#194171',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
