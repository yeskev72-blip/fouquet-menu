import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      // « prompt » plutôt que « autoUpdate » : la mise à jour ne doit pas
      // recharger la page au milieu d'une série. L'utilisateur décide.
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['icone.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fonte',
        short_name: 'Fonte',
        description: 'Note ta série, vois ta progression.',
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0E0F11',
        background_color: '#0E0F11',
        categories: ['health', 'fitness', 'sports'],
        icons: [
          { src: '/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tout le shell et les polices sont précachés : après la première
        // visite, l'appli n'a plus besoin du réseau.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
      },
      devOptions: {
        // Permet de tester le mode hors ligne sans passer par un build.
        enabled: false,
        type: 'module',
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
