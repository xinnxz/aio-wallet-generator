/**
 * batch.js — Batch Processing Engine (Chunked)
 * 
 * PENJELASAN:
 * ==========
 * Ketika generate 10.000 wallet sekaligus, kita TIDAK bisa generate
 * semuanya dalam 1 loop karena:
 * 
 * 1. MEMORY: 10K wallet × ~1KB data = ~10MB di memory
 *    Kalau generate sekaligus, bisa spike ke 200MB+ karena overhead
 *    → Solusi: Process per "chunk" (batch), flush hasilnya, lalu lanjut
 * 
 * 2. RESPONSIVENESS: User butuh feedback progress
 *    → Solusi: Emit event setiap chunk selesai
 * 
 * 3. ERROR RECOVERY: Kalau gagal di wallet ke-5000, 
 *    tanpa chunking = semua hilang
 *    → Solusi: Simpan per chunk, jadi data sebelumnya aman
 * 
 * CHUNK SIZE DEFAULT: 500 wallet
 * - Cukup besar untuk efisien (tidak terlalu banyak overhead per chunk)
 * - Cukup kecil untuk kontrol memory & progress feedback
 * 
 * ANALOGI:
 * Bayangkan kirim 10.000 surat:
 * - Tanpa chunk: tulis semua 10K surat dulu, baru kirim → butuh meja sangat besar
 * - Dengan chunk: tulis 500 surat, kirim, tulis 500 lagi, kirim → meja kecil cukup
 */

import { generateWallets } from './generator.js';
import { BATCH_CONFIG } from '../utils/config.js';
import logger from '../utils/logger.js';

/**
 * Process wallet generation dalam chunks
 * 
 * @param {string} chain - Nama chain
 * @param {number} totalCount - Total wallet yang mau di-generate
 * @param {Object} options - Opsi
 * @param {number} options.chunkSize - Ukuran per chunk (default: 500)
 * @param {Function} options.onChunkComplete - Callback saat 1 chunk selesai
 * @param {Function} options.onProgress - Callback progress per wallet
 * @param {Function} options.onComplete - Callback saat semua selesai
 * @returns {Promise<Array>} Semua wallet yang di-generate
 * 
 * ALUR:
 * 1. Hitung jumlah chunk (10000 ÷ 500 = 20 chunks)
 * 2. Loop per chunk:
 *    a. Generate 500 wallet
 *    b. Gabung ke hasil keseluruhan
 *    c. Panggil onChunkComplete callback
 *    d. Log progress
 * 3. Return semua wallet
 */
export async function processBatch(chain, totalCount, options = {}) {
  const chunkSize = options.chunkSize || BATCH_CONFIG.defaultChunkSize;
  const totalChunks = Math.ceil(totalCount / chunkSize);
  
  let allWallets = [];
  const startTime = Date.now();

  logger.info(`Starting batch generation: ${totalCount} ${chain.toUpperCase()} wallets`);
  logger.info(`Chunk size: ${chunkSize} | Total chunks: ${totalChunks}`);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    // Hitung berapa wallet di chunk ini
    // Chunk terakhir mungkin lebih kecil (misal: 10000 mod 500 = 0, tapi bisa sisa)
    const remaining = totalCount - allWallets.length;
    const currentChunkSize = Math.min(chunkSize, remaining);

    // Generate chunk
    const chunkWallets = await generateWallets(chain, currentChunkSize, {
      onProgress: (progress) => {
        // Adjust progress numbers to reflect overall progress
        if (options.onProgress) {
          options.onProgress({
            current: allWallets.length + progress.current,
            total: totalCount,
            percentage: ((allWallets.length + progress.current) / totalCount * 100).toFixed(1),
            chain: chain,
            chunk: chunkIndex + 1,
            totalChunks: totalChunks,
          });
        }
      },
    });

    // Re-index wallet numbers (global index, bukan per-chunk)
    chunkWallets.forEach((wallet, i) => {
      wallet.index = allWallets.length + i + 1;
    });

    // Gabungkan ke hasil keseluruhan
    allWallets = allWallets.concat(chunkWallets);

    // Callback per chunk
    if (options.onChunkComplete) {
      options.onChunkComplete({
        chunkIndex: chunkIndex + 1,
        totalChunks: totalChunks,
        chunkWallets: chunkWallets,
        totalGenerated: allWallets.length,
        totalTarget: totalCount,
      });
    }

    // Log progress
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (allWallets.length / elapsed * 1).toFixed(0);
    logger.debug(
      `Chunk ${chunkIndex + 1}/${totalChunks} complete | ` +
      `${allWallets.length}/${totalCount} wallets | ` +
      `${elapsed}s elapsed | ${rate} wallets/sec`
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const walletsPerSec = (totalCount / totalTime).toFixed(0);

  logger.success(
    `Batch complete! Generated ${totalCount} ${chain.toUpperCase()} wallets ` +
    `in ${totalTime}s (${walletsPerSec} wallets/sec)`
  );

  // Callback akhir
  if (options.onComplete) {
    options.onComplete({
      wallets: allWallets,
      totalCount: totalCount,
      timeSeconds: parseFloat(totalTime),
      walletsPerSecond: parseInt(walletsPerSec),
      chain: chain,
    });
  }

  return allWallets;
}

/**
 * Process multi-chain batch
 * Generate wallet untuk beberapa chain sekaligus
 * 
 * @param {string[]} chains - Array nama chain
 * @param {number} countPerChain - Jumlah per chain
 * @param {Object} options - Opsi
 * @returns {Promise<Object>} { chainName: [wallets], ... }
 */
export async function processMultiChainBatch(chains, countPerChain, options = {}) {
  const results = {};

  for (const chain of chains) {
    results[chain] = await processBatch(chain, countPerChain, options);
  }

  return results;
}
