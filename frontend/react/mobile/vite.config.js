import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = dirname(fileURLToPath(import.meta.url))
const sharedReactDir = resolve(rootDir, '..')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: {
      allow: [rootDir, sharedReactDir],
    },
    hmr: {
      host: process.env.TAURI_DEV_HOST || 'localhost',
      port: 5173,
    },
  },
})
