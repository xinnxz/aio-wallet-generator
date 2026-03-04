/**
 * popup.js — Extension Popup Logic (v2 — Enhanced)
 * 
 * Features:
 * - Free-form chain input with autocomplete dropdown
 * - Free-form wallet count (1-100)
 * - SVG-only UI (no emojis)
 * - Toast notification system
 * - Full vault integration
 */

let currentPassword = null;

// ============================
// CHAIN REGISTRY (free-form)
// ============================
const CHAINS = [
  { id: 'evm',     name: 'EVM',     hint: 'Ethereum, BSC, Polygon...',  aliases: ['eth', 'ethereum', 'bsc', 'polygon', 'matic', 'arb', 'arbitrum', 'avax', 'avalanche', 'op', 'optimism', 'base'] },
  { id: 'solana',  name: 'Solana',  hint: 'SOL mainnet',                aliases: ['sol'] },
  { id: 'bitcoin', name: 'Bitcoin', hint: 'BTC mainnet',                aliases: ['btc'] },
  { id: 'tron',    name: 'Tron',    hint: 'TRX mainnet',                aliases: ['trx'] },
  { id: 'sui',     name: 'Sui',     hint: 'SUI mainnet',                aliases: [] },
  { id: 'aptos',   name: 'Aptos',   hint: 'APT mainnet',                aliases: ['apt'] },
  { id: 'cosmos',  name: 'Cosmos',  hint: 'ATOM mainnet',               aliases: ['atom'] },
  { id: 'ton',     name: 'TON',     hint: 'Telegram Open Network',      aliases: ['toncoin'] },
  { id: 'starknet',name: 'Starknet',hint: 'STRK L2',                    aliases: ['strk'] },
];

function findChain(query) {
  const q = query.toLowerCase().trim();
  if (!q) return CHAINS;
  return CHAINS.filter(c =>
    c.id.includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.aliases.some(a => a.includes(q))
  );
}

function resolveChain(query) {
  const q = query.toLowerCase().trim();
  return CHAINS.find(c =>
    c.id === q ||
    c.name.toLowerCase() === q ||
    c.aliases.includes(q)
  ) || CHAINS.find(c =>
    c.id.startsWith(q) ||
    c.name.toLowerCase().startsWith(q)
  );
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
const chainDropdown = document.getElementById('chain-dropdown');

chainInput.addEventListener('focus', () => renderDropdown(chainInput.value));
chainInput.addEventListener('input', () => renderDropdown(chainInput.value));
chainInput.addEventListener('blur', () => {
  setTimeout(() => chainDropdown.classList.remove('open'), 150);
});

function renderDropdown(query) {
  const matches = findChain(query);
  if (!matches.length) {
    chainDropdown.classList.remove('open');
    return;
  }
  
  chainDropdown.innerHTML = matches.map(c => `
    <div class="combo-option" data-id="${c.id}">
      <span class="combo-option-name">${c.name}</span>
      <span class="combo-option-hint">${c.hint}</span>
    </div>
  `).join('');
  
  chainDropdown.classList.add('open');
  
  chainDropdown.querySelectorAll('.combo-option').forEach(opt => {
    opt.addEventListener('mousedown', (e) => {
      e.preventDefault();
      chainInput.value = opt.dataset.id;
      chainDropdown.classList.remove('open');
    });
  });
}


// ============================
// GENERATE
// ============================
document.getElementById('gen-btn').addEventListener('click', async () => {
  const chainQuery = chainInput.value.trim();
  const count = Math.min(Math.max(parseInt(document.getElementById('gen-count').value) || 1, 1), 100);
  const chain = resolveChain(chainQuery);
  const btn = document.getElementById('gen-btn');
  const results = document.getElementById('gen-results');
  
  if (!chain) {
    toast('Unknown chain — try: eth, sol, btc, tron', 'error');
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = svgIcon('loader') + ' Generating...';
  results.innerHTML = '';
  
  try {
    for (let i = 0; i < count; i++) {
      const wallet = await generateWallet(chain.id);
      wallet.chain = chain.name;
      results.appendChild(createWalletCard(wallet));
    }
    toast(`${count} ${chain.name} wallet${count > 1 ? 's' : ''} generated`, 'success');
  } catch (e) {
    toast('Generation failed: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = svgIcon('zap') + ' Generate';
  }
});

function createWalletCard(wallet) {
  const card = document.createElement('div');
  card.className = 'w-card';
  card.innerHTML = `
    <div class="w-chain">
      <span class="w-chain-name">${wallet.chain}</span>
      <div class="w-chain-actions">
        <button class="w-copy" data-val="${wallet.address}" title="Copy address">${svgIcon('copy', 12)}</button>
        <button class="w-copy" data-val="${wallet.privateKey}" title="Copy key">${svgIcon('key', 12)}</button>
        <button class="w-save" title="Save to vault">${svgIcon('save', 12)}</button>
      </div>
    </div>
    <div class="w-field">
      <div class="w-label">Address</div>
      <div class="w-value">${wallet.address}</div>
    </div>
    <div class="w-field">
      <div class="w-label">Private Key</div>
      <div class="w-value">${wallet.privateKey}</div>
    </div>
  `;
  
  // Copy handlers
  card.querySelectorAll('.w-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.val);
      btn.classList.add('copied');
      btn.innerHTML = svgIcon('check', 12);
      toast('Copied to clipboard', 'success');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = btn.dataset.val.length > 50 ? svgIcon('key', 12) : svgIcon('copy', 12);
      }, 1500);
    });
  });
  
  // Save to vault
  card.querySelector('.w-save').addEventListener('click', async () => {
    if (!VAULT.isUnlocked) {
      toast('Unlock vault first', 'error');
      return;
    }
    vaultAddWallet(wallet);
    await vaultSave(currentPassword);
    card.querySelector('.w-save').innerHTML = svgIcon('check', 12);
    toast('Saved to vault', 'success');
    renderVault();
  });
  
  return card;
}


// ============================
// VALIDATE
// ============================
document.getElementById('val-btn').addEventListener('click', () => {
  const addr = document.getElementById('val-input').value.trim();
  const result = document.getElementById('val-result');
  
  if (!addr) {
    toast('Paste an address to validate', 'error');
    return;
  }
  
  const chain = detectChain(addr);
  
  if (chain) {
    result.innerHTML = `
      <div class="val-card val-card--valid">
        <div class="val-icon">${svgIcon('check-circle', 18)} Valid Address</div>
        <div class="val-detail">Format matches known chain pattern</div>
        <span class="val-chain-badge">${chain}</span>
      </div>`;
  } else {
    result.innerHTML = `
      <div class="val-card val-card--invalid">
        <div class="val-icon">${svgIcon('x-circle', 18)} Invalid Format</div>
        <div class="val-detail">Could not match to any known chain format (EVM, Solana, Bitcoin, Tron, Cosmos, TON, Starknet, Sui, Aptos)</div>
      </div>`;
  }
});

// Enter key
document.getElementById('val-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('val-btn').click();
});

// Paste button
document.getElementById('val-paste').addEventListener('click', async () => {
  const text = await navigator.clipboard.readText();
  document.getElementById('val-input').value = text;
  document.getElementById('val-btn').click();
});


// ============================
// VAULT
// ============================
document.getElementById('vault-unlock').addEventListener('click', async () => {
  const pass = document.getElementById('vault-pass').value;
  if (!pass) { toast('Enter password', 'error'); return; }
  try {
    await vaultLoad(pass);
    currentPassword = pass;
    showVaultState(true);
    renderVault();
    toast('Vault unlocked', 'success');
  } catch {
    toast('Wrong password or no vault found', 'error');
  }
});

document.getElementById('vault-create').addEventListener('click', async () => {
  const pass = document.getElementById('vault-pass').value;
  if (!pass) { toast('Enter a password first', 'error'); return; }
  if (pass.length < 4) { toast('Password too short (min 4)', 'error'); return; }
  await vaultCreate(pass);
  currentPassword = pass;
  showVaultState(true);
  renderVault();
  toast('New vault created', 'success');
});

document.getElementById('vault-lock').addEventListener('click', () => {
  vaultLock();
  currentPassword = null;
  showVaultState(false);
  toast('Vault locked', 'success');
});

document.getElementById('vault-export').addEventListener('click', () => {
  if (!VAULT.wallets.length) { toast('Nothing to export', 'error'); return; }
  const json = JSON.stringify(VAULT.wallets, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aio-vault-${Date.now()}.json`;
  a.click();
  toast('Exported vault', 'success');
});

// Toggle password visibility
document.getElementById('toggle-vault-pass').addEventListener('click', () => {
  const input = document.getElementById('vault-pass');
  input.type = input.type === 'password' ? 'text' : 'password';
});

function showVaultState(unlocked) {
  document.getElementById('vault-locked').style.display = unlocked ? 'none' : '';
  document.getElementById('vault-unlocked').style.display = unlocked ? '' : 'none';
}

function renderVault() {
  const list = document.getElementById('vault-list');
  const empty = document.getElementById('vault-empty');
  document.getElementById('vault-count').textContent = VAULT.wallets.length;
  
  if (!VAULT.wallets.length) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }
  
  empty.style.display = 'none';
  list.innerHTML = VAULT.wallets.map(w => `
    <div class="v-item">
      <span class="v-chain">${w.chain}</span>
      <span class="v-addr">${w.address}</span>
      <div class="v-actions">
        <button class="w-copy" data-val="${w.address}" title="Copy address">${svgIcon('copy', 11)}</button>
        <button class="w-copy" data-val="${w.privateKey}" title="Copy key">${svgIcon('key', 11)}</button>
      </div>
    </div>
  `).join('');
  
  list.querySelectorAll('.w-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.val);
      btn.classList.add('copied');
      btn.innerHTML = svgIcon('check', 11);
      toast('Copied', 'success');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = btn.dataset.val.length > 50 ? svgIcon('key', 11) : svgIcon('copy', 11);
      }, 1000);
    });
  });
}


// ============================
// SCANNER TOGGLE
// ============================
document.getElementById('scanner-toggle').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCANNER' });
      toast('Scanner toggled', 'success');
    }
  } catch {
    toast('Cannot scan this page', 'error');
  }
});


// ============================
// INIT
// ============================
(async () => {
  const hasVault = await vaultHasData();
  if (!hasVault) {
    document.getElementById('vault-unlock').style.display = 'none';
  }
})();


// ============================
// TOAST SYSTEM
// ============================
function toast(msg, type = 'success') {
  const stack = document.getElementById('toast-stack');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `${svgIcon(type === 'success' ? 'check-circle' : 'alert-circle', 14)} ${msg}`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'all 0.2s';
    setTimeout(() => el.remove(), 200);
  }, 2500);
}


// ============================
// SVG ICON SYSTEM
// ============================
function svgIcon(name, size = 16) {
  const icons = {
    'zap':   `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`,
    'check': `<polyline points="20 6 9 17 4 12"/>`,
    'check-circle': `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    'x-circle': `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`,
    'alert-circle': `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    'copy':  `<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`,
    'key':   `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>`,
    'save':  `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
    'loader': `<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>`,
  };
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ''}</svg>`;
}
