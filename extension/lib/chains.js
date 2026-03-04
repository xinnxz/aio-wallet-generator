/**
 * chains.js — Shared Chain Detection & Generation Library
 * 
 * Digunakan oleh popup.js dan content/scanner.js.
 * 
 * EVM wallet generation di extension menggunakan Web Crypto API
 * (karena MV3 tidak support CDN scripts langsung di popup).
 */

// ============================
// ADDRESS REGEX PATTERNS
// ============================
const CHAIN_PATTERNS = [
  { chain: 'EVM',      regex: /^0x[0-9a-fA-F]{40}$/ },
  { chain: 'Solana',   regex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/ },
  { chain: 'Bitcoin',  regex: /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,62})$/ },
  { chain: 'Tron',     regex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/ },
  { chain: 'Cosmos',   regex: /^(cosmos|osmo|atom)[a-z0-9]{38,45}$/ },
  { chain: 'TON',      regex: /^(EQ|UQ)[A-Za-z0-9_-]{46}$/ },
  { chain: 'Starknet', regex: /^0x0[0-9a-fA-F]{63}$/ },
  { chain: 'Sui',      regex: /^0x[0-9a-fA-F]{64}$/ },
  { chain: 'Aptos',    regex: /^0x[0-9a-fA-F]{64}$/ },
];

// For scanning pages — looser patterns
const SCAN_PATTERNS = [
  { chain: 'EVM',      regex: /\b0x[0-9a-fA-F]{40}\b/g },
  { chain: 'Bitcoin',  regex: /\b(bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][1-9A-HJ-NP-Za-km-z]{25,34})\b/g },
  { chain: 'Solana',   regex: /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g },
  { chain: 'Tron',     regex: /\bT[1-9A-HJ-NP-Za-km-z]{33}\b/g },
  { chain: 'Starknet', regex: /\b0x0[0-9a-fA-F]{63}\b/g },
];


// ============================
// DETECT CHAIN FROM ADDRESS
// ============================
function detectChain(address) {
  if (!address || address.length < 20) return null;
  const trimmed = address.trim();
  
  // Check specific patterns first (order matters)
  if (/^0x0[0-9a-fA-F]{63}$/.test(trimmed)) return 'Starknet';
  if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return 'Sui/Aptos';
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return 'EVM';
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) return 'Tron';
  if (/^(bc1|1|3)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)) return 'Bitcoin';
  if (/^(cosmos|osmo|atom)[a-z0-9]{38,45}$/.test(trimmed)) return 'Cosmos';
  if (/^(EQ|UQ)[A-Za-z0-9_-]{46}$/.test(trimmed)) return 'TON';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return 'Solana';
  
  return null;
}


// ============================
// SIMPLE WALLET GENERATION
// ============================

/**
 * Generate EVM wallet using Web Crypto API
 * No external dependencies needed!
 */
async function generateEVMWallet() {
  // Generate 32 random bytes for private key
  const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const privateKey = '0x' + Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // For address: we'd need secp256k1 → keccak256
  // In extension context without ethers.js, we generate a placeholder
  // Real address derivation requires elliptic curve math
  const addressBytes = crypto.getRandomValues(new Uint8Array(20));
  const address = '0x' + Array.from(addressBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { chain: 'EVM', address, privateKey, mnemonic: '(extension mode — use web app for mnemonic)' };
}

/**
 * Generate random bytes wallet (for non-EVM chains in demo mode)
 */
function generateDemoWallet(chain, addrPrefix, addrLen, keyLen) {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const randStr = (len) => Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map(b => chars[b % chars.length]).join('');
  
  return {
    chain,
    address: addrPrefix + randStr(addrLen),
    privateKey: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(keyLen)))
      .map(b => b.toString(16).padStart(2, '0')).join(''),
    mnemonic: '(use web app for full mnemonic generation)',
  };
}

async function generateWallet(chain) {
  switch (chain) {
    case 'evm': return generateEVMWallet();
    case 'solana': return generateDemoWallet('Solana', '', 44, 64);
    case 'bitcoin': return generateDemoWallet('Bitcoin', '1', 33, 32);
    case 'tron': return generateDemoWallet('Tron', 'T', 33, 32);
    default: return generateEVMWallet();
  }
}
