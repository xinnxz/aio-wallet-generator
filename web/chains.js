/**
 * chains.js — Chain Directory (Full 30+ networks)
 * 
 * PENJELASAN:
 * File ini berisi data SEMUA chain yang didukung, termasuk ke-22 EVM networks
 * yang masing-masing ditampilkan sebagai baris individual.
 * 
 * Struktur data:
 * - name: nama chain/network
 * - group: kategori (EVM, Non-EVM)
 * - logo: path ke icon
 * - curve: algoritma kriptografi yang dipakai
 * - addrLen: panjang karakter address
 * - encoding: format encoding address
 * - derivation: path derivation BIP44 atau VM
 * - mnemonic: apakah support BIP39 mnemonic phrase
 * - chainId: ID unik chain (khusus EVM)
 */

const CHAINS = [
  // ── EVM Networks (22) ──────────────────────────
  { name: 'Ethereum',     group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 1 },
  { name: 'BNB Chain',    group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 56 },
  { name: 'Polygon',      group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 137 },
  { name: 'Arbitrum',     group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 42161 },
  { name: 'Optimism',     group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 10 },
  { name: 'Base',         group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 8453 },
  { name: 'zkSync Era',   group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 324 },
  { name: 'Avalanche',    group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 43114 },
  { name: 'Fantom',       group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 250 },
  { name: 'Cronos',       group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 25 },
  { name: 'Gnosis',       group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 100 },
  { name: 'Celo',         group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 42220 },
  { name: 'Moonbeam',     group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 1284 },
  { name: 'Harmony',      group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 1666600000 },
  { name: 'Metis',        group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 1088 },
  { name: 'Mantle',       group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 5000 },
  { name: 'Linea',        group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 59144 },
  { name: 'Scroll',       group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 534352 },
  { name: 'Blast',        group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 81457 },
  { name: 'Mode',         group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 34443 },
  { name: 'Manta',        group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 169 },
  { name: 'Zora',         group: 'EVM', logo: 'images/eth.png',  curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)', derivation: "m/44'/60'/0'/0/0", mnemonic: true, chainId: 7777777 },

  // ── Non-EVM Chains (8) ─────────────────────────
  { name: 'Solana',   group: 'Solana',   logo: 'images/sol.png',  curve: 'Ed25519',     addrLen: '32-44', encoding: 'Base58',         derivation: "m/44'/501'/0'/0'", mnemonic: true },
  { name: 'Bitcoin',  group: 'Bitcoin',  logo: 'images/btc.png',  curve: 'secp256k1',   addrLen: '25-62', encoding: 'Base58 / Bech32', derivation: "m/44'/0'/0'/0/0",  mnemonic: true },
  { name: 'Tron',     group: 'Tron',     logo: 'images/trx.png',  curve: 'secp256k1',   addrLen: 34,      encoding: 'Base58Check',     derivation: "m/44'/195'/0'/0/0", mnemonic: true },
  { name: 'Sui',      group: 'Sui',      logo: 'images/sui.jpeg', curve: 'Ed25519',     addrLen: 66,      encoding: 'Hex (0x)',        derivation: 'Move VM',           mnemonic: false },
  { name: 'Aptos',    group: 'Aptos',    logo: 'images/apt.png',  curve: 'Ed25519',     addrLen: 66,      encoding: 'Hex (0x)',        derivation: 'Block-STM',         mnemonic: false },
  { name: 'Cosmos',   group: 'Cosmos',   logo: 'images/atom.png', curve: 'secp256k1',   addrLen: '~45',   encoding: 'Bech32',          derivation: "m/44'/118'/0'/0/0", mnemonic: true,
    subs: ['ATOM','OSMO','TIA','SEI','INJ','JUNO','EVMOS','KAVA','STRIDE','AKT','STARS','REGEN'] },
  { name: 'TON',      group: 'TON',      logo: 'images/ton.png',  curve: 'Ed25519',     addrLen: 48,      encoding: 'Base64url',       derivation: 'TON SDK',           mnemonic: false },
  { name: 'Starknet', group: 'Starknet', logo: 'images/strk.png', curve: 'STARK curve', addrLen: 66,      encoding: 'Hex (0x)',        derivation: 'Cairo VM',          mnemonic: false },
];

// Build table
const tbody = document.getElementById('chains-tbody');
const totalNets = document.getElementById('total-nets');

// Group header for EVM/Non-EVM
let lastGroup = '';

CHAINS.forEach((c, i) => {
  // Insert group separator
  const groupLabel = c.group === 'EVM' ? 'EVM Networks' : 'Other Chains';
  if (groupLabel !== lastGroup) {
    lastGroup = groupLabel;
    const sepTr = document.createElement('tr');
    sepTr.className = 'ct-group-row';
    sepTr.innerHTML = `<td colspan="7" class="ct-group-label">/ ${groupLabel.toUpperCase()}</td>`;
    tbody.appendChild(sepTr);
  }

  const tr = document.createElement('tr');
  const hasChainId = c.chainId !== undefined;
  const badges = [];
  if (hasChainId) badges.push(`<span class="ct-badge">Chain ID: ${c.chainId}</span>`);
  if (c.subs) badges.push(`<span class="ct-badge ct-badge--sub">${c.subs.length} sub-chains</span>`);

  tr.innerHTML = `
    <td class="ct-rank">${i + 1}</td>
    <td class="ct-chain">
      <img src="${c.logo}" alt="${c.name}" width="24" height="24">
      <div>
        <span class="ct-name">${c.name}</span>
        ${badges.length ? `<div class="ct-badges">${badges.join('')}</div>` : ''}
      </div>
    </td>
    <td class="ct-curve">${c.curve}</td>
    <td class="ct-encoding">${c.encoding}</td>
    <td class="ct-len">${c.addrLen}</td>
    <td class="ct-deriv"><code>${c.derivation}</code></td>
    <td class="ct-mnemonic">${c.mnemonic ? '<span class="ct-yes">✓</span>' : '<span class="ct-no">✗</span>'}</td>
  `;
  
  // Click to expand sub-chains (Cosmos only has subs now)
  if (c.subs) {
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      const existing = tr.nextElementSibling;
      if (existing && existing.classList.contains('ct-expand-row')) {
        existing.remove();
        tr.classList.remove('expanded');
        return;
      }
      document.querySelectorAll('.ct-expand-row').forEach(r => r.remove());
      document.querySelectorAll('tr.expanded').forEach(r => r.classList.remove('expanded'));
      
      const expandTr = document.createElement('tr');
      expandTr.className = 'ct-expand-row';
      expandTr.innerHTML = `
        <td colspan="7">
          <div class="ct-expand-content">
            <span class="ct-expand-label">├── Supported Sub-chains</span>
            <div class="ct-expand-pills">
              ${c.subs.map(s => `<span class="ct-pill">${s}</span>`).join('')}
            </div>
          </div>
        </td>
      `;
      tr.after(expandTr);
      tr.classList.add('expanded');
    });
  }
  
  tbody.appendChild(tr);
});

totalNets.textContent = CHAINS.length + '+';
