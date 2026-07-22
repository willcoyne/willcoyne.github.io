import { defineConfig } from 'vite'

// Proxy /api requests to the local backend during development
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})
