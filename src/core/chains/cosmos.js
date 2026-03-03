/**
 * cosmos.js — Cosmos (IBC) Wallet Generator
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Cosmos bukan 1 blockchain, tapi EKOSISTEM dari banyak blockchain yang
 * terhubung via IBC (Inter-Blockchain Communication).
 * 
 * KENAPA COSMOS PENTING UNTUK AIRDROP?
 * - Dengan staking ATOM, kamu sering qualify untuk airdrop chain baru
 * - Banyak chain Cosmos yang melakukan airdrop ke staker (TIA, DYM, dll)
 * - 1 private key = banyak address di berbagai chain (ganti prefix saja!)
 * 
 * KARAKTERISTIK TEKNIS:
 * 1. Kurva: secp256k1 (sama seperti EVM & Bitcoin)
 *    - Tapi format address BERBEDA
 * 
 * 2. Address Format: Bech32
 *    - cosmos1abc123...  → Cosmos Hub (ATOM)
 *    - osmo1abc123...    → Osmosis (OSMO)
 *    - celestia1abc123...→ Celestia (TIA)
 *    - sei1abc123...     → Sei Network
 *    - inj1abc123...     → Injective
 *    - dll.
 * 
 * 3. TRIK UNIK:
 *    Dari 1 private key yang SAMA, kita bisa derive address untuk
 *    SEMUA chain Cosmos — cukup ganti prefix-nya!
 *    Ini mirip konsep EVM (1 key = semua chain), tapi prefix berbeda.
 * 
 * 4. Derivation:
 *    Private Key → Public Key (secp256k1)
 *    → SHA256 → RIPEMD160 → Bech32 encode dengan prefix
 * 
 * NOTE: Kita menggunakan ethers.js untuk secp256k1 key generation
 *       dan manual Bech32 encoding untuk menghindari @cosmjs ESM issues.
 */

import { ethers } from 'ethers';
import crypto from 'crypto';
import { NON_EVM_CHAINS } from '../../utils/config.js';

// Daftar prefix untuk setiap chain Cosmos
const COSMOS_PREFIXES = NON_EVM_CHAINS.cosmos.prefixes;

/**
 * Bech32 encoding (manual implementation)
 * 
 * Bech32 terdiri dari: prefix + "1" + data_encoded
 * Data di-encode dalam base32 menggunakan alphabet khusus
 * Ditambah 6 byte checksum di akhir
 */
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values) {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp) {
  const result = [];
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) >> 5);
  }
  result.push(0);
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) & 31);
  }
  return result;
}

function bech32CreateChecksum(hrp, data) {
  const values = [...bech32HrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
  const polymod = bech32Polymod(values) ^ 1;
  const checksum = [];
  for (let i = 0; i < 6; i++) {
    checksum.push((polymod >> (5 * (5 - i))) & 31);
  }
  return checksum;
}

function convertBits(data, fromBits, toBits, pad) {
  let acc = 0;
  let bits = 0;
  const result = [];
  const maxV = (1 << toBits) - 1;
  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxV);
    }
  }
  if (pad) {
    if (bits > 0) result.push((acc << (toBits - bits)) & maxV);
  }
  return result;
}

function bech32Encode(hrp, data) {
  const data5bit = convertBits(data, 8, 5, true);
  const checksum = bech32CreateChecksum(hrp, data5bit);
  const combined = [...data5bit, ...checksum];
  return hrp + '1' + combined.map(d => BECH32_CHARSET[d]).join('');
}

/**
 * Generate 1 Cosmos wallet yang berlaku di SEMUA chain IBC
 * 
 * PROSES:
 * 1. Generate secp256k1 keypair (via ethers.js)
 * 2. Get compressed public key (33 bytes)
 * 3. SHA256(compressed pubkey) → RIPEMD160 = "address bytes"
 * 4. Bech32 encode address bytes with prefix → final address
 * 5. Repeat step 4 for each Cosmos chain (different prefix)
 */
export async function generateWallet() {
  // Step 1: Generate random wallet (secp256k1)
  const wallet = ethers.Wallet.createRandom();
  
  // Step 2: Get compressed public key
  // ethers.js SigningKey gives us the compressed public key directly
  const signingKey = new ethers.SigningKey(wallet.privateKey);
  const compressedPubKeyHex = signingKey.compressedPublicKey;
  const compressedPubKey = Buffer.from(compressedPubKeyHex.slice(2), 'hex');

  // Step 3: SHA256 → RIPEMD160 = address bytes
  const sha256Hash = crypto.createHash('sha256').update(compressedPubKey).digest();
  const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();

  // Step 4: Generate address for EVERY Cosmos chain
  const addresses = {};
  for (const [chain, prefix] of Object.entries(COSMOS_PREFIXES)) {
    addresses[chain] = bech32Encode(prefix, ripemd160Hash);
  }

  return {
    address: addresses.cosmos,
    addresses: addresses,
    privateKey: wallet.privateKey.slice(2),
    publicKey: compressedPubKeyHex.slice(2),
    chain: 'cosmos',
  };
}

export const chainInfo = {
  name: 'Cosmos',
  fullName: 'Cosmos IBC Ecosystem (ATOM, OSMO, TIA, SEI, INJ, ...)',
  curve: 'secp256k1',
  addressFormat: 'Bech32 with chain-specific prefix',
  supportedChains: Object.entries(COSMOS_PREFIXES).map(([name, prefix]) => ({
    name,
    prefix,
    example: `${prefix}1abc...xyz`,
  })),
  features: [
    '1 key = addresses for ALL IBC chains',
    'Bech32 address encoding',
    'Staking ATOM/OSMO/TIA → qualify for ecosystem airdrops',
    `Supports ${Object.keys(COSMOS_PREFIXES).length} IBC chains simultaneously`,
  ],
};
