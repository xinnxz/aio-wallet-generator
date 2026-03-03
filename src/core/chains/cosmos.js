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
 */

import { Secp256k1, Secp256k1Keypair, sha256, ripemd160 } from '@cosmjs/crypto';
import { Bech32 } from '@cosmjs/encoding';
import { makeCosmoshubPath } from '@cosmjs/amino';
import { NON_EVM_CHAINS } from '../utils/config.js';
import crypto from 'crypto';

// Daftar prefix untuk setiap chain Cosmos
const COSMOS_PREFIXES = NON_EVM_CHAINS.cosmos.prefixes;

/**
 * Generate 1 Cosmos wallet yang berlaku di SEMUA chain IBC
 * 
 * @returns {Object} Wallet data:
 *   - address: string (cosmos1...)   → Address utama (Cosmos Hub)
 *   - addresses: Object             → Semua address per chain
 *   - privateKey: string (hex)      → secp256k1 private key
 *   - publicKey: string (hex)       → Compressed public key
 *   - chain: string                 → 'cosmos'
 * 
 * PROSES:
 * 1. Generate random 32 bytes → secp256k1 keypair
 * 2. Compress public key → 33 bytes
 * 3. SHA256(compressed pubkey) → RIPEMD160 = "address bytes"
 * 4. Bech32 encode address bytes dengan prefix → final address
 * 5. Ulangi step 4 untuk setiap chain (ganti prefix)
 */
export async function generateWallet() {
  // Step 1: Generate random private key (32 bytes, secp256k1)
  const privKeyBytes = crypto.randomBytes(32);

  // Step 2: Derive public key dari private key (compressed format, 33 bytes)
  // Compressed = hanya x-coordinate + parity bit (lebih hemat ruang)
  const keypair = await Secp256k1.makeKeypair(privKeyBytes);
  const compressedPubKey = Secp256k1.compressPubkey(keypair.pubkey);

  // Step 3: Hash public key → address bytes
  // SHA256 → RIPEMD160 = standard address hashing di Cosmos
  // Ini mirip dengan cara Bitcoin generate address
  const sha256Hash = sha256(compressedPubKey);
  const ripemd160Hash = ripemd160(sha256Hash);
  const addressBytes = new Uint8Array(ripemd160Hash);

  // Step 4: Generate address untuk SETIAP chain Cosmos
  // Cukup ganti prefix Bech32-nya
  const addresses = {};
  for (const [chain, prefix] of Object.entries(COSMOS_PREFIXES)) {
    addresses[chain] = Bech32.encode(prefix, addressBytes);
  }

  const privateKeyHex = Buffer.from(privKeyBytes).toString('hex');
  const publicKeyHex = Buffer.from(compressedPubKey).toString('hex');

  return {
    // Address utama = Cosmos Hub
    address: addresses.cosmos,
    // Semua address (cosmos1..., osmo1..., celestia1..., dll)
    addresses: addresses,
    privateKey: privateKeyHex,
    publicKey: publicKeyHex,
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
