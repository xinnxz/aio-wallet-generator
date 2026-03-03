/**
 * generator.js — Core Wallet Generation Orchestrator
 * 
 * PENJELASAN:
 * ==========
 * File ini adalah "otak" dari wallet generation.
 * Menggunakan STRATEGY PATTERN — design pattern OOP dimana:
 * - Ada 1 interface umum (generate wallet)
 * - Setiap chain punya implementasi sendiri
 * - Generator memilih strategy berdasarkan chain yang dipilih
 * 
 * Ini membuat code modular & mudah di-extend:
 * Mau tambah chain baru? Cukup tambah 1 file di chains/ folder.
 */

import * as evmChain from './chains/evm.js';
import * as solanaChain from './chains/solana.js';
import * as bitcoinChain from './chains/bitcoin.js';
import * as tronChain from './chains/tron.js';
import * as suiChain from './chains/sui.js';
import * as aptosChain from './chains/aptos.js';
import * as cosmosChain from './chains/cosmos.js';
import * as tonChain from './chains/ton.js';
import * as starknetChain from './chains/starknet.js';
import logger from '../utils/logger.js';

/**
 * Registry semua chain handlers
 * 
 * Key = nama chain (dipakai di CLI: --chain evm)
 * Value = module yang punya fungsi generateWallet()
 * 
 * STRATEGY PATTERN:
 * Setiap handler punya interface yang sama:
 * - generateWallet() → { address, privateKey, chain, ... }
 * - chainInfo → { name, curve, features, ... }
 */
const CHAIN_HANDLERS = {
  evm: evmChain,
  solana: solanaChain,
  bitcoin: bitcoinChain,
  tron: tronChain,
  sui: suiChain,
  aptos: aptosChain,
  cosmos: cosmosChain,
  ton: tonChain,
  starknet: starknetChain,
};

/**
 * Get daftar semua chain yang didukung
 * @returns {string[]} Array nama chain
 */
export function getSupportedChains() {
  return Object.keys(CHAIN_HANDLERS);
}

/**
 * Get chain handler berdasarkan nama
 * @param {string} chain - Nama chain (evm, solana, dll)
 * @returns {Object} Chain handler module
 */
export function getChainHandler(chain) {
  const handler = CHAIN_HANDLERS[chain.toLowerCase()];
  if (!handler) {
    throw new Error(
      `Unsupported chain: ${chain}. ` +
      `Supported chains: ${getSupportedChains().join(', ')}`
    );
  }
  return handler;
}

/**
 * Generate wallet untuk chain tertentu
 * 
 * @param {string} chain - Nama chain
 * @param {number} count - Jumlah wallet
 * @param {Object} options - Opsi tambahan
 * @param {Function} options.onProgress - Callback saat progress update
 * @returns {Promise<Array>} Array of wallet objects
 * 
 * ALUR:
 * 1. Pilih chain handler yang sesuai
 * 2. Loop sebanyak count, generate wallet per iterasi
 * 3. Emit progress event setiap beberapa wallet
 * 4. Return semua wallet
 */
export async function generateWallets(chain, count, options = {}) {
  const handler = getChainHandler(chain);
  const { onProgress } = options;
  const wallets = [];

  logger.debug(`Starting generation of ${count} ${chain} wallets`);

  for (let i = 0; i < count; i++) {
    // Generate 1 wallet
    // Beberapa chain (aptos, cosmos) punya async generateWallet
    const wallet = await Promise.resolve(handler.generateWallet());

    // Tambah metadata
    wallet.index = i + 1;
    wallet.timestamp = new Date().toISOString();

    wallets.push(wallet);

    // Emit progress callback (jika ada)
    // Callback ini dipakai oleh CLI (update spinner) atau Web (update progress bar)
    if (onProgress && (i + 1) % 10 === 0) {
      onProgress({
        current: i + 1,
        total: count,
        percentage: ((i + 1) / count * 100).toFixed(1),
        chain: chain,
      });
    }
  }

  // Progress callback terakhir (100%)
  if (onProgress) {
    onProgress({
      current: count,
      total: count,
      percentage: '100.0',
      chain: chain,
    });
  }

  return wallets;
}

/**
 * Generate wallet untuk BANYAK chain sekaligus
 * 
 * @param {string[]} chains - Array nama chain
 * @param {number} countPerChain - Jumlah wallet per chain
 * @param {Object} options - Opsi tambahan
 * @returns {Promise<Object>} Object { chainName: [wallets], ... }
 * 
 * Contoh: generateMultiChain(['evm', 'solana'], 100)
 * → { evm: [100 wallets], solana: [100 wallets] }
 */
export async function generateMultiChain(chains, countPerChain, options = {}) {
  const results = {};

  for (const chain of chains) {
    logger.info(`Generating ${countPerChain} ${chain.toUpperCase()} wallets...`);
    results[chain] = await generateWallets(chain, countPerChain, options);
  }

  return results;
}

/**
 * Get info tentang chain tertentu
 */
export function getChainInfo(chain) {
  const handler = getChainHandler(chain);
  return handler.chainInfo || { name: chain, features: [] };
}

/**
 * Get info tentang SEMUA chains
 */
export function getAllChainInfo() {
  const info = {};
  for (const [name, handler] of Object.entries(CHAIN_HANDLERS)) {
    info[name] = handler.chainInfo || { name, features: [] };
  }
  return info;
}
