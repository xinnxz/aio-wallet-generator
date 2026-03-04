/**
 * popup.js — Extension Popup Logic (v3 — Vault-first + Bulk)
 * 
 * Flow:
 * 1. Open popup → Vault Gate (must unlock/create)
 * 2. After unlock → Main app (Generate, Validate, Saved tabs)
 * 3. Generate: bulk wallets with progress, save all, copy all, export CSV
 * 4. Lock button in header to re-lock
 */

let currentPassword = null;
let generatedWallets = [];

// ============================
// CHAIN REGISTRY
// ============================
const CHAINS = [
  { id: 'evm',     name: 'EVM',     hint: 'Ethereum, BSC, Polygon, Arbitrum',  aliases: ['eth', 'ethereum', 'bsc', 'polygon', 'matic', 'arb', 'arbitrum', 'avax', 'avalanche', 'op', 'optimism', 'base', 'zksync'] },
  { id: 'solana',  name: 'Solana',  hint: 'SOL mainnet',        aliases: ['sol'] },
  { id: 'bitcoin', name: 'Bitcoin', hint: 'BTC mainnet',        aliases: ['btc'] },
  { id: 'tron',    name: 'Tron',    hint: 'TRX mainnet',        aliases: ['trx'] },
  { id: 'sui',     name: 'Sui',     hint: 'SUI mainnet',        aliases: [] },
  { id: 'aptos',   name: 'Aptos',   hint: 'APT mainnet',        aliases: ['apt'] },
  { id: 'cosmos',  name: 'Cosmos',  hint: 'ATOM mainnet',       aliases: ['atom'] },
  { id: 'ton',     name: 'TON',     hint: 'Telegram Open Network', aliases: ['toncoin'] },
  { id: 'starknet',name: 'Starknet',hint: 'STRK L2',            aliases: ['strk'] },
];

function findChain(q) {
  if (!q) return CHAINS;
  q = q.toLowerCase().trim();
  return CHAINS.filter(c =>
    c.id.includes(q) || c.name.toLowerCase().includes(q) || c.aliases.some(a => a.includes(q))
  );
}

function resolveChain(q) {
  q = q.toLowerCase().trim();
  return CHAINS.find(c => c.id === q || c.name.toLowerCase() === q || c.aliases.includes(q))
    || CHAINS.find(c => c.id.startsWith(q) || c.name.toLowerCase().startsWith(q));
}


// ============================
// VAULT GATE
// ============================
(async () => {
  const hasVault = await vaultHasData();
  if (hasVault) {
    document.getElementById('vault-unlock-btn').style.display = '';
    document.getElementById('vault-create-btn').style.display = 'none';
  }
})();

// Create new vault
document.getElementById('vault-create-btn').addEventListener('click', async () => {
  const pass = document.getElementById('vault-pass').value;
  if (!pass) { toast('Enter a password', 'error'); return; }
  if (pass.length < 4) { toast('Min 4 characters', 'error'); return; }
  await vaultCreate(pass);
  currentPassword = pass;
  unlockApp();
  toast('Vault created', 'success');
});

// Unlock existing vault
document.getElementById('vault-unlock-btn').addEventListener('click', async () => {
  const pass = document.getElementById('vault-pass').value;
  if (!pass) { toast('Enter your password', 'error'); return; }
  try {
    await vaultLoad(pass);
    currentPassword = pass;
    unlockApp();
    toast('Vault unlocked', 'success');
  } catch {
    toast('Wrong password', 'error');
  }
});

// Enter key on password
document.getElementById('vault-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const unlock = document.getElementById('vault-unlock-btn');
    const create = document.getElementById('vault-create-btn');
    if (unlock.style.display !== 'none') unlock.click();
    else create.click();
  }
});

// Lock vault
document.getElementById('vault-lock-btn').addEventListener('click', () => {
  vaultLock();
  currentPassword = null;
  generatedWallets = [];
  document.getElementById('vault-gate').style.display = '';
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('vault-lock-btn').style.display = 'none';
  document.getElementById('vault-pass').value = '';
  document.getElementById('gen-results').innerHTML = '';
  document.getElementById('bulk-actions').style.display = 'none';
  toast('Vault locked', 'success');
});

// Toggle password
document.getElementById('toggle-vault-pass').addEventListener('click', () => {
  const inp = document.getElementById('vault-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

function unlockApp() {
  document.getElementById('vault-gate').style.display = 'none';
  document.getElementById('main-app').style.display = '';
  document.getElementById('vault-lock-btn').style.display = '';
  renderVault();
}


// ============================
// TABS
// ============================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});


// ============================
// CHAIN AUTOCOMPLETE
// ============================
const chainInput = document.getElementById('gen-chain');
const chainDD = document.getElementById('chain-dropdown');

chainInput.addEventListener('focus', () => renderDD(chainInput.value));
chainInput.addEventListener('input', () => renderDD(chainInput.value));
chainInput.addEventListener('blur', () => setTimeout(() => chainDD.classList.remove('open'), 120));

function renderDD(q) {
  const m = findChain(q);
  if (!m.length) { chainDD.classList.remove('open'); return; }
  chainDD.innerHTML = m.map(c => `
    <div class="combo-option" data-id="${c.id}">
      <span class="combo-option-name">${c.name}</span>
      <span class="combo-option-hint">${c.hint}</span>
    </div>`).join('');
  chainDD.classList.add('open');
  chainDD.querySelectorAll('.combo-option').forEach(opt => {
    opt.addEventListener('mousedown', e => {
      e.preventDefault();
      chainInput.value = opt.dataset.id;
      chainDD.classList.remove('open');
    });
  });
}


// ============================
// BULK GENERATE
// ============================
document.getElementById('gen-btn').addEventListener('click', async () => {
  const chain = resolveChain(chainInput.value);
  const count = Math.min(Math.max(parseInt(document.getElementById('gen-count').value) || 1, 1), 500);

  if (!chain) { toast('Unknown chain — try: eth, sol, btc', 'error'); return; }

  const btn = document.getElementById('gen-btn');
  const results = document.getElementById('gen-results');
  const progress = document.getElementById('gen-progress');
  const fill = document.getElementById('gen-progress-fill');
  const label = document.getElementById('gen-progress-label');
  const actions = document.getElementById('bulk-actions');

  btn.disabled = true;
  btn.innerHTML = svg('loader', 14) + ' Generating...';
  results.innerHTML = '';
  progress.style.display = 'flex';
  actions.style.display = 'none';
  generatedWallets = [];

  try {
    for (let i = 0; i < count; i++) {
      const w = await generateWallet(chain.id);
      w.chain = chain.name;
      generatedWallets.push(w);

      // Update progress
      const pct = ((i + 1) / count * 100).toFixed(0);
      fill.style.width = pct + '%';
      label.textContent = `${i + 1} / ${count}`;

      // Add row
      results.appendChild(createRow(w, i + 1));

      // Yield to UI every 10 wallets
      if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
    }

    actions.style.display = 'flex';
    document.getElementById('bulk-count').textContent = `${count} ${chain.name} wallets`;
    toast(`${count} wallets generated`, 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = svg('zap', 14) + ' Generate Wallets';
    setTimeout(() => { progress.style.display = 'none'; }, 600);
  }
});

function createRow(w, idx) {
  const row = document.createElement('div');
  row.className = 'r-row';
  row.innerHTML = `
    <span class="r-idx">${idx}</span>
    <span class="r-addr" title="${w.address}">${w.address}</span>
    <div class="r-actions">
      <button class="r-btn" data-val="${w.address}" title="Copy address">${svg('copy', 10)}</button>
      <button class="r-btn" data-val="${w.privateKey}" title="Copy key">${svg('key', 10)}</button>
    </div>`;

  row.querySelectorAll('.r-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.val);
      btn.classList.add('copied');
      btn.innerHTML = svg('check', 10);
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = btn.dataset.val.length > 50 ? svg('key', 10) : svg('copy', 10);
      }, 1000);
    });
  });

  return row;
}

// Save All
document.getElementById('save-all-btn').addEventListener('click', async () => {
  if (!generatedWallets.length) return;
  generatedWallets.forEach(w => vaultAddWallet(w));
  await vaultSave(currentPassword);
  renderVault();
  toast(`${generatedWallets.length} wallets saved to vault`, 'success');
});

// Copy All (addresses)
document.getElementById('copy-all-btn').addEventListener('click', () => {
  const addrs = generatedWallets.map(w => w.address).join('\n');
  navigator.clipboard.writeText(addrs);
  toast('All addresses copied', 'success');
});

// Export CSV
document.getElementById('export-csv-btn').addEventListener('click', () => {
  let csv = 'chain,address,privateKey\n';
  generatedWallets.forEach(w => {
    csv += `${w.chain},${w.address},${w.privateKey}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `aio-wallets-${Date.now()}.csv`;
  a.click();
  toast('CSV exported', 'success');
});


// ============================
// VALIDATE (single)
// ============================
document.getElementById('val-btn').addEventListener('click', () => {
  const addr = document.getElementById('val-input').value.trim();
  if (!addr) { toast('Paste an address', 'error'); return; }
  const chain = detectChain(addr);
  const r = document.getElementById('val-result');
  if (chain) {
    r.innerHTML = `<div class="val-card val-card--valid">
      <div class="val-icon">${svg('check-circle', 16)} Valid</div>
      <div class="val-detail">Matches known address format</div>
      <span class="val-chain-badge">${chain}</span></div>`;
  } else {
    r.innerHTML = `<div class="val-card val-card--invalid">
      <div class="val-icon">${svg('x-circle', 16)} Invalid</div>
      <div class="val-detail">No matching chain format found</div></div>`;
  }
});

document.getElementById('val-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('val-btn').click();
});

document.getElementById('val-paste').addEventListener('click', async () => {
  const t = await navigator.clipboard.readText();
  document.getElementById('val-input').value = t;
  document.getElementById('val-btn').click();
});

// Batch validate
document.getElementById('val-batch-btn').addEventListener('click', () => {
  const text = document.getElementById('val-batch').value.trim();
  if (!text) { toast('Paste addresses', 'error'); return; }
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const r = document.getElementById('val-result');
  let html = '<div class="val-batch-results">';
  let valid = 0;
  lines.forEach(addr => {
    const chain = detectChain(addr);
    if (chain) {
      valid++;
      html += `<div class="val-batch-row val-batch-row--valid">
        <span class="val-batch-chain">${chain}</span>
        <span class="val-batch-addr">${addr}</span></div>`;
    } else {
      html += `<div class="val-batch-row val-batch-row--invalid">
        <span class="val-batch-chain">INVALID</span>
        <span class="val-batch-addr">${addr}</span></div>`;
    }
  });
  html += '</div>';
  r.innerHTML = `<div style="margin-top:10px;font-size:11px;color:var(--text-dim)">${valid}/${lines.length} valid</div>` + html;
});


// ============================
// VAULT (saved tab)
// ============================
function renderVault() {
  const list = document.getElementById('vault-list');
  const empty = document.getElementById('vault-empty');
  document.getElementById('vault-count').textContent = VAULT.wallets.length;
  if (!VAULT.wallets.length) { list.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  list.innerHTML = VAULT.wallets.map((w, i) => `
    <div class="r-row">
      <span class="r-idx">${i + 1}</span>
      <span class="r-addr" title="${w.address}">${w.address}</span>
      <div class="r-actions">
        <button class="r-btn" data-val="${w.address}" title="Copy address">${svg('copy', 10)}</button>
        <button class="r-btn" data-val="${w.privateKey}" title="Copy key">${svg('key', 10)}</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('.r-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.val);
      btn.classList.add('copied');
      btn.innerHTML = svg('check', 10);
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = btn.dataset.val.length > 50 ? svg('key', 10) : svg('copy', 10);
      }, 1000);
    });
  });
}

document.getElementById('vault-export-btn').addEventListener('click', () => {
  if (!VAULT.wallets.length) { toast('Nothing to export', 'error'); return; }
  let csv = 'chain,address,privateKey\n';
  VAULT.wallets.forEach(w => csv += `${w.chain},${w.address},${w.privateKey}\n`);
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `aio-vault-${Date.now()}.csv`;
  a.click();
  toast('Vault exported', 'success');
});


// ============================
// SCANNER
// ============================
document.getElementById('scanner-toggle').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) { chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCANNER' }); toast('Scanner toggled', 'success'); }
  } catch { toast('Cannot scan this page', 'error'); }
});


// ============================
// TOAST
// ============================
function toast(msg, type = 'success') {
  const stack = document.getElementById('toast-stack');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `${svg(type === 'success' ? 'check-circle' : 'alert-circle', 13)} ${msg}`;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); }, 2000);
}


// ============================
// SVG ICON SYSTEM
// ============================
function svg(name, s = 16) {
  const d = {
    'zap':     '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    'check':   '<polyline points="20 6 9 17 4 12"/>',
    'check-circle':'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'x-circle':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    'alert-circle':'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    'copy':    '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    'key':     '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    'save':    '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    'loader':  '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d[name]||''}</svg>`;
}
