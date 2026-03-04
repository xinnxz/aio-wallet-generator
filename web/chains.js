/**
 * chains.js — Chain Directory (DeFi Llama-inspired table)
 * Real logos, data-driven table, professional layout
 */

const CHAINS = [
  {
    name: 'EVM', networks: 22,
    logo: 'images/eth.png',
    curve: 'secp256k1', addrLen: 42, encoding: 'Hex (0x)',
    derivation: "m/44'/60'/0'/0/0", mnemonic: true,
    subs: ['Ethereum','BNB Chain','Polygon','Arbitrum','Optimism','Base','zkSync','Avalanche','Fantom','Cronos','Gnosis','Celo','Moonbeam','Harmony','Metis','Mantle','Linea','Scroll','Blast','Mode','Manta','Zora'],
  },
  {
    name: 'Solana', networks: 1,
    logo: 'images/sol.png',
    curve: 'Ed25519', addrLen: '32-44', encoding: 'Base58',
    derivation: "m/44'/501'/0'/0'", mnemonic: true,
    subs: ['Solana Mainnet'],
  },
  {
    name: 'Bitcoin', networks: 1,
    logo: 'images/btc.png',
    curve: 'secp256k1', addrLen: '25-62', encoding: 'Base58 / Bech32',
    derivation: "m/44'/0'/0'/0/0", mnemonic: true,
    subs: ['Bitcoin Mainnet'],
  },
  {
    name: 'Tron', networks: 1,
    logo: 'images/trx.png',
    curve: 'secp256k1', addrLen: 34, encoding: 'Base58Check',
    derivation: "m/44'/195'/0'/0/0", mnemonic: true,
    subs: ['Tron Mainnet'],
  },
  {
    name: 'Sui', networks: 1,
    logo: 'images/sui.jpeg',
    curve: 'Ed25519', addrLen: 66, encoding: 'Hex (0x)',
    derivation: 'Move VM', mnemonic: false,
    subs: ['Sui Mainnet'],
  },
  {
    name: 'Aptos', networks: 1,
    logo: 'images/apt.png',
    curve: 'Ed25519', addrLen: 66, encoding: 'Hex (0x)',
    derivation: 'Block-STM', mnemonic: false,
    subs: ['Aptos Mainnet'],
  },
  {
    name: 'Cosmos', networks: 12,
    logo: 'images/atom.png',
    curve: 'secp256k1', addrLen: '~45', encoding: 'Bech32',
    derivation: "m/44'/118'/0'/0/0", mnemonic: true,
    subs: ['ATOM','OSMO','TIA','SEI','INJ','JUNO','EVMOS','KAVA','STRIDE','AKT','STARS','REGEN'],
  },
  {
    name: 'TON', networks: 1,
    logo: 'images/ton.png',
    curve: 'Ed25519', addrLen: 48, encoding: 'Base64url',
    derivation: 'TON SDK', mnemonic: false,
    subs: ['TON Mainnet'],
  },
  {
    name: 'Starknet', networks: 1,
    logo: 'images/strk.png',
    curve: 'STARK', addrLen: 66, encoding: 'Hex (0x)',
    derivation: 'Cairo VM', mnemonic: false,
    subs: ['Starknet Mainnet'],
  },
];

// Build table
const tbody = document.getElementById('chains-tbody');
const totalNets = document.getElementById('total-nets');
let total = 0;

CHAINS.forEach((c, i) => {
  total += c.networks;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="ct-rank">${i + 1}</td>
    <td class="ct-chain">
      <img src="${c.logo}" alt="${c.name}" width="28" height="28">
      <div>
        <span class="ct-name">${c.name}</span>
        <span class="ct-nets">${c.networks === 1 ? '' : c.networks + ' networks'}</span>
      </div>
    </td>
    <td class="ct-curve">${c.curve}</td>
    <td class="ct-encoding">${c.encoding}</td>
    <td class="ct-len">${c.addrLen}</td>
    <td class="ct-deriv"><code>${c.derivation}</code></td>
    <td class="ct-mnemonic">${c.mnemonic ? '<span class="ct-yes">✓</span>' : '<span class="ct-no">✗</span>'}</td>
  `;
  
  // Click to expand networks
  tr.addEventListener('click', () => {
    const existing = tr.nextElementSibling;
    if (existing && existing.classList.contains('ct-expand-row')) {
      existing.remove();
      tr.classList.remove('expanded');
      return;
    }
    // Remove other expansions
    document.querySelectorAll('.ct-expand-row').forEach(r => r.remove());
    document.querySelectorAll('tr.expanded').forEach(r => r.classList.remove('expanded'));
    
    const expandTr = document.createElement('tr');
    expandTr.className = 'ct-expand-row';
    expandTr.innerHTML = `
      <td colspan="7">
        <div class="ct-expand-content">
          <span class="ct-expand-label">Supported Networks</span>
          <div class="ct-expand-pills">
            ${c.subs.map(s => `<span class="ct-pill">${s}</span>`).join('')}
          </div>
        </div>
      </td>
    `;
    tr.after(expandTr);
    tr.classList.add('expanded');
  });
  
  tbody.appendChild(tr);
});

totalNets.textContent = total + '+';
