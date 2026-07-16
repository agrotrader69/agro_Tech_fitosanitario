import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  base: './', // Permite que las rutas funcionen perfectamente al desplegar en GitHub Pages
})
