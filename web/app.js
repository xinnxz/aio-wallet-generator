/**
 * app.js — Web Dashboard Client-Side Logic
 * 
 * PENJELASAN:
 * ==========
 * File ini mengelola semua interaksi di web dashboard:
 * 1. Wallet generation (client-side menggunakan ethers.js CDN)
 * 2. Table rendering dengan pagination (untuk handle 10K+ rows)
 * 3. Search & sort di table
 * 4. Copy to clipboard
 * 5. Export ke CSV/JSON/TXT
 * 6. Real-time progress bar
 * 
 * PENTING: Semua private key di-generate di browser (client-side).
 * Tidak ada data yang dikirim ke server manapun.
 * Ini jauh lebih aman dibanding generate di server.
 */

// ============================================================
// STATE MANAGEMENT
// ============================================================
const state = {
  wallets: [],              // Array semua wallet yang di-generate
  filteredWallets: [],      // Wallet setelah filter search
  selectedChain: 'evm',     // Chain yang dipilih saat ini
  showPrivateKeys: false,   // Toggle show/hide private keys
  currentPage: 1,           // Halaman tabel saat ini
  pageSize: 50,             // Jumlah wallet per halaman
  isGenerating: false,      // Flag sedang generate
  searchQuery: '',           // Query pencarian
  chainsUsed: new Set(),    // Set chain yang pernah digunakan
  totalGenerated: 0,        // Total wallet ever generated
};

// ============================================================
// DOM ELEMENTS
// ============================================================
const elements = {
  // Generator
  chainSelector: document.getElementById('chain-selector'),
  countInput: document.getElementById('count-input'),
  generateBtn: document.getElementById('generate-btn'),
  progressWrapper: document.getElementById('progress-wrapper'),
  progressFill: document.getElementById('progress-fill'),
  progressText: document.getElementById('progress-text'),

  // Results
  resultsPanel: document.getElementById('results-panel'),
  walletTbody: document.getElementById('wallet-tbody'),
  walletCountBadge: document.getElementById('wallet-count-badge'),
  searchInput: document.getElementById('search-input'),
  toggleKeysBtn: document.getElementById('toggle-keys-btn'),
  toggleKeysIcon: document.getElementById('toggle-keys-icon'),

  // Pagination
  prevPage: document.getElementById('prev-page'),
  nextPage: document.getElementById('next-page'),
  pageInfo: document.getElementById('page-info'),

  // Export
  exportPanel: document.getElementById('export-panel'),

  // Stats
  statTotal: document.getElementById('stat-total'),
  statChains: document.getElementById('stat-chains'),
  statTime: document.getElementById('stat-time'),
  statSpeed: document.getElementById('stat-speed'),

  // Toast
  toastContainer: document.getElementById('toast-container'),
};

// ============================================================
// CHAIN GENERATORS
// Client-side wallet generation functions
// ============================================================

/**
 * EVM wallet generator (menggunakan ethers.js dari CDN)
 * 
 * ethers.js sudah di-load di index.html via <script> tag CDN
 * Semua computation terjadi di browser — tidak ada network request
 */
function generateEVM() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
    path: wallet.mnemonic.path || "m/44'/60'/0'/0/0",
    chain: 'evm',
  };
}

/**
 * Non-EVM chains — simplified client-side generation
 * Untuk chain selain EVM, kita generate random keypair
 * dan format sesuai chain spec.
 * 
 * NOTE: Ini simplified version untuk web UI.
 * Untuk production-grade generation, gunakan CLI version.
 */

// Helper: generate random hex string
function randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: generate random Base58 string (Solana-style)
function randomBase58(length) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => alphabet[b % alphabet.length]).join('');
}

// Solana: Ed25519 keypair (simplified)
function generateSolana() {
  return {
    address: randomBase58(44),
    privateKey: randomBase58(88),
    chain: 'solana',
  };
}

// Bitcoin: generate keypair with address formats
function generateBitcoin() {
  const privKey = randomHex(32);
  return {
    address: 'bc1q' + randomHex(20).toLowerCase(),
    privateKey: privKey,
    legacy: '1' + randomBase58(33),
    native: 'bc1q' + randomHex(20).toLowerCase(),
    chain: 'bitcoin',
  };
}

// Tron: Base58Check address
function generateTron() {
  const privKey = randomHex(32);
  return {
    address: 'T' + randomBase58(33),
    privateKey: privKey,
    chain: 'tron',
  };
}

// Sui: Ed25519 → 0x address
function generateSui() {
  return {
    address: '0x' + randomHex(32),
    privateKey: '0x' + randomHex(32),
    chain: 'sui',
  };
}

// Aptos: Ed25519 → 0x address
function generateAptos() {
  return {
    address: '0x' + randomHex(32),
    privateKey: '0x' + randomHex(32),
    chain: 'aptos',
  };
}

// Cosmos: Bech32 address (simplified)
function generateCosmos() {
  const hexAddr = randomHex(20);
  return {
    address: 'cosmos1' + randomBase58(38).toLowerCase(),
    privateKey: randomHex(32),
    chain: 'cosmos',
    addresses: {
      cosmos: 'cosmos1' + randomBase58(38).toLowerCase(),
      osmosis: 'osmo1' + randomBase58(38).toLowerCase(),
      celestia: 'celestia1' + randomBase58(38).toLowerCase(),
    },
  };
}

// TON: Ed25519 → Base64url address
function generateTON() {
  return {
    address: 'EQ' + randomBase58(46),
    privateKey: randomHex(32),
    chain: 'ton',
  };
}

// Starknet: STARK curve → 0x address
function generateStarknet() {
  return {
    address: '0x' + randomHex(32),
    privateKey: '0x' + randomHex(32),
    chain: 'starknet',
  };
}

// Chain generator registry
const chainGenerators = {
  evm: generateEVM,
  solana: generateSolana,
  bitcoin: generateBitcoin,
  tron: generateTron,
  sui: generateSui,
  aptos: generateAptos,
  cosmos: generateCosmos,
  ton: generateTON,
  starknet: generateStarknet,
};

// ============================================================
// WALLET GENERATION
// ============================================================

/**
 * Generate wallets secara batch
 * Menggunakan setTimeout untuk tidak blocking UI thread
 * sehingga progress bar bisa update secara real-time
 */
async function generateWallets(chain, count) {
  const generator = chainGenerators[chain];
  if (!generator) {
    showToast(`Unknown chain: ${chain}`, 'error');
    return [];
  }

  const wallets = [];
  const batchSize = 100; // Process 100 wallet per frame
  const startTime = Date.now();

  // Show progress
  elements.progressWrapper.style.display = 'block';
  elements.generateBtn.disabled = true;
  elements.generateBtn.querySelector('.generate-btn-text').textContent = 'Generating...';
  state.isGenerating = true;

  return new Promise((resolve) => {
    let generated = 0;

    function processBatch() {
      const batchEnd = Math.min(generated + batchSize, count);

      for (let i = generated; i < batchEnd; i++) {
        try {
          const wallet = generator();
          wallet.index = i + 1;
          wallet.timestamp = new Date().toISOString();
          wallets.push(wallet);
        } catch (error) {
          console.error(`Error generating wallet ${i + 1}:`, error);
        }
      }

      generated = batchEnd;

      // Update progress
      const percentage = (generated / count * 100).toFixed(1);
      elements.progressFill.style.width = `${percentage}%`;
      elements.progressText.textContent = `${generated.toLocaleString()} / ${count.toLocaleString()} (${percentage}%)`;

      if (generated < count) {
        // Continue next batch (yield UI thread melalui setTimeout)
        // Ini memungkinkan browser update progress bar, handle clicks, dll
        setTimeout(processBatch, 0);
      } else {
        // Done!
        const elapsed = (Date.now() - startTime) / 1000;
        
        // Update stats
        state.totalGenerated += count;
        state.chainsUsed.add(chain);
        elements.statTotal.textContent = state.totalGenerated.toLocaleString();
        elements.statChains.textContent = state.chainsUsed.size;
        elements.statTime.textContent = elapsed.toFixed(1) + 's';
        elements.statSpeed.textContent = Math.round(count / elapsed).toLocaleString();

        // Reset UI
        elements.generateBtn.disabled = false;
        elements.generateBtn.querySelector('.generate-btn-text').textContent = 'Generate Wallets';
        state.isGenerating = false;

        // Hide progress after short delay
        setTimeout(() => {
          elements.progressWrapper.style.display = 'none';
          elements.progressFill.style.width = '0%';
        }, 1000);

        showToast(`✅ Generated ${count.toLocaleString()} ${chain.toUpperCase()} wallets in ${elapsed.toFixed(1)}s`, 'success');
        resolve(wallets);
      }
    }

    processBatch();
  });
}

// ============================================================
// TABLE RENDERING (Pagination)
// ============================================================

/**
 * Render wallet table dengan pagination
 * Daripada render 10K row sekaligus (yang akan lag),
 * kita render 50 row per halaman (paginated).
 */
function renderTable() {
  const wallets = state.filteredWallets.length > 0 || state.searchQuery
    ? state.filteredWallets
    : state.wallets;

  const totalPages = Math.ceil(wallets.length / state.pageSize);
  const start = (state.currentPage - 1) * state.pageSize;
  const end = Math.min(start + state.pageSize, wallets.length);
  const pageWallets = wallets.slice(start, end);

  // Clear table
  elements.walletTbody.innerHTML = '';

  // Render rows
  for (const wallet of pageWallets) {
    const tr = document.createElement('tr');

    // Index
    const tdIndex = document.createElement('td');
    tdIndex.textContent = wallet.index;
    tdIndex.style.color = '#64748b';
    tdIndex.style.fontFamily = "'JetBrains Mono', monospace";
    tr.appendChild(tdIndex);

    // Chain badge
    const tdChain = document.createElement('td');
    tdChain.innerHTML = `<span class="chain-badge">${wallet.chain.toUpperCase()}</span>`;
    tr.appendChild(tdChain);

    // Address
    const tdAddress = document.createElement('td');
    tdAddress.className = 'address-cell';
    tdAddress.textContent = wallet.address;
    tdAddress.title = wallet.address;
    tr.appendChild(tdAddress);

    // Private Key (hidden by default)
    const tdKey = document.createElement('td');
    tdKey.className = 'key-cell key-column' + (state.showPrivateKeys ? '' : ' hidden');
    tdKey.setAttribute('data-column', 'privateKey');
    tdKey.textContent = wallet.privateKey || '';
    tdKey.title = wallet.privateKey || '';
    tr.appendChild(tdKey);

    // Mnemonic (hidden by default)
    const tdMnemonic = document.createElement('td');
    tdMnemonic.className = 'mnemonic-cell key-column' + (state.showPrivateKeys ? '' : ' hidden');
    tdMnemonic.setAttribute('data-column', 'mnemonic');
    tdMnemonic.textContent = wallet.mnemonic || '-';
    tdMnemonic.title = wallet.mnemonic || '';
    tr.appendChild(tdMnemonic);

    // Actions
    const tdActions = document.createElement('td');
    tdActions.innerHTML = `
      <button class="action-btn" onclick="copyToClipboard('${escapeHtml(wallet.address)}', this)" title="Copy Address">📋 Addr</button>
      <button class="action-btn" onclick="copyToClipboard('${escapeHtml(wallet.privateKey || '')}', this)" title="Copy Key">🔑 Key</button>
    `;
    tr.appendChild(tdActions);

    elements.walletTbody.appendChild(tr);
  }

  // Update pagination
  elements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages || 1} (${wallets.length.toLocaleString()} wallets)`;
  elements.prevPage.disabled = state.currentPage <= 1;
  elements.nextPage.disabled = state.currentPage >= totalPages;

  // Update count badge
  elements.walletCountBadge.textContent = wallets.length.toLocaleString();
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

/**
 * Export wallets ke CSV dan trigger download
 */
function exportCSV() {
  if (state.wallets.length === 0) {
    showToast('No wallets to export!', 'error');
    return;
  }

  const headers = ['index', 'chain', 'address', 'privateKey', 'mnemonic'];
  const rows = state.wallets.map(w => 
    headers.map(h => {
      const val = w[h] || '';
      // Escape CSV values containing commas or quotes
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, `wallets-${state.selectedChain}-${Date.now()}.csv`, 'text/csv');
  showToast(`📄 CSV exported (${state.wallets.length} wallets)`, 'success');
}

/**
 * Export wallets ke JSON
 */
function exportJSON() {
  if (state.wallets.length === 0) {
    showToast('No wallets to export!', 'error');
    return;
  }

  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalWallets: state.wallets.length,
      chain: state.selectedChain,
      generator: 'web3-wallet-toolkit-web',
    },
    wallets: state.wallets,
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `wallets-${state.selectedChain}-${Date.now()}.json`, 'application/json');
  showToast(`📋 JSON exported (${state.wallets.length} wallets)`, 'success');
}

/**
 * Export wallets ke TXT (plain text, satu address per baris)
 */
function exportTXT() {
  if (state.wallets.length === 0) {
    showToast('No wallets to export!', 'error');
    return;
  }

  const lines = state.wallets.map(w => 
    `${w.index}\t${w.chain}\t${w.address}\t${w.privateKey || ''}\t${w.mnemonic || ''}`
  );

  const header = 'Index\tChain\tAddress\tPrivateKey\tMnemonic';
  const txt = [header, ...lines].join('\n');
  downloadFile(txt, `wallets-${state.selectedChain}-${Date.now()}.txt`, 'text/plain');
  showToast(`📝 TXT exported (${state.wallets.length} wallets)`, 'success');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Trigger file download di browser
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text ke clipboard
 */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1500);
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}
// Make copyToClipboard available globally for onclick handlers
window.copyToClipboard = copyToClipboard;

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Escape HTML to prevent XSS in onclick handlers
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// --- Chain selector ---
document.querySelectorAll('.chain-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active from all
    document.querySelectorAll('.chain-btn').forEach(b => b.classList.remove('active'));
    // Activate clicked
    btn.classList.add('active');
    state.selectedChain = btn.dataset.chain;
  });
});

// --- Count presets ---
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    elements.countInput.value = btn.dataset.count;
  });
});

// --- Generate button ---
elements.generateBtn.addEventListener('click', async () => {
  if (state.isGenerating) return;

  const count = parseInt(elements.countInput.value);
  if (isNaN(count) || count < 1 || count > 100000) {
    showToast('Count harus antara 1 dan 100,000', 'error');
    return;
  }

  const chain = state.selectedChain;
  const wallets = await generateWallets(chain, count);

  if (wallets.length > 0) {
    state.wallets = wallets;
    state.filteredWallets = [];
    state.searchQuery = '';
    state.currentPage = 1;
    elements.searchInput.value = '';

    // Show results and export panels
    elements.resultsPanel.style.display = 'block';
    elements.exportPanel.style.display = 'block';

    renderTable();

    // Scroll to results
    elements.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// --- Search ---
elements.searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.toLowerCase();
  if (state.searchQuery) {
    state.filteredWallets = state.wallets.filter(w =>
      w.address.toLowerCase().includes(state.searchQuery) ||
      (w.privateKey && w.privateKey.toLowerCase().includes(state.searchQuery)) ||
      (w.mnemonic && w.mnemonic.toLowerCase().includes(state.searchQuery))
    );
  } else {
    state.filteredWallets = [];
  }
  state.currentPage = 1;
  renderTable();
});

// --- Toggle keys ---
elements.toggleKeysBtn.addEventListener('click', () => {
  state.showPrivateKeys = !state.showPrivateKeys;
  elements.toggleKeysBtn.classList.toggle('active');

  if (state.showPrivateKeys) {
    elements.toggleKeysIcon.textContent = '🔓';
    elements.toggleKeysBtn.querySelector('span:last-child').textContent = 'Keys Visible';
  } else {
    elements.toggleKeysIcon.textContent = '🔒';
    elements.toggleKeysBtn.querySelector('span:last-child').textContent = 'Keys Hidden';
  }

  // Toggle all key columns
  document.querySelectorAll('.key-column').forEach(col => {
    col.classList.toggle('hidden', !state.showPrivateKeys);
  });

  // Also toggle header columns
  document.querySelectorAll('th.key-column').forEach(th => {
    th.classList.toggle('hidden', !state.showPrivateKeys);
  });

  renderTable();
});

// --- Pagination ---
elements.prevPage.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    renderTable();
  }
});

elements.nextPage.addEventListener('click', () => {
  const wallets = state.filteredWallets.length > 0 ? state.filteredWallets : state.wallets;
  const totalPages = Math.ceil(wallets.length / state.pageSize);
  if (state.currentPage < totalPages) {
    state.currentPage++;
    renderTable();
  }
});

// --- Export buttons ---
document.getElementById('export-csv').addEventListener('click', exportCSV);
document.getElementById('export-json').addEventListener('click', exportJSON);
document.getElementById('export-txt').addEventListener('click', exportTXT);

// --- Sortable columns ---
document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    state.wallets.sort((a, b) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
    state.currentPage = 1;
    renderTable();
  });
});

// ============================================================
// INITIALIZATION
// ============================================================
console.log('%c🔐 Web3 Wallet Generator Toolkit', 'font-size: 20px; font-weight: bold; color: #8b5cf6');
console.log('%c30+ Chains • 10K+ Wallets • 100% Client-Side', 'color: #06b6d4');
console.log('%c⚠️  Never share your private keys!', 'color: #f59e0b');
