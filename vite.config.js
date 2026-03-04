/**
 * vite.config.js — Vite Configuration for Web Dashboard
 * 
 * PENJELASAN:
 * - root: 'web' artinya Vite serve files dari folder web/
 * - publicDir: false karena kita tidak pakai public folder terpisah
 * - server.open: true akan auto-buka browser saat npm run dev
 * - build.rollupOptions.input: daftar semua HTML pages agar vite build
 *   include semua halaman (bukan cuma index.html)
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

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
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'web/index.html'),
        validator:   resolve(__dirname, 'web/validator.html'),
        converter:   resolve(__dirname, 'web/converter.html'),
        encrypt:     resolve(__dirname, 'web/encrypt.html'),
        qrcode:      resolve(__dirname, 'web/qrcode.html'),
        hdwallet:    resolve(__dirname, 'web/hdwallet.html'),
        bulktools:   resolve(__dirname, 'web/bulktools.html'),
        paperwallet: resolve(__dirname, 'web/paperwallet.html'),
        chains:      resolve(__dirname, 'web/chains.html'),
      },
    },
  },
});
