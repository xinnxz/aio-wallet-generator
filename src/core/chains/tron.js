/**
 * tron.js — Tron Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Tron secara teknis MIRIP dengan Ethereum karena:
 * - Sama-sama pakai kurva secp256k1
 * - Proses derivasi kunci sama (private key → public key → address)
 * 
 * PERBEDAAN UTAMA:
 * 1. Format Address:
 *    - Ethereum: 0x + hex (contoh: 0x742d35Cc6634C0532...)
 *    - Tron: Base58Check dimulai dengan "T" (contoh: "TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW")
 * 
 * 2. Proses pembuatan address Tron:
 *    a. Generate private key (32 bytes random, sama seperti ETH)
 *    b. Derive public key via secp256k1 (sama seperti ETH)
 *    c. Keccak-256 hash public key (sama seperti ETH)
 *    d. Ambil 20 bytes terakhir (sama seperti ETH)
 *    e. Tambahkan prefix 0x41 (BERBEDA! ETH pakai 0x)
 *    f. Base58Check encode (BERBEDA! ETH pakai hex)
 * 
 * Jadi address Tron dan Ethereum dari private key yang SAMA akan berbeda,
 * meskipun menggunakan mathematical relationship yang sama.
 * 
 * NOTE: Kita generate langsung dengan ethers.js atau manual approach
 * karena TronWeb bisa problematic untuk pure generation tanpa node.
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import bs58 from 'bs58';

/**
 * Konversi Ethereum address ke Tron address
 * 
 * @param {string} ethAddress - Ethereum address (0x...)
 * @returns {string} Tron address (T...)
 * 
 * PROSES:
 * 1. Ambil 20 bytes address (hapus 0x prefix)
 * 2. Tambah prefix 0x41 (byte identifier Tron mainnet)
 * 3. Double SHA256 → ambil 4 bytes pertama sebagai checksum
 * 4. Gabung: 0x41 + address + checksum
 * 5. Base58 encode hasilnya
 */
function ethAddressToTron(ethAddress) {
  // Hapus 0x prefix, dapatkan 20 bytes address murni  
  const addressHex = ethAddress.slice(2).toLowerCase();
  
  // Tambah prefix 41 (Tron mainnet identifier)
  // 41 hex = byte yang menandakan ini address Tron mainnet
  const tronHex = '41' + addressHex;
  const tronBytes = Buffer.from(tronHex, 'hex');

  // Double SHA256 untuk checksum (standar Base58Check)
  // Checksum = 4 bytes pertama dari SHA256(SHA256(data))
  const hash1 = crypto.createHash('sha256').update(tronBytes).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.slice(0, 4);

  // Gabungkan data + checksum → encode Base58
  const addressWithChecksum = Buffer.concat([tronBytes, checksum]);
  return bs58.encode(addressWithChecksum);
}

/**
 * Generate 1 Tron wallet baru
 * 
 * @returns {Object} Wallet data:
 *   - address: string (T...)         → Tron address (Base58Check)
 *   - addressHex: string (41...)     → Hex format address
 *   - privateKey: string (hex)       → Private key tanpa 0x prefix
 *   - evmAddress: string (0x...)     → Equivalent EVM address
 *   - chain: string                  → 'tron'
 */
export function generateWallet() {
  // Generate random wallet menggunakan ethers.js
  // Karena Tron pakai secp256k1 yang sama, kita bisa derive dari sini
  const wallet = ethers.Wallet.createRandom();

  // Konversi EVM address → Tron address
  const tronAddress = ethAddressToTron(wallet.address);

  return {
    address: tronAddress,
    addressHex: '41' + wallet.address.slice(2).toLowerCase(),
    privateKey: wallet.privateKey.slice(2), // Tron biasanya tanpa 0x prefix
    evmAddress: wallet.address,              // Berguna untuk referensi
    mnemonic: wallet.mnemonic.phrase,
    chain: 'tron',
  };
}

/**
 * Generate Tron wallet dari mnemonic
 */
export function generateFromMnemonic(mnemonic, index = 0) {
  const path = `m/44'/195'/0'/0/${index}`;
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);
  const tronAddress = ethAddressToTron(wallet.address);

  return {
    address: tronAddress,
    addressHex: '41' + wallet.address.slice(2).toLowerCase(),
    privateKey: wallet.privateKey.slice(2),
    evmAddress: wallet.address,
    mnemonic: mnemonic,
    path: path,
    index: index,
    chain: 'tron',
  };
}

export const chainInfo = {
  name: 'Tron',
  fullName: 'Tron (TRX)',
  curve: 'secp256k1 (same as EVM)',
  addressFormat: 'Base58Check starting with T (34 chars)',
  features: [
    'Same curve as EVM (secp256k1) but different address encoding',
    'Base58Check address format (starts with T)',
    'BIP44 derivation supported (coin type 195)',
    'Cross-reference with EVM address possible',
  ],
};
