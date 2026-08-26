import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        // Separate HTML entry so /admin ships its own <link rel="manifest">
        // from the first byte — "Add to Home Screen" reads it before any
        // client-side JS runs, so swapping it after hydration is too late.
        admin: path.resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
})
