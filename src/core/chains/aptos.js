/**
 * aptos.js — Aptos Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Aptos juga dari tim ex-Meta/Diem (sama seperti Sui, tapi beda tim).
 * 
 * KENAPA APTOS PENTING?
 * - Airdrop APT token sangat besar (senilai ribuan dollar per wallet)
 * - Ekosistem DeFi & NFT aktif
 * - Banyak protocol belum launch token
 * 
 * KARAKTERISTIK TEKNIS:
 * 1. Kurva: Ed25519 (sama seperti Sui & Solana)
 * 
 * 2. Address Format: 0x + 64 hex chars
 *    - Mirip Sui, tapi cara derivasinya beda
 *    - Contoh: "0x1234abcd..."
 * 
 * 3. Cara Derivasi:
 *    a. Generate Ed25519 keypair
 *    b. Public key + scheme byte (0x00) → SHA3-256 hash
 *    c. Hash result = address
 *    - Note: Aptos pakai SHA3-256, Sui pakai BLAKE2b-256
 * 
 * 4. Move Language:
 *    - Smart contract di Aptos ditulis dalam Move (bukan Solidity)
 *    - Lebih aman karena resource-oriented programming
 */

import nacl from 'tweetnacl';

/**
 * SHA3-256 hash function (manual implementation menggunakan Node.js crypto)
 * Aptos menggunakan SHA3-256 untuk derivasi address dari public key
 */
async function sha3_256(data) {
  const crypto = await import('crypto');
  return crypto.createHash('sha3-256').update(Buffer.from(data)).digest();
}

/**
 * Generate 1 Aptos wallet baru
 * 
 * @returns {Object} Wallet data:
 *   - address: string (0x...)      → Aptos address (66 chars)
 *   - privateKey: string (hex)     → Ed25519 private key (32 bytes)
 *   - publicKey: string (hex)      → Ed25519 public key (32 bytes)
 *   - chain: string                → 'aptos'
 * 
 * PROSES:
 * 1. nacl.sign.keyPair() → generate Ed25519 keypair (64 byte secretKey)
 * 2. Ambil 32 bytes pertama secretKey = private key seed
 * 3. Gabung public key + 0x00 (Ed25519 scheme identifier)
 * 4. SHA3-256 hash → hasilnya jadi address
 */
export async function generateWallet() {
  // Step 1: Generate Ed25519 keypair
  // nacl (TweetNaCl) = implementasi ringan dari NaCl crypto library
  // secretKey = 64 bytes (32 seed + 32 public key)
  const keypair = nacl.sign.keyPair();

  // Step 2: Private key = 32 bytes pertama dari secretKey
  const privateKeyHex = Buffer.from(keypair.secretKey.slice(0, 32)).toString('hex');
  const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');

  // Step 3: Derive Aptos address
  // Address = SHA3-256(public_key + 0x00)
  // 0x00 = scheme byte untuk Ed25519
  // Byte terakhir ini menandakan algoritma yang digunakan
  const authKeyInput = new Uint8Array([...keypair.publicKey, 0x00]);
  const hashBytes = await sha3_256(authKeyInput);
  const address = '0x' + Buffer.from(hashBytes).toString('hex');

  return {
    address: address,
    privateKey: '0x' + privateKeyHex,
    publicKey: '0x' + publicKeyHex,
    chain: 'aptos',
  };
}

export const chainInfo = {
  name: 'Aptos',
  fullName: 'Aptos (APT)',
  curve: 'Ed25519',
  addressFormat: '0x + 64 hex characters',
  features: [
    'Ed25519 cryptographic curve',
    'SHA3-256 address derivation',
    'Move-based smart contracts',
    'High-value airdrop history',
  ],
};
