import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable on a phone, so the basics work without the native app.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Woodworks',
        short_name: 'Woodworks',
        description: 'Design, plan and build your woodworking projects.',
        theme_color: '#7a4a24',
        background_color: '#faf6f0',
        display: 'standalone',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    }),
  ],
})
