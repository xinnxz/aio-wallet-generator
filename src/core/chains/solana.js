/**
 * solana.js — Solana Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Solana BERBEDA dari EVM dalam beberapa hal fundamental:
 * 
 * 1. Kurva Kriptografi: Ed25519 (bukan secp256k1)
 *    - Ed25519 = EdDSA signature scheme based on Twisted Edwards curve
 *    - Lebih cepat untuk signing & verification dibanding secp256k1
 *    - Ini alasan Solana bisa process 65K+ TPS (transactions per second)
 * 
 * 2. Format Address: Base58
 *    - Mirip Base64 tapi tanpa karakter ambigu (0/O, I/l)
 *    - Contoh: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgBkV"
 *    - Panjang: 32-44 karakter
 * 
 * 3. Private Key: 64 bytes (bukan 32 seperti EVM)
 *    - 32 bytes pertama = seed (secret key)
 *    - 32 bytes terakhir = public key
 *    - Total: 64 bytes = keypair lengkap
 * 
 * 4. Tidak ada Mnemonic bawaan
 *    - Keypair.generate() langsung buat random keypair
 *    - Untuk mnemonic support, perlu library tambahan
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Generate 1 Solana wallet baru
 * 
 * @returns {Object} Wallet data:
 *   - address: string (Base58)        → Public key sebagai address
 *   - privateKey: string (Base58)     → Secret key dalam format Base58
 *   - secretKeyArray: string          → Secret key sebagai JSON array (format Phantom)
 *   - chain: string                   → 'solana'
 */
export function generateWallet() {
  // Keypair.generate() melakukan:
  // 1. Generate 32 bytes random seed
  // 2. Derive Ed25519 keypair (public + secret key)
  // Public key = address di Solana
  const keypair = Keypair.generate();

  // Convert ke Base58 — format standar yang dipakai wallet Solana (Phantom, Solflare)
  // bs58 = Base58 encoding, menghilangkan karakter yang mudah tertukar
  const privateKeyBase58 = bs58.encode(keypair.secretKey);

  return {
    address: keypair.publicKey.toBase58(),
    privateKey: privateKeyBase58,
    // Format array berguna untuk import ke Phantom wallet
    // Phantom minta secret key dalam format [1,2,3,...] (Uint8Array as JSON)
    secretKeyArray: JSON.stringify(Array.from(keypair.secretKey)),
    chain: 'solana',
  };
}

/**
 * Generate wallet dari secret key bytes
 * @param {Uint8Array} secretKey - 64 bytes secret key
 */
export function generateFromSecretKey(secretKey) {
  const keypair = Keypair.fromSecretKey(secretKey);
  return {
    address: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey),
    secretKeyArray: JSON.stringify(Array.from(keypair.secretKey)),
    chain: 'solana',
  };
}

/**
 * Metadata chain
 */
export const chainInfo = {
  name: 'Solana',
  fullName: 'Solana',
  curve: 'Ed25519',
  addressFormat: 'Base58 encoded public key (32-44 chars)',
  features: [
    'Ed25519 cryptographic curve (faster than secp256k1)',
    'Base58 address format',
    'Secret key exportable as JSON array (Phantom-compatible)',
    '65,000+ TPS capability',
  ],
};
