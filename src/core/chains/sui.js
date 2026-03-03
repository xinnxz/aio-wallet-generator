/**
 * sui.js — Sui Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Sui adalah blockchain Layer 1 generasi baru dari Mysten Labs (ex-Meta/Diem).
 * 
 * KENAPA SUI PENTING UNTUK AIRDROP?
 * - Sui sering melakukan airdrop ke early adopters
 * - Ekosistem DeFi-nya berkembang pesat
 * - Banyak protocol di Sui yang belum launch token
 * 
 * KARAKTERISTIK TEKNIS:
 * 1. Kurva: Ed25519 (sama seperti Solana)
 *    - Lebih cepat & efisien dibanding secp256k1
 * 
 * 2. Address Format: 0x + 64 hex chars (32 bytes)
 *    - Mirip format EVM tapi lebih panjang
 *    - Contoh: "0x2b5a7ee0c29c2fe84dc5b3..."
 * 
 * 3. Cara Derivasi Address:
 *    a. Generate Ed25519 keypair (32 bytes private, 32 bytes public)
 *    b. Hash public key dengan BLAKE2b-256
 *    c. Tambahkan scheme flag (0x00 untuk Ed25519)
 *    d. Hash lagi → hasilnya jadi address
 * 
 * 4. Sui menggunakan object-centric model (bukan account-based seperti EVM)
 *    - Setiap "coin" adalah object tersendiri
 *    - Ini memungkinkan parallel transaction execution
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

/**
 * Generate 1 Sui wallet baru
 * 
 * @returns {Object} Wallet data:
 *   - address: string (0x...)      → Sui address (66 chars)
 *   - privateKey: string (hex)     → Ed25519 private key
 *   - publicKey: string (hex)      → Ed25519 public key
 *   - chain: string                → 'sui'
 */
export function generateWallet() {
  // Ed25519Keypair.generate() melakukan:
  // 1. Generate 32 bytes random seed
  // 2. Derive Ed25519 keypair
  // 3. Compute Sui address dari public key
  const keypair = new Ed25519Keypair();

  return {
    address: keypair.getPublicKey().toSuiAddress(),
    // Export private key dalam format yang bisa di-import ke Sui wallet
    privateKey: keypair.getSecretKey(),
    publicKey: keypair.getPublicKey().toBase64(),
    chain: 'sui',
  };
}

/**
 * Metadata chain
 */
export const chainInfo = {
  name: 'Sui',
  fullName: 'Sui Network',
  curve: 'Ed25519',
  addressFormat: '0x + 64 hex characters (32 bytes)',
  features: [
    'Ed25519 cryptographic curve',
    'Object-centric model (parallel execution)',
    'High throughput blockchain',
    'Active airdrop ecosystem',
  ],
};
