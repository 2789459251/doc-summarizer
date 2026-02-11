// vite.config.js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // 不要在这里用！

export default defineConfig({
  plugins: [react()],
})