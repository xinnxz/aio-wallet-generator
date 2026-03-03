/**
 * validator.js — Address Validation & Duplicate Detection
 * 
 * PENJELASAN:
 * ==========
 * Setelah generate wallet, kita HARUS validasi bahwa:
 * 1. Address formatnya benar (panjang, prefix, checksum)
 * 2. Tidak ada duplikat (secara probabilitas hampir mustahil, tapi kita cek)
 * 
 * KENAPA VALIDASI PENTING?
 * - Address yang salah format = dana bisa hilang selamanya
 * - EIP-55 checksum mencegah salah ketik address (huruf besar/kecil punya makna)
 */

import { ethers } from 'ethers';

/**
 * Validasi address berdasarkan chain
 * 
 * @param {string} address - Address yang mau divalidasi
 * @param {string} chain - Nama chain
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAddress(address, chain) {
  try {
    switch (chain) {
      case 'evm':
        return validateEvmAddress(address);
      case 'solana':
        return validateSolanaAddress(address);
      case 'bitcoin':
        return validateBitcoinAddress(address);
      case 'tron':
        return validateTronAddress(address);
      case 'sui':
        return validateSuiAddress(address);
      case 'aptos':
        return validateAptosAddress(address);
      case 'cosmos':
        return validateCosmosAddress(address);
      case 'ton':
        return validateTonAddress(address);
      case 'starknet':
        return validateStarknetAddress(address);
      default:
        return { valid: false, error: `Unknown chain: ${chain}` };
    }
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Validasi EVM address (Ethereum dan semua EVM chains)
 * 
 * Aturan:
 * - Dimulai dengan 0x
 * - Panjang 42 karakter (0x + 40 hex)
 * - Valid hex characters
 * - EIP-55 checksum (opsional tapi recommended)
 * 
 * EIP-55 CHECKSUM:
 * Huruf besar/kecil di hex address BUKAN random!
 * Setiap karakter di-uppercase/lowercase berdasarkan hash address.
 * Ini mencegah salah ketik — jika 1 huruf salah, checksum gagal.
 */
function validateEvmAddress(address) {
  if (!address.startsWith('0x')) {
    return { valid: false, error: 'EVM address harus dimulai dengan 0x' };
  }
  if (address.length !== 42) {
    return { valid: false, error: `EVM address harus 42 karakter, dapat ${address.length}` };
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return { valid: false, error: 'EVM address mengandung karakter non-hex' };
  }
  // Cek EIP-55 checksum
  try {
    ethers.getAddress(address); // Akan throw jika checksum salah
    return { valid: true };
  } catch {
    return { valid: false, error: 'EVM address gagal EIP-55 checksum' };
  }
}

/**
 * Validasi Solana address (Base58, 32-44 chars)
 */
function validateSolanaAddress(address) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return { valid: false, error: 'Solana address harus Base58 (32-44 karakter)' };
  }
  return { valid: true };
}

/**
 * Validasi Bitcoin address (Legacy, SegWit, Bech32)
 */
function validateBitcoinAddress(address) {
  // Legacy (P2PKH): dimulai dengan 1
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return { valid: true };
  // SegWit (P2SH): dimulai dengan 3
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return { valid: true };
  // Native SegWit (Bech32): dimulai dengan bc1q
  if (/^bc1q[a-z0-9]{38,58}$/.test(address)) return { valid: true };
  // Taproot (Bech32m): dimulai dengan bc1p
  if (/^bc1p[a-z0-9]{38,58}$/.test(address)) return { valid: true };
  
  return { valid: false, error: 'Bitcoin address format tidak valid' };
}

/**
 * Validasi Tron address (Base58Check, dimulai T, 34 chars)
 */
function validateTronAddress(address) {
  if (!address.startsWith('T')) {
    return { valid: false, error: 'Tron address harus dimulai dengan T' };
  }
  if (address.length !== 34) {
    return { valid: false, error: `Tron address harus 34 karakter, dapat ${address.length}` };
  }
  if (!/^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(address)) {
    return { valid: false, error: 'Tron address mengandung karakter non-Base58' };
  }
  return { valid: true };
}

/**
 * Validasi Sui address (0x + 64 hex chars)
 */
function validateSuiAddress(address) {
  if (!address.startsWith('0x')) {
    return { valid: false, error: 'Sui address harus dimulai dengan 0x' };
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(address)) {
    return { valid: false, error: 'Sui address harus 0x + 64 hex chars' };
  }
  return { valid: true };
}

/**
 * Validasi Aptos address (0x + 64 hex chars)
 */
function validateAptosAddress(address) {
  if (!address.startsWith('0x')) {
    return { valid: false, error: 'Aptos address harus dimulai dengan 0x' };
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(address)) {
    return { valid: false, error: 'Aptos address harus 0x + 64 hex chars' };
  }
  return { valid: true };
}

/**
 * Validasi Cosmos address (Bech32, prefix + 1 + alamat)
 */
function validateCosmosAddress(address) {
  // Cek apakah format bech32: prefix + "1" + data
  if (!/^[a-z]+1[a-z0-9]{38,58}$/.test(address)) {
    return { valid: false, error: 'Cosmos address harus format Bech32' };
  }
  return { valid: true };
}

/**
 * Validasi TON address (Raw atau User-friendly)
 */
function validateTonAddress(address) {
  // Raw format: workchain:hex
  if (/^-?[0-9]:[0-9a-fA-F]{64}$/.test(address)) return { valid: true };
  // User-friendly format (Base64url)
  if (/^[A-Za-z0-9_-]{48}$/.test(address)) return { valid: true };
  
  return { valid: false, error: 'TON address format tidak valid' };
}

/**
 * Validasi Starknet address (0x + up to 64 hex chars)
 */
function validateStarknetAddress(address) {
  if (!address.startsWith('0x')) {
    return { valid: false, error: 'Starknet address harus dimulai dengan 0x' };
  }
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(address)) {
    return { valid: false, error: 'Starknet address harus hex format' };
  }
  return { valid: true };
}

/**
 * Cek duplikasi di array wallet
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @returns {{ hasDuplicates: boolean, duplicates: string[] }}
 * 
 * PROBABILITAS DUPLIKAT:
 * Untuk EVM (256-bit key space):
 * - 10K wallet → probabilitas duplikat ≈ 10^-71 (praktis 0)
 * - Tapi kita tetap cek, karena bug di random number generator BISA terjadi
 */
export function checkDuplicates(wallets) {
  const addresses = new Set();
  const duplicates = [];

  for (const wallet of wallets) {
    if (addresses.has(wallet.address)) {
      duplicates.push(wallet.address);
    }
    addresses.add(wallet.address);
  }

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    totalChecked: wallets.length,
    uniqueCount: addresses.size,
  };
}

/**
 * Validate batch of wallets
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @param {string} chain - Chain name
 * @returns {{ allValid: boolean, invalid: Array, duplicates: Object }}
 */
export function validateBatch(wallets, chain) {
  const invalid = [];

  for (const wallet of wallets) {
    const result = validateAddress(wallet.address, chain);
    if (!result.valid) {
      invalid.push({
        index: wallet.index,
        address: wallet.address,
        error: result.error,
      });
    }
  }

  const dupeCheck = checkDuplicates(wallets);

  return {
    allValid: invalid.length === 0 && !dupeCheck.hasDuplicates,
    totalChecked: wallets.length,
    invalidCount: invalid.length,
    invalid,
    duplicateCheck: dupeCheck,
  };
}
