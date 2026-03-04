/**
 * chains.js — Chain Directory with Expandable Cards
 * 
 * Semua data chain disimpan di sini supaya HTML bersih.
 * Setiap chain punya:
 * - name, sub: nama dan subtitle
 * - icon: path ke icon (atau emoji fallback)
 * - color: warna aksen untuk border/badge
 * - curve, addressFormat, keyFormat, standard: teknis
 * - networks: array sub-network yang didukung
 * - features: tag fitur unik chain
 * - explorer: URL block explorer
 */

const CHAINS = [
  {
    id: 'evm',
    name: 'EVM',
    sub: 'Ethereum Virtual Machine',
    icon: '⟠',
    color: '#627eea',
    curve: 'secp256k1',
    addressFormat: '0x... (42 chars, EIP-55 checksummed)',
    keyFormat: '256-bit hex private key',
    standard: 'BIP44 m/44\'/60\'/0\'/0/0',
    explorer: 'https://etherscan.io',
    networks: [
      'Ethereum', 'BNB Chain', 'Polygon', 'Arbitrum', 'Optimism', 'Base',
      'zkSync Era', 'Avalanche C-Chain', 'Fantom', 'Cronos', 'Gnosis',
      'Celo', 'Moonbeam', 'Harmony', 'Metis', 'Mantle', 'Linea',
      'Scroll', 'Blast', 'Mode', 'Manta', 'Zora',
    ],
    features: ['ERC-20 tokens', 'Smart contracts', 'DeFi ecosystem', 'NFTs', 'BIP39 mnemonic'],
  },
  {
    id: 'solana',
    name: 'Solana',
    sub: 'High-performance L1',
    icon: '◎',
    color: '#9945ff',
    curve: 'Ed25519',
    addressFormat: 'Base58 (32-44 chars)',
    keyFormat: '64-byte Base58 keypair',
    standard: 'BIP44 m/44\'/501\'/0\'/0\'',
    explorer: 'https://solscan.io',
    networks: ['Solana Mainnet'],
    features: ['Ed25519 curve', 'SPL Tokens', '400ms block time', 'Parallel execution', 'BIP39 mnemonic'],
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    sub: 'The original cryptocurrency',
    icon: '₿',
    color: '#f7931a',
    curve: 'secp256k1',
    addressFormat: 'Legacy (1...) / SegWit (3...) / Native SegWit (bc1q...)',
    keyFormat: 'WIF (Wallet Import Format)',
    standard: 'BIP44 m/44\'/0\'/0\'/0/0',
    explorer: 'https://mempool.space',
    networks: ['Bitcoin Mainnet'],
    features: ['Legacy P2PKH', 'SegWit P2SH', 'Native SegWit Bech32', 'BIP39 mnemonic', 'BIP44 HD wallet'],
  },
  {
    id: 'tron',
    name: 'Tron',
    sub: 'High-throughput entertainment chain',
    icon: '◆',
    color: '#eb0029',
    curve: 'secp256k1',
    addressFormat: 'T... (Base58Check, 34 chars)',
    keyFormat: '256-bit hex private key',
    standard: 'BIP44 m/44\'/195\'/0\'/0/0',
    explorer: 'https://tronscan.org',
    networks: ['Tron Mainnet'],
    features: ['TRC-20 tokens', 'USDT primary chain', 'Low fees', 'BIP39 mnemonic'],
  },
  {
    id: 'sui',
    name: 'Sui',
    sub: 'Move-based L1 blockchain',
    icon: '💧',
    color: '#4da2ff',
    curve: 'Ed25519',
    addressFormat: '0x... (66 chars, hex)',
    keyFormat: '256-bit hex private key',
    standard: 'Move VM',
    explorer: 'https://suiscan.xyz',
    networks: ['Sui Mainnet'],
    features: ['Move language', 'Object-centric model', 'Parallel execution', 'zkLogin'],
  },
  {
    id: 'aptos',
    name: 'Aptos',
    sub: 'Move-based L1 from ex-Meta team',
    icon: '🅰',
    color: '#2dd8a3',
    curve: 'Ed25519',
    addressFormat: '0x... (66 chars, hex)',
    keyFormat: '256-bit hex private key',
    standard: 'Aptos VM (Block-STM)',
    explorer: 'https://aptoscan.com',
    networks: ['Aptos Mainnet'],
    features: ['Move language', 'Block-STM execution', 'Ed25519 native', 'Account model'],
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    sub: 'Internet of Blockchains (IBC)',
    icon: '⚛',
    color: '#6f7390',
    curve: 'secp256k1',
    addressFormat: 'Bech32 (chain-specific prefix: cosmos1, osmo1...)',
    keyFormat: '256-bit hex private key',
    standard: 'BIP44 m/44\'/118\'/0\'/0/0',
    explorer: 'https://mintscan.io',
    networks: [
      'Cosmos Hub (ATOM)', 'Osmosis (OSMO)', 'Celestia (TIA)', 'Sei (SEI)',
      'Injective (INJ)', 'Juno (JUNO)', 'Evmos (EVMOS)', 'Kava (KAVA)',
      'Stride (STRD)', 'Akash (AKT)', 'Stargaze (STARS)', 'Regen (REGEN)',
    ],
    features: ['IBC protocol', 'Tendermint BFT', '12 IBC chains', 'BIP39 mnemonic', 'Bech32 encoding'],
  },
  {
    id: 'ton',
    name: 'TON',
    sub: 'The Open Network (Telegram)',
    icon: '💎',
    color: '#0098ea',
    curve: 'Ed25519',
    addressFormat: 'EQ/UQ... (Base64url, 48 chars)',
    keyFormat: '256-bit hex private key',
    standard: 'TON SDK',
    explorer: 'https://tonviewer.com',
    networks: ['TON Mainnet'],
    features: ['Telegram integration', 'Jetton tokens', 'Ed25519 curve', 'Sharding'],
  },
  {
    id: 'starknet',
    name: 'Starknet',
    sub: 'Ethereum L2 with STARK proofs',
    icon: '⟁',
    color: '#ec796b',
    curve: 'STARK curve (Pedersen hash)',
    addressFormat: '0x... (66 chars, hex)',
    keyFormat: '252-bit STARK key',
    standard: 'Cairo VM',
    explorer: 'https://starkscan.co',
    networks: ['Starknet Mainnet'],
    features: ['ZK-STARK proofs', 'Cairo language', 'Account abstraction', 'Native AA'],
  },
];


// ============================
// RENDER
// ============================

function render() {
  const grid = document.getElementById('chains-grid');
  
  grid.innerHTML = CHAINS.map(c => {
    const networkCount = c.networks.length;
    const networkLabel = networkCount === 1 ? '1 network' : `${networkCount} networks`;
    
    return `
      <div class="cdir-card" data-chain="${c.id}" style="--chain-color: ${c.color}">
        <div class="cdir-card-top">
          <div class="cdir-icon">${c.icon}</div>
          <div class="cdir-info">
            <h3 class="cdir-name">${c.name}</h3>
            <span class="cdir-sub">${c.sub}</span>
          </div>
          <span class="cdir-count">${networkLabel}</span>
        </div>
        
        <div class="cdir-specs">
          <div class="cdir-spec">
            <span class="cdir-spec-label">Curve</span>
            <span class="cdir-spec-value">${c.curve}</span>
          </div>
          <div class="cdir-spec">
            <span class="cdir-spec-label">Address</span>
            <span class="cdir-spec-value">${c.addressFormat}</span>
          </div>
          <div class="cdir-spec">
            <span class="cdir-spec-label">Key</span>
            <span class="cdir-spec-value">${c.keyFormat}</span>
          </div>
          <div class="cdir-spec">
            <span class="cdir-spec-label">Standard</span>
            <span class="cdir-spec-value">${c.standard}</span>
          </div>
        </div>
        
        <div class="cdir-networks">
          ${c.networks.map(n => `<span class="cdir-net">${n}</span>`).join('')}
        </div>
        
        <div class="cdir-footer">
          <div class="cdir-features">
            ${c.features.map(f => `<span class="cdir-feat">${f}</span>`).join('')}
          </div>
          <a href="${c.explorer}" target="_blank" rel="noopener" class="cdir-explorer" title="Open Explorer">
            <i class="hgi-stroke hgi-link-square-01"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

render();
