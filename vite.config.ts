import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Uses a relative base path for builds, necessary when deploying to a subdirectory.
  base: './',
  plugins: [react(), tailwindcss()],
})
