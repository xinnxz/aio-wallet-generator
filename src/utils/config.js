/**
 * config.js — Default Configurations & Chain Registry
 * 
 * Berisi semua konfigurasi default dan registry chain yang didukung.
 * 
 * PENJELASAN:
 * - EVM chains semuanya pakai address format yang sama (0x + 40 hex chars)
 *   karena semua pakai secp256k1 curve + keccak256 hash yang sama.
 *   Jadi 1 wallet = valid di SEMUA EVM chains.
 * 
 * - Non-EVM chains punya curve/hash algorithm berbeda, jadi butuh
 *   handler masing-masing.
 * 
 * - chainId digunakan untuk identifikasi network di MetaMask/wallet
 * - BIP44 coin type: angka unik per chain untuk HD wallet derivation
 */

// ============================================================
// EVM CHAINS REGISTRY
// Semua chain ini compatible — 1 private key = 1 address di semua network
// ============================================================
export const EVM_CHAINS = [
  { name: 'Ethereum',        symbol: 'ETH',   chainId: 1,          explorer: 'https://etherscan.io' },
  { name: 'BNB Smart Chain', symbol: 'BNB',   chainId: 56,         explorer: 'https://bscscan.com' },
  { name: 'Polygon',         symbol: 'MATIC', chainId: 137,        explorer: 'https://polygonscan.com' },
  { name: 'Arbitrum',        symbol: 'ETH',   chainId: 42161,      explorer: 'https://arbiscan.io' },
  { name: 'Optimism',        symbol: 'ETH',   chainId: 10,         explorer: 'https://optimistic.etherscan.io' },
  { name: 'Base',            symbol: 'ETH',   chainId: 8453,       explorer: 'https://basescan.org' },
  { name: 'zkSync Era',      symbol: 'ETH',   chainId: 324,        explorer: 'https://explorer.zksync.io' },
  { name: 'Linea',           symbol: 'ETH',   chainId: 59144,      explorer: 'https://lineascan.build' },
  { name: 'Scroll',          symbol: 'ETH',   chainId: 534352,     explorer: 'https://scrollscan.com' },
  { name: 'Blast',           symbol: 'ETH',   chainId: 81457,      explorer: 'https://blastscan.io' },
  { name: 'Manta Pacific',   symbol: 'ETH',   chainId: 169,        explorer: 'https://pacific-explorer.manta.network' },
  { name: 'Mantle',          symbol: 'MNT',   chainId: 5000,       explorer: 'https://explorer.mantle.xyz' },
  { name: 'opBNB',           symbol: 'BNB',   chainId: 204,        explorer: 'https://opbnbscan.com' },
  { name: 'Avalanche',       symbol: 'AVAX',  chainId: 43114,      explorer: 'https://snowtrace.io' },
  { name: 'Fantom',          symbol: 'FTM',   chainId: 250,        explorer: 'https://ftmscan.com' },
  { name: 'Cronos',          symbol: 'CRO',   chainId: 25,         explorer: 'https://cronoscan.com' },
  { name: 'Gnosis',          symbol: 'xDAI',  chainId: 100,        explorer: 'https://gnosisscan.io' },
  { name: 'Celo',            symbol: 'CELO',  chainId: 42220,      explorer: 'https://celoscan.io' },
  { name: 'Moonbeam',        symbol: 'GLMR',  chainId: 1284,       explorer: 'https://moonscan.io' },
  { name: 'Aurora',          symbol: 'ETH',   chainId: 1313161554,  explorer: 'https://explorer.aurora.dev' },
  { name: 'ZetaChain',       symbol: 'ZETA',  chainId: 7000,       explorer: 'https://explorer.zetachain.com' },
  { name: 'Taiko',           symbol: 'ETH',   chainId: 167000,     explorer: 'https://taikoscan.io' },
];

// ============================================================
// NON-EVM CHAINS REGISTRY
// Setiap chain punya handler sendiri karena beda algorithm
// ============================================================
export const NON_EVM_CHAINS = {
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    curve: 'Ed25519',           // Kurva kriptografi berbeda dari EVM
    addressFormat: 'Base58',     // Format encoding address
    coinType: 501,               // BIP44 coin type (untuk HD wallet)
    explorer: 'https://solscan.io',
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    curve: 'secp256k1',          // Sama seperti EVM, tapi format address beda
    addressFormat: 'Base58Check/Bech32',
    coinType: 0,
    explorer: 'https://blockchair.com/bitcoin',
  },
  tron: {
    name: 'Tron',
    symbol: 'TRX',
    curve: 'secp256k1',          // Sama curve, tapi address di-encode beda
    addressFormat: 'Base58Check (T...)',
    coinType: 195,
    explorer: 'https://tronscan.org',
  },
  sui: {
    name: 'Sui',
    symbol: 'SUI',
    curve: 'Ed25519',
    addressFormat: 'Hex (0x...)',
    coinType: 784,
    explorer: 'https://suiscan.xyz',
  },
  aptos: {
    name: 'Aptos',
    symbol: 'APT',
    curve: 'Ed25519',
    addressFormat: 'Hex (0x...)',
    coinType: 637,
    explorer: 'https://explorer.aptoslabs.com',
  },
  cosmos: {
    name: 'Cosmos',
    symbol: 'ATOM',
    curve: 'secp256k1',
    addressFormat: 'Bech32',
    coinType: 118,
    explorer: 'https://www.mintscan.io/cosmos',
    // Cosmos unik: bisa derive alamat untuk banyak chain IBC
    // dengan mengganti prefix (cosmos1, osmo1, celestia1, dll)
    prefixes: {
      cosmos: 'cosmos',
      osmosis: 'osmo',
      celestia: 'celestia',
      sei: 'sei',
      injective: 'inj',
      dymension: 'dym',
      neutron: 'neutron',
      stargaze: 'stars',
      juno: 'juno',
      akash: 'akash',
      evmos: 'evmos',
      kava: 'kava',
    },
  },
  ton: {
    name: 'TON',
    symbol: 'TON',
    curve: 'Ed25519',
    addressFormat: 'Base64/Raw',
    coinType: 607,
    explorer: 'https://tonscan.org',
  },
  starknet: {
    name: 'Starknet',
    symbol: 'STRK',
    curve: 'STARK',              // Kurva kriptografi unik — bukan secp256k1/Ed25519
    addressFormat: 'Hex (0x...)',
    coinType: 9004,
    explorer: 'https://starkscan.co',
  },
};

// ============================================================
// BATCH PROCESSING CONFIG
// ============================================================
export const BATCH_CONFIG = {
  defaultChunkSize: 500,       // Jumlah wallet per chunk
  maxWallets: 100000,          // Batas maksimum wallet per generate
  defaultCount: 10,            // Default jumlah jika tidak di-specify
  progressInterval: 100,       // Emit progress setiap N wallet
};

// ============================================================
// EXPORT CONFIG
// ============================================================
export const EXPORT_CONFIG = {
  defaultOutputDir: './output',
  formats: ['csv', 'json', 'xlsx', 'encrypted'],
  defaultFormat: 'json',
  encryptionAlgorithm: 'aes-256-gcm',
  pbkdf2Iterations: 100000,     // Jumlah iterasi untuk key derivation
  saltLength: 32,               // Panjang salt dalam bytes
  ivLength: 16,                 // Panjang IV (initialization vector) dalam bytes
};

// ============================================================
// BIP44 DERIVATION PATHS
// Format: m / purpose' / coin_type' / account' / change / address_index
// 
// PENJELASAN:
// - purpose = 44 (BIP44 standard)
// - coin_type = nomor unik per chain (lihat SLIP-0044)
// - account = biasanya 0
// - change = 0 (external), 1 (internal/change)
// - address_index = 0, 1, 2, ... (increment untuk tiap wallet baru)
// ============================================================
export const BIP44_PATHS = {
  evm:      "m/44'/60'/0'/0",    // Ethereum & semua EVM (coin type 60)
  bitcoin:  "m/44'/0'/0'/0",     // Bitcoin (coin type 0)
  tron:     "m/44'/195'/0'/0",   // Tron (coin type 195)
  solana:   "m/44'/501'/0'/0'",  // Solana (coin type 501)
  sui:      "m/44'/784'/0'/0'/0'", // Sui (coin type 784)
  aptos:    "m/44'/637'/0'/0'/0'", // Aptos (coin type 637)
  cosmos:   "m/44'/118'/0'/0",   // Cosmos (coin type 118)
  ton:      "m/44'/607'/0'",     // TON (coin type 607)
  starknet: "m/44'/9004'/0'/0",  // Starknet (coin type 9004)
};
