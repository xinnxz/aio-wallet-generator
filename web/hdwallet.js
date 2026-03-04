/**
 * hdwallet.js — HD Wallet Derivation Explorer
 * 
 * HD (Hierarchical Deterministic) wallet:
 * Dari 1 mnemonic bisa derive unlimited accounts.
 * 
 * BIP44 path format: m / purpose' / coin_type' / account' / change / address_index
 * - EVM:     m/44'/60'/0'/0/0, 0/1, 0/2, ...
 * - Bitcoin: m/44'/0'/0'/0/0, 0/1, 0/2, ...
 * 
 * Setiap index menghasilkan private key + address berbeda,
 * tapi semuanya bisa di-recover dari mnemonic yang sama.
 */

// ============================
// DERIVATION PATHS PER CHAIN
// ============================
const CHAIN_PATHS = {
  evm: { basePath: "m/44'/60'/0'/0", label: 'EVM (Ethereum)' },
  btc: { basePath: "m/44'/0'/0'/0", label: 'Bitcoin' },
};


// ============================
// DOM REFS
// ============================
const dom = {
  mnemonic:   document.getElementById('hd-mnemonic'),
  chain:      document.getElementById('hd-chain'),
  count:      document.getElementById('hd-count'),
  path:       document.getElementById('hd-path'),
  deriveBtn:  document.getElementById('hd-derive'),
  results:    document.getElementById('hd-results'),
  label:      document.getElementById('hd-results-label'),
  tbody:      document.getElementById('hd-tbody'),
  exportBtn:  document.getElementById('hd-export'),
};


// ============================
// CHAIN SELECT → UPDATE PATH
// ============================
dom.chain.addEventListener('change', () => {
  const chain = CHAIN_PATHS[dom.chain.value];
  if (chain) dom.path.value = chain.basePath;
});


// ============================
// DERIVE ACCOUNTS
// ============================

let derivedAccounts = [];

dom.deriveBtn.addEventListener('click', async () => {
  const mn = dom.mnemonic.value.trim();
  if (!mn) return toast('Enter a mnemonic phrase', true);
  
  const words = mn.split(/\s+/);
  if (words.length !== 12 && words.length !== 24) {
    return toast(`Expected 12 or 24 words, got ${words.length}`, true);
  }
  
  const count = parseInt(dom.count.value);
  const basePath = dom.path.value.trim();
  
  dom.deriveBtn.disabled = true;
  dom.deriveBtn.textContent = 'Deriving...';
  
  try {
    /**
     * ethers.HDNodeWallet.fromPhrase():
     * Mnemonic → seed → master key → derive child keys
     * 
     * Kita derive dari basePath + /index
     * Contoh: m/44'/60'/0'/0/0, m/44'/60'/0'/0/1, ...
     */
    const hdNode = ethers.HDNodeWallet.fromPhrase(mn, undefined, basePath);
    
    derivedAccounts = [];
    dom.tbody.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const child = hdNode.deriveChild(i);
      const account = {
        index: i,
        path: `${basePath}/${i}`,
        address: child.address,
        privateKey: child.privateKey,
      };
      derivedAccounts.push(account);
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ct-rank">${i}</td>
        <td><code>${account.path}</code></td>
        <td class="mono" style="font-size:11px;word-break:break-all">${account.address}</td>
        <td class="mono" style="font-size:11px;word-break:break-all;color:var(--gray-400)">${maskKey(account.privateKey)}</td>
        <td>
          <button class="copy-btn copy-btn--icon hd-copy" data-addr="${account.address}" data-key="${account.privateKey}" title="Copy address">
            <i class="hgi-stroke hgi-copy-01"></i>
          </button>
        </td>
      `;
      dom.tbody.appendChild(tr);
    }
    
    dom.results.style.display = '';
    dom.label.textContent = `${count} accounts derived from ${basePath}`;
    dom.results.scrollIntoView({ behavior: 'smooth' });
    toast(`${count} accounts derived`);
  } catch (e) {
    toast('Derivation failed: ' + e.message, true);
  } finally {
    dom.deriveBtn.disabled = false;
    dom.deriveBtn.innerHTML = '<i class="hgi-stroke hgi-tree-06"></i> Derive Accounts';
  }
});


// ============================
// COPY ADDRESS / KEY
// ============================
document.addEventListener('click', e => {
  const btn = e.target.closest('.hd-copy');
  if (!btn) return;
  const addr = btn.dataset.addr;
  navigator.clipboard.writeText(addr).then(() => toast('Address copied'));
});


// ============================
// EXPORT CSV
// ============================
dom.exportBtn.addEventListener('click', () => {
  if (!derivedAccounts.length) return toast('Derive accounts first', true);
  
  const csv = 'Index,Path,Address,PrivateKey\n' +
    derivedAccounts.map(a => `${a.index},"${a.path}","${a.address}","${a.privateKey}"`).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hd-wallet-${dom.chain.value}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV exported');
});


// ============================
// HELPERS
// ============================

function maskKey(key) {
  // Show first 6 and last 4 chars
  return key.slice(0, 8) + '•'.repeat(20) + key.slice(-6);
}

function toast(msg, isError = false) {
  const wrap = document.getElementById('toast-wrap');
  const t = document.createElement('div');
  t.className = `toast ${isError ? 'toast--error' : ''}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
