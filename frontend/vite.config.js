import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.js.org/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
