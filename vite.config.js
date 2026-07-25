// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // <-- CORRECCIÓN: 'prompt' para que el usuario decida cuándo actualizar
      includeAssets: ['Logo-PredicaMap.svg'], 
      manifest: {
        name: 'PredicaMap',
        short_name: 'PredicaMap',
        description: 'Gestor de territorios para la predicación',
        theme_color: '#0f172a', 
        background_color: '#f8fafc',
        display: 'standalone', 
        icons: [
          {
            src: '/PredicaMap-Logo.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // <-- LIMPIEZA SEGURA: Borra el código viejo pero protege el localStorage
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
})