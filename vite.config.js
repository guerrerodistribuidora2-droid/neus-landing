import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from /neus-landing/
  base: command === 'build' ? '/neus-landing/' : '/',
}))
