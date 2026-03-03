/**
 * bitcoin.js — Bitcoin Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Bitcoin adalah cryptocurrency pertama dan menggunakan beberapa format address:
 * 
 * 1. Legacy (P2PKH) — dimulai dengan "1"
 *    - Format asli Bitcoin dari 2009
 *    - Pay-to-Public-Key-Hash
 *    - Contoh: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
 *    - Fee paling mahal, tapi paling compatible
 * 
 * 2. SegWit/P2SH (P2SH-P2WPKH) — dimulai dengan "3"
 *    - Segregated Witness wrapped in Script Hash
 *    - Contoh: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"
 *    - Fee lebih murah ~30% dari Legacy
 * 
 * 3. Native SegWit (Bech32) — dimulai dengan "bc1q"
 *    - Format paling modern & efisien
 *    - Contoh: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
 *    - Fee paling murah, recommended untuk penggunaan sehari-hari
 * 
 * ALUR PEMBUATAN:
 * Mnemonic → Seed → Master Key → BIP44 Path → Child Key → Address
 * 
 * BIP44 Bitcoin Path: m/44'/0'/0'/0/0
 * - 44' = BIP44 standard
 * - 0'  = Bitcoin coin type
 * - 0'  = Account pertama
 * - 0   = External chain (receiving addresses)
 * - 0   = Index pertama
 */

import * as bitcoin from 'bitcoinjs-lib';
import bip39Pkg from 'bip39';
import BIP32Pkg from 'bip32';
import * as ecc from 'tiny-secp256k1';
import ECPairPkg from 'ecpair';

// Handle ESM/CJS interop — beberapa package ini aslinya CommonJS
// Saat di-import via ESM, exports-nya terbungkus dalam .default
const bip39 = bip39Pkg.default || bip39Pkg;
const BIP32Factory = BIP32Pkg.BIP32Factory || BIP32Pkg.default || BIP32Pkg;
const ECPairFactory = ECPairPkg.ECPairFactory || ECPairPkg.default || ECPairPkg;

// Initialize BIP32 dan ECPair dengan secp256k1 implementation
// tiny-secp256k1 = implementasi cepat dari kurva secp256k1
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

/**
 * Generate 1 Bitcoin wallet baru dengan semua 3 format address
 * 
 * @param {string} [addressType='all'] - 'legacy', 'segwit', 'native', atau 'all'
 * @returns {Object} Wallet data
 */
export function generateWallet(addressType = 'all') {
  // Step 1: Generate random mnemonic (12 kata)
  // BIP39 mengkonversi entropy random menjadi kata-kata yang mudah diingat
  const mnemonic = bip39.generateMnemonic();

  // Step 2: Mnemonic → Seed (512-bit)
  // PBKDF2 dengan 2048 iterasi digunakan untuk derivasi
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Step 3: Seed → HD Master Key
  // BIP32 Hierarchical Deterministic key derivation
  const root = bip32.fromSeed(seed);

  // Step 4: Derive child key menggunakan BIP44 path
  // m/44'/0'/0'/0/0 = wallet Bitcoin pertama
  const child = root.derivePath("m/44'/0'/0'/0/0");

  // Step 5: Buat keypair dari child key
  const keyPair = ECPair.fromPrivateKey(child.privateKey);
  const privateKeyWIF = keyPair.toWIF();

  // Step 6: Generate addresses berdasarkan type
  const result = {
    privateKey: privateKeyWIF,     // WIF = Wallet Import Format (Base58Check encoded)
    mnemonic: mnemonic,
    path: "m/44'/0'/0'/0/0",
    chain: 'bitcoin',
  };

  /**
   * Generate SEMUA format address dari public key yang sama
   * 
   * WIF (Wallet Import Format):
   * Format standar untuk export/import private key Bitcoin
   * Prefix: '5' (uncompressed), 'K'/'L' (compressed) untuk mainnet
   */
  if (addressType === 'legacy' || addressType === 'all') {
    // P2PKH: Hash160(pubkey) → Base58Check
    const { address: legacyAddress } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
    });
    result.legacy = legacyAddress;
  }

  if (addressType === 'segwit' || addressType === 'all') {
    // P2SH-P2WPKH: SegWit wrapped dalam Script Hash
    const { address: segwitAddress } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey }),
    });
    result.segwit = segwitAddress;
  }

  if (addressType === 'native' || addressType === 'all') {
    // P2WPKH: Native SegWit (Bech32 encoding)
    const { address: nativeAddress } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
    });
    result.native = nativeAddress;
  }

  // Set address utama (preferensi: native > segwit > legacy)
  result.address = result.native || result.segwit || result.legacy;

  return result;
}

/**
 * Generate Bitcoin wallet dari mnemonic yang sudah ada
 */
export function generateFromMnemonic(mnemonic, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const path = `m/44'/0'/0'/0/${index}`;
  const child = root.derivePath(path);
  const keyPair = ECPair.fromPrivateKey(child.privateKey);

  const { address: nativeAddress } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
  });

  const { address: legacyAddress } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
  });

  return {
    address: nativeAddress,
    legacy: legacyAddress,
    native: nativeAddress,
    privateKey: keyPair.toWIF(),
    mnemonic: mnemonic,
    path: path,
    index: index,
    chain: 'bitcoin',
  };
}

export const chainInfo = {
  name: 'Bitcoin',
  fullName: 'Bitcoin (BTC)',
  curve: 'secp256k1',
  addressFormat: 'Legacy (1...), SegWit (3...), Native SegWit (bc1q...)',
  features: [
    '3 address formats: Legacy, SegWit, Native SegWit',
    'BIP39 mnemonic support',
    'BIP44 HD wallet derivation',
    'WIF private key format',
  ],
};
