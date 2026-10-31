import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/security-tests': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/__security': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/target-health': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/target-health/, '/health'),
      },
    },
  },
})
