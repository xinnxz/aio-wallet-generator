/**
 * vite.config.js — Vite Configuration for Web Dashboard
 * 
 * PENJELASAN:
 * - root: 'web' artinya Vite serve files dari folder web/
 * - publicDir: false karena kita tidak pakai public folder terpisah
 * - server.open: true akan auto-buka browser saat npm run dev
 */
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  publicDir: false,
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
