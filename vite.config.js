import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  build: {
    rollupOptions: {
      input: {
        app: 'app.html'
      }
    }
  },
  server: {
    open: '/app.html'
  }
})
