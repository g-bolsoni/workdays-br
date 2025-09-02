import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/calculate': 'http://localhost:3001',
      '/calcular': 'http://localhost:3001',
      '/health': 'http://localhost:3001'
    }
  }
})
