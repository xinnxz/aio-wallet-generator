/**
 * hd-wallet.js — HD (Hierarchical Deterministic) Wallet Derivation
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * HD Wallet adalah teknologi yang memungkinkan generate BANYAK wallet
 * dari SATU mnemonic phrase (seed phrase).
 * 
 * KENAPA HD WALLET PENTING?
 * - Backup cukup 1 mnemonic → recover SEMUA wallet
 * - Tidak perlu simpan ribuan private key terpisah
 * - Standard industri (BIP32/BIP39/BIP44)
 * 
 * BIP39: Mnemonic → Seed
 * - 12 kata random dari wordlist 2048 kata
 * - Contoh: "abandon ability able about above absent absorb abstract absurd abuse access accident"
 * - Mnemonic + optional passphrase → PBKDF2 (2048 iterasi) → 512-bit seed
 * 
 * BIP32: Hierarchical Key Derivation
 * - Dari 1 master key, derive child keys secara hierarki
 * - Setiap level punya index (0, 1, 2, ...)
 * - ' (hardened) = lebih aman, child key tidak bisa dibalik ke parent
 * 
 * BIP44: Standard Path Convention
 * Format: m / 44' / coin_type' / account' / change / address_index
 * 
 * Contoh:
 * m/44'/60'/0'/0/0  → Ethereum wallet pertama
 * m/44'/60'/0'/0/1  → Ethereum wallet kedua
 * m/44'/60'/0'/0/2  → Ethereum wallet ketiga
 * ...
 * m/44'/501'/0'/0'  → Solana wallet pertama
 * m/44'/0'/0'/0/0   → Bitcoin wallet pertama
 */

import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP44_PATHS } from '../utils/config.js';
import * as evmChain from './chains/evm.js';

const bip32 = BIP32Factory(ecc);

/**
 * Generate mnemonic phrase baru (12 kata)
 * 
 * PROSES:
 * 1. Generate 128 bits random entropy (16 bytes)
 * 2. SHA-256 hash entropy → ambil 4 bit pertama = checksum
 * 3. Gabung entropy + checksum = 132 bits
 * 4. Bagi 132 bits menjadi 12 grup × 11 bits
 * 5. Setiap 11-bit angka (0-2047) → lookup di wordlist = 1 kata
 * 6. Hasilnya: 12 kata mnemonic
 * 
 * @returns {string} 12-word mnemonic phrase
 */
export function generateMnemonic() {
  return bip39.generateMnemonic();
}

/**
 * Validate mnemonic phrase
 * Cek apakah kata-katanya valid dan checksum-nya benar
 * 
 * @param {string} mnemonic - Mnemonic phrase
 * @returns {boolean} true jika valid
 */
export function validateMnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Generate banyak EVM wallet dari 1 mnemonic
 * 
 * @param {string} mnemonic - 12/24 kata mnemonic
 * @param {number} count - Jumlah wallet yang mau di-generate
 * @param {string} chain - Chain type ('evm', 'bitcoin', dll)
 * @returns {Array<Object>} Array of wallet data
 * 
 * PENJELASAN:
 * Dari 1 mnemonic, kita derive wallet berbeda dengan mengubah index:
 * m/44'/60'/0'/0/0 → Wallet #1
 * m/44'/60'/0'/0/1 → Wallet #2
 * m/44'/60'/0'/0/2 → Wallet #3
 * ...dan seterusnya
 * 
 * Setiap wallet punya private key & address yang BERBEDA,
 * tapi semuanya bisa di-recover dari mnemonic yang SAMA.
 */
export function deriveWallets(mnemonic, count, chain = 'evm') {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const wallets = [];
  const basePath = BIP44_PATHS[chain] || BIP44_PATHS.evm;

  for (let i = 0; i < count; i++) {
    let wallet;

    switch (chain) {
      case 'evm':
        wallet = evmChain.generateFromMnemonic(mnemonic, i);
        break;

      // Untuk chain lain yang support HD derivation
      case 'bitcoin': {
        // Lazy import untuk menghindari circular dependency
        const btc = await import('./chains/bitcoin.js');
        wallet = btc.generateFromMnemonic(mnemonic, i);
        break;
      }

      case 'tron': {
        const tron = await import('./chains/tron.js');
        wallet = tron.generateFromMnemonic(mnemonic, i);
        break;
      }

      default:
        // Fallback: gunakan EVM derivation
        wallet = evmChain.generateFromMnemonic(mnemonic, i);
        wallet.chain = chain;
    }

    wallet.hdIndex = i;
    wallet.isHD = true;
    wallet.masterMnemonic = mnemonic;
    wallets.push(wallet);
  }

  return wallets;
}

/**
 * ASYNC version — untuk chain yang butuh async generation
 */
export async function deriveWalletsAsync(mnemonic, count, chain = 'evm') {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const wallets = [];

  for (let i = 0; i < count; i++) {
    let wallet;

    switch (chain) {
      case 'evm':
        wallet = evmChain.generateFromMnemonic(mnemonic, i);
        break;

      case 'bitcoin': {
        const btc = await import('./chains/bitcoin.js');
        wallet = btc.generateFromMnemonic(mnemonic, i);
        break;
      }

      case 'tron': {
        const tron = await import('./chains/tron.js');
        wallet = tron.generateFromMnemonic(mnemonic, i);
        break;
      }

      default:
        wallet = evmChain.generateFromMnemonic(mnemonic, i);
        wallet.chain = chain;
    }

    wallet.hdIndex = i;
    wallet.isHD = true;
    wallet.masterMnemonic = mnemonic;
    wallets.push(wallet);
  }

  return wallets;
}

/**
 * Info tentang HD wallet support per chain
 */
export const hdInfo = {
  fullSupport: ['evm', 'bitcoin', 'tron'],  // BIP44 support penuh
  keyPairOnly: ['solana', 'sui', 'aptos', 'ton'],  // Generate keypair saja
  custom: ['cosmos', 'starknet'],  // Derivation custom
  
  description: `
    HD Wallet memungkinkan derive banyak wallet dari 1 seed phrase.
    - Full BIP44 support: EVM, Bitcoin, Tron
    - Keypair generation: Solana, Sui, Aptos, TON
    - Custom derivation: Cosmos, Starknet
  `,
};
