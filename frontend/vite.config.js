import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      '3bb7e10ab528.ngrok-free.app'
    ],
    proxy: {
      '/calculate': 'http://localhost:3001',
      '/calcular': 'http://localhost:3001',
      '/health': 'http://localhost:3001'
    }
  }
})
