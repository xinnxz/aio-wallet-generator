/**
 * evm.js — EVM Chain Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * EVM = Ethereum Virtual Machine. Semua chain yang compatible dengan EVM
 * menggunakan format kunci kriptografi yang SAMA:
 * 
 * 1. Private Key: 32 bytes random number (256-bit)
 *    - Ini adalah "password" wallet kamu
 *    - Siapapun yang punya private key = punya akses penuh ke wallet
 * 
 * 2. Public Key: diturunkan dari private key menggunakan kurva secp256k1
 *    - Ini proses satu arah (tidak bisa balik dari public ke private)
 *    - secp256k1 = kurva eliptik yang dipakai Bitcoin & Ethereum
 * 
 * 3. Address: 20 bytes terakhir dari Keccak-256 hash public key
 *    - Format: 0x + 40 karakter hex (contoh: 0x742d35Cc6634C0532925a3b844Bc9e7595f...)
 *    - Inilah yang kamu share ke orang lain untuk terima transfer
 * 
 * 4. Mnemonic: 12 atau 24 kata dari wordlist BIP39
 *    - Cara human-readable untuk backup private key
 *    - Dari mnemonic bisa derive BANYAK private key (HD wallet)
 * 
 * KENAPA 1 WALLET = SEMUA EVM CHAINS?
 * Karena semua EVM chains (Ethereum, BSC, Polygon, dll) menggunakan 
 * algoritma yang persis sama. Jadi private key yang sama = address yang sama
 * di Ethereum, BSC, Polygon, Arbitrum, dll.
 * 
 * Yang berbeda hanya "network" tempat kamu connect (chainId).
 */

import { ethers } from 'ethers';
import { EVM_CHAINS } from '../../utils/config.js';

/**
 * Generate 1 EVM wallet baru
 * 
 * @returns {Object} Wallet data:
 *   - address: string (0x...)       → alamat publik
 *   - privateKey: string (0x...)    → kunci privat (RAHASIA!)
 *   - mnemonic: string              → 12 kata backup phrase
 *   - path: string                  → BIP44 derivation path
 *   - chain: string                 → 'evm'
 *   - networks: Array               → daftar semua EVM chain yang compatible
 */
export function generateWallet() {
  // ethers.Wallet.createRandom() melakukan semua langkah otomatis:
  // 1. Generate 128-bit entropy (random bytes)
  // 2. Encode entropy menjadi 12-word mnemonic (BIP39)
  // 3. Mnemonic → Seed (via PBKDF2 dengan 2048 iterasi)
  // 4. Seed → Private Key (via BIP32 derivation path m/44'/60'/0'/0/0)
  // 5. Private Key → Public Key (via secp256k1 curve multiplication)
  // 6. Public Key → Address (via Keccak-256 hash, ambil 20 bytes terakhir)
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
    path: wallet.mnemonic.path || "m/44'/60'/0'/0/0",
    chain: 'evm',
    // Alamat yang sama valid di semua EVM chains berikut:
    networks: EVM_CHAINS.map(c => c.name),
  };
}

/**
 * Generate wallet dari mnemonic phrase yang sudah ada
 * Berguna untuk HD wallet derivation (1 mnemonic → banyak wallet)
 * 
 * @param {string} mnemonic - 12/24 kata mnemonic phrase
 * @param {number} index - Nomor index wallet (0, 1, 2, ...)
 * @returns {Object} Wallet data
 * 
 * PENJELASAN PATH:
 * m/44'/60'/0'/0/INDEX
 * │  │   │   │ │  └── INDEX: wallet ke-berapa (0, 1, 2, ...)
 * │  │   │   │ └──── 0 = external (menerima), 1 = change
 * │  │   │   └────── 0 = account pertama
 * │  │   └────────── 60 = coin type Ethereum (semua EVM)
 * │  └────────────── 44 = BIP44 standard
 * └──────────────── m = master key
 */
export function generateFromMnemonic(mnemonic, index = 0) {
  // Derive wallet dari mnemonic + index tertentu
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: mnemonic,
    path: path,
    index: index,
    chain: 'evm',
    networks: EVM_CHAINS.map(c => c.name),
  };
}

/**
 * Metadata tentang chain ini (dipakai untuk CLI info command)
 */
export const chainInfo = {
  name: 'EVM',
  fullName: 'Ethereum Virtual Machine (All Compatible Chains)',
  curve: 'secp256k1',
  addressFormat: '0x + 40 hex characters (42 total)',
  networks: EVM_CHAINS,
  features: [
    '1 wallet works on ALL 22 EVM networks',
    'HD wallet support (BIP44 derivation)',
    'EIP-55 checksum addresses',
    '12-word mnemonic backup',
  ],
};
