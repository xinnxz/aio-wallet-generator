/**
 * sw.js — Service Worker for PWA
 * 
 * Cache Strategy: Cache-First with Network Fallback
 * 
 * Cara kerja:
 * 1. INSTALL: Pre-cache semua halaman & assets utama
 * 2. FETCH: Coba ambil dari cache dulu → kalau ga ada, fetch dari network
 * 3. ACTIVATE: Hapus cache lama saat SW di-update
 * 
 * Ini yang bikin app bisa jalan OFFLINE setelah pertama kali dikunjungi.
 */

const CACHE_NAME = 'aio-chain-v1';

// Daftar file yang di-cache saat install
const PRECACHE = [
  '/',
  '/index.html',
  '/validator.html',
  '/converter.html',
  '/encrypt.html',
  '/qrcode.html',
  '/hdwallet.html',
  '/bulktools.html',
  '/paperwallet.html',
  '/chains.html',
  '/style.css',
  '/nav.js',
  '/app.js',
  '/validator.js',
  '/converter.js',
  '/encrypt.js',
  '/qrcode-page.js',
  '/hdwallet.js',
  '/bulktools.js',
  '/paperwallet.js',
  '/chains.js',
  '/images/eth.png',
  '/images/sol.png',
  '/images/btc.png',
  '/images/trx.png',
  '/images/sui.jpeg',
  '/images/apt.png',
  '/images/atom.png',
  '/images/ton.png',
  '/images/strk.png',
];

// INSTALL — pre-cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE — cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH — cache first, network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and CDN requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // For CDN resources (ethers, qrcode, jszip, hugeicons) — network first
  if (url.hostname !== location.hostname) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For local resources — cache first
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
  );
});
