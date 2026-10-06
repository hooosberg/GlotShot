import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'
import { createManualChunks } from './build/viteManualChunks.mjs'

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
      },
      output: {
        manualChunks: createManualChunks
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5187,
    strictPort: true,
    open: '/app.html'
  }
})
