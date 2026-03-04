/**
 * popup.js — Extension Popup Logic
 * 
 * Handles 3 tabs:
 * 1. Generate — create wallets, copy, save to vault
 * 2. Validate — detect chain, validate format
 * 3. Vault — lock/unlock, view saved wallets
 */

let currentPassword = null;

// ============================
// TAB SWITCHING
// ============================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});


// ============================
// GENERATE TAB
// ============================
document.getElementById('gen-btn').addEventListener('click', async () => {
  const chain = document.getElementById('gen-chain').value;
  const count = parseInt(document.getElementById('gen-count').value);
  const btn = document.getElementById('gen-btn');
  const results = document.getElementById('gen-results');
  
  btn.disabled = true;
  btn.textContent = 'Generating...';
  results.innerHTML = '';
  
  try {
    for (let i = 0; i < count; i++) {
      const wallet = await generateWallet(chain);
      const card = createWalletCard(wallet);
      results.appendChild(card);
    }
  } catch (e) {
    results.innerHTML = `<div style="color:var(--red);font-size:12px">Error: ${e.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Generate';
  }
});

function createWalletCard(wallet) {
  const card = document.createElement('div');
  card.className = 'wallet-card';
  card.innerHTML = `
    <div class="wallet-chain">${wallet.chain}</div>
    <div class="wallet-row">
      <span class="wallet-label">ADDR</span>
      <span class="wallet-value">${truncate(wallet.address, 20)}</span>
    </div>
    <div class="wallet-row">
      <span class="wallet-label">KEY</span>
      <span class="wallet-value">${truncate(wallet.privateKey, 20)}</span>
    </div>
    <div class="wallet-actions">
      <button class="copy-btn" data-copy="${wallet.address}">📋 Address</button>
      <button class="copy-btn" data-copy="${wallet.privateKey}">🔑 Key</button>
      <button class="save-btn" title="Save to vault">💾</button>
    </div>
  `;
  
  // Copy buttons
  card.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add('copied');
      btn.textContent = '✓ Copied';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = btn.dataset.copy.startsWith('0x') && btn.dataset.copy.length > 50 ? '🔑 Key' : '📋 Address';
      }, 1500);
    });
  });
  
  // Save to vault
  card.querySelector('.save-btn').addEventListener('click', async () => {
    if (!VAULT.isUnlocked) {
      alert('Unlock vault first (Vault tab)');
      return;
    }
    vaultAddWallet(wallet);
    await vaultSave(currentPassword);
    renderVault();
    card.querySelector('.save-btn').textContent = '✓';
  });
  
  return card;
}


// ============================
// VALIDATE TAB
// ============================
document.getElementById('val-btn').addEventListener('click', () => {
  const addr = document.getElementById('val-input').value.trim();
  const result = document.getElementById('val-result');
  
  if (!addr) {
    result.className = 'val-result invalid';
    result.innerHTML = 'Enter an address';
    return;
  }
  
  const chain = detectChain(addr);
  
  if (chain) {
    result.className = 'val-result valid';
    result.innerHTML = `
      <div class="val-chain">✅ ${chain}</div>
      <div>Address format is valid</div>
    `;
  } else {
    result.className = 'val-result invalid';
    result.innerHTML = `
      <div class="val-chain">❌ Unknown</div>
      <div>Could not detect chain — invalid format</div>
    `;
  }
});

// Enter key
document.getElementById('val-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('val-btn').click();
});


// ============================
// VAULT TAB
// ============================

// Unlock vault
document.getElementById('vault-unlock').addEventListener('click', async () => {
  const pass = document.getElementById('vault-pass').value;
  if (!pass) return;
  
  try {
    await vaultLoad(pass);
    currentPassword = pass;
    showVaultUnlocked();
    renderVault();
  } catch {
    alert('Wrong password or no vault found');
  }
});

// Create new vault
document.getElementById('vault-create').addEventListener('click', async () => {
  const pass = document.getElementById('vault-pass').value;
  if (!pass) { alert('Enter a password first'); return; }
  if (pass.length < 4) { alert('Password too short'); return; }
  
  await vaultCreate(pass);
  currentPassword = pass;
  showVaultUnlocked();
  renderVault();
});

// Lock vault
document.getElementById('vault-lock').addEventListener('click', () => {
  vaultLock();
  currentPassword = null;
  showVaultLocked();
});

// Export vault
document.getElementById('vault-export').addEventListener('click', () => {
  if (!VAULT.wallets.length) return;
  const json = JSON.stringify(VAULT.wallets, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aio-vault-${Date.now()}.json`;
  a.click();
});

function showVaultLocked() {
  document.getElementById('vault-locked').style.display = '';
  document.getElementById('vault-unlocked').style.display = 'none';
}

function showVaultUnlocked() {
  document.getElementById('vault-locked').style.display = 'none';
  document.getElementById('vault-unlocked').style.display = '';
}

function renderVault() {
  const list = document.getElementById('vault-list');
  document.getElementById('vault-count').textContent = `${VAULT.wallets.length} wallet(s)`;
  
  list.innerHTML = VAULT.wallets.map((w, i) => `
    <div class="vault-item">
      <div class="vault-item-chain">${w.chain}</div>
      <div class="vault-item-addr">${truncate(w.address, 30)}</div>
      <div class="vault-item-actions">
        <button class="copy-btn" data-copy="${w.address}">📋</button>
        <button class="copy-btn" data-copy="${w.privateKey}">🔑</button>
      </div>
    </div>
  `).join('');
  
  // Attach copy handlers
  list.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = btn.dataset.copy.length > 50 ? '🔑' : '📋', 1000);
    });
  });
}


// ============================
// SCANNER TOGGLE
// ============================
document.getElementById('scanner-toggle').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCANNER' });
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
// HELPERS
// ============================
function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max / 2) + '...' + str.slice(-(max / 2));
}
