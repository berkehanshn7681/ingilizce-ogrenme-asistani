import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Telefondan aynı ağ üzerinden test edebilmek için
    port: 5173,
  },
})
