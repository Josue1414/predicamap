import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
            src: '/PredicaMap-Logo.png', // <-- DIAGIONAL AÑADIDA AQUÍ
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // <-- CONFIGURACIÓN AÑADIDA PARA PRUEBAS LOCALES
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
})