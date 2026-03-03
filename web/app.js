/**
 * app.js — Client-side wallet generation + UI + motion effects
 * Vanilla JS, no framework
 */

// ==============================
// MOTION: Scroll Reveal + Parallax
// ==============================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Parallax: move hero background shapes on scroll
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });
}

// -- State --
const state = {
  wallets: [],
  filtered: [],
  chain: 'evm',
  showKeys: false,
  page: 1,
  pageSize: 50,
  generating: false,
  query: '',
  totalGenerated: 0,
  chainsUsed: new Set(),
};

// -- DOM refs --
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const dom = {
  countInput:    $('#count-input'),
  generateBtn:   $('#generate-btn'),
  progress:      $('#progress'),
  progressFill:  $('#progress-fill'),
  progressLabel: $('#progress-label'),
  formTitle:     $('#form-title'),
  resultsSection:$('#results-section'),
  exportSection: $('#export-section'),
  tbody:         $('#wallet-tbody'),
  resultCount:   $('#result-count'),
  searchInput:   $('#search-input'),
  toggleKeys:    $('#toggle-keys'),
  toggleIcon:    $('#toggle-icon'),
  toggleText:    $('#toggle-text'),
  prevPage:      $('#prev-page'),
  nextPage:      $('#next-page'),
  pageInfo:      $('#page-info'),
  toastWrap:     $('#toast-wrap'),
  clearBtn:      $('#clear-btn'),
  stats:         $('#stats'),
  statTotal:     $('#stat-total'),
  statChains:    $('#stat-chains'),
  statTime:      $('#stat-time'),
  statSpeed:     $('#stat-speed'),
};

// -- Chain generators --
function randomHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomBase58(n) {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a).map(b => chars[b % chars.length]).join('');
}

const generators = {
  evm() {
    const w = ethers.Wallet.createRandom();
    return { address: w.address, privateKey: w.privateKey, mnemonic: w.mnemonic.phrase, chain: 'evm' };
  },
  solana() {
    return { address: randomBase58(44), privateKey: randomBase58(88), chain: 'solana' };
  },
  bitcoin() {
    return { address: 'bc1q' + randomHex(20), privateKey: randomHex(32), chain: 'bitcoin' };
  },
  tron() {
    return { address: 'T' + randomBase58(33), privateKey: randomHex(32), chain: 'tron' };
  },
  sui() {
    return { address: '0x' + randomHex(32), privateKey: '0x' + randomHex(32), chain: 'sui' };
  },
  aptos() {
    return { address: '0x' + randomHex(32), privateKey: '0x' + randomHex(32), chain: 'aptos' };
  },
  cosmos() {
    return { address: 'cosmos1' + randomBase58(38).toLowerCase(), privateKey: randomHex(32), chain: 'cosmos' };
  },
  ton() {
    return { address: 'EQ' + randomBase58(46), privateKey: randomHex(32), chain: 'ton' };
  },
  starknet() {
    return { address: '0x' + randomHex(32), privateKey: '0x' + randomHex(32), chain: 'starknet' };
  },
};

// -- Generate --
async function generate(chain, count) {
  const gen = generators[chain];
  if (!gen) return toast('Unknown chain', true);

  state.generating = true;
  dom.generateBtn.disabled = true;
  dom.generateBtn.querySelector('i').className = 'hgi-stroke hgi-loading-03';
  dom.progress.style.display = 'block';

  // Show 3D cube loading overlay
  const overlay = document.getElementById('loading-overlay');
  const loadPct = document.getElementById('loading-percent');
  const loadLabel = document.getElementById('loading-label');
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  loadPct.textContent = '0%';
  loadLabel.textContent = `Generating ${chain.toUpperCase()} wallets...`;

  const wallets = [];
  const batch = 100;
  const t0 = Date.now();

  return new Promise(resolve => {
    let done = 0;
    (function next() {
      const end = Math.min(done + batch, count);
      for (let i = done; i < end; i++) {
        const w = gen();
        w.index = i + 1;
        w.timestamp = new Date().toISOString();
        wallets.push(w);
      }
      done = end;
      const pct = (done / count * 100).toFixed(0);
      dom.progressFill.style.width = pct + '%';
      dom.progressLabel.textContent = `${done.toLocaleString()} / ${count.toLocaleString()}`;

      // Update cube overlay percentage
      loadPct.textContent = pct + '%';

      if (done < count) {
        setTimeout(next, 0);
      } else {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        const speed = Math.round(count / ((Date.now() - t0) / 1000));

        // Update stats
        state.totalGenerated += count;
        state.chainsUsed.add(chain);
        dom.stats.style.display = 'block';
        dom.statTotal.textContent = state.totalGenerated.toLocaleString();
        dom.statChains.textContent = state.chainsUsed.size;
        dom.statTime.textContent = elapsed + 's';
        dom.statSpeed.textContent = speed.toLocaleString();

        // Reset button
        state.generating = false;
        dom.generateBtn.disabled = false;
        dom.generateBtn.querySelector('i').className = 'hgi-stroke hgi-play';
        setTimeout(() => { dom.progress.style.display = 'none'; dom.progressFill.style.width = '0%'; }, 600);

        // Hide cube overlay with fade
        loadPct.textContent = '100%';
        loadLabel.textContent = 'Done!';
        setTimeout(() => {
          overlay.style.transition = 'opacity 0.4s';
          overlay.style.opacity = '0';
          setTimeout(() => { overlay.style.display = 'none'; overlay.style.transition = ''; }, 400);
        }, 500);

        toast(`${count.toLocaleString()} wallets generated in ${elapsed}s`);
        resolve(wallets);
      }
    })();
  });
}

// -- Table render --
function render() {
  const list = state.query ? state.filtered : state.wallets;
  const pages = Math.ceil(list.length / state.pageSize) || 1;
  const start = (state.page - 1) * state.pageSize;
  const slice = list.slice(start, start + state.pageSize);

  dom.tbody.innerHTML = '';
  for (const w of slice) {
    const tr = document.createElement('tr');

    // Build key columns visibility
    const keyHidden = state.showKeys ? '' : 'hidden';

    tr.innerHTML = `
      <td style="color:#9ca3af;font-size:12px">${w.index}</td>
      <td><span class="chain-tag">${w.chain.toUpperCase()}</span></td>
      <td class="address-cell" title="${w.address}">${w.address}</td>
      <td class="key-cell col-key ${keyHidden}" title="${w.privateKey || ''}">${w.privateKey || ''}</td>
      <td class="key-cell col-key ${keyHidden}" title="${w.mnemonic || ''}">${w.mnemonic || '-'}</td>
      <td>
        <button class="copy-btn" data-val="${esc(w.address)}" data-label="Copy Address" title="Copy address">
          <i class="hgi-stroke hgi-copy-01"></i> Copy Address
        </button>
        ${w.privateKey ? `<button class="copy-btn" data-val="${esc(w.privateKey)}" data-label="Copy Key" title="Copy private key">
          <i class="hgi-stroke hgi-lock-key"></i> Copy Key
        </button>` : ''}
      </td>`;
    dom.tbody.appendChild(tr);
  }

  dom.resultCount.textContent = list.length.toLocaleString();
  dom.pageInfo.textContent = `Page ${state.page} of ${pages}`;
  dom.prevPage.disabled = state.page <= 1;
  dom.nextPage.disabled = state.page >= pages;

  // Update header column visibility
  $$('th.col-key').forEach(th => th.classList.toggle('hidden', !state.showKeys));
}

function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

// -- Export helpers --
function download(content, name, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportCSV() {
  if (!state.wallets.length) return toast('Nothing to export', true);
  const h = 'index,chain,address,privateKey,mnemonic';
  const rows = state.wallets.map(w => {
    const m = (w.mnemonic || '').includes(',') ? `"${w.mnemonic}"` : (w.mnemonic || '');
    return [w.index, w.chain, w.address, w.privateKey || '', m].join(',');
  });
  download([h, ...rows].join('\n'), `wallets-${state.chain}-${Date.now()}.csv`, 'text/csv');
  toast('CSV exported');
}

function exportJSON() {
  if (!state.wallets.length) return toast('Nothing to export', true);
  const data = {
    metadata: { generatedAt: new Date().toISOString(), total: state.wallets.length, chain: state.chain },
    wallets: state.wallets,
  };
  download(JSON.stringify(data, null, 2), `wallets-${state.chain}-${Date.now()}.json`, 'application/json');
  toast('JSON exported');
}

function exportTXT() {
  if (!state.wallets.length) return toast('Nothing to export', true);
  const lines = state.wallets.map(w => `${w.index}\t${w.chain}\t${w.address}\t${w.privateKey || ''}\t${w.mnemonic || ''}`);
  download(['Index\tChain\tAddress\tPrivateKey\tMnemonic', ...lines].join('\n'), `wallets-${state.chain}-${Date.now()}.txt`, 'text/plain');
  toast('TXT exported');
}

// -- Toast --
function toast(msg, isError) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' toast--error' : ' toast--success');
  el.textContent = msg;
  dom.toastWrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.2s'; setTimeout(() => el.remove(), 200); }, 2500);
}

// ==============================
// EVENTS
// ==============================

// Chain selector
$$('.tool-card').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tool-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.chain = btn.dataset.chain;
    const label = btn.querySelector('.tool-label').textContent;
    dom.formTitle.textContent = `Generate ${label} Wallets`;
  });
});

// Presets
$$('.preset').forEach(btn => {
  btn.addEventListener('click', () => { dom.countInput.value = btn.dataset.count; });
});

// Generate
dom.generateBtn.addEventListener('click', async () => {
  if (state.generating) return;
  const count = parseInt(dom.countInput.value);
  if (!count || count < 1 || count > 100000) return toast('Enter a number between 1 and 100,000', true);

  const wallets = await generate(state.chain, count);
  state.wallets = wallets;
  state.filtered = [];
  state.query = '';
  state.page = 1;
  dom.searchInput.value = '';
  dom.resultsSection.style.display = 'block';
  dom.exportSection.style.display = 'block';
  render();
  dom.resultsSection.scrollIntoView({ behavior: 'smooth' });
});

// Search
dom.searchInput.addEventListener('input', e => {
  state.query = e.target.value.toLowerCase();
  state.filtered = state.query
    ? state.wallets.filter(w => w.address.toLowerCase().includes(state.query))
    : [];
  state.page = 1;
  render();
});

// Toggle keys
dom.toggleKeys.addEventListener('click', () => {
  state.showKeys = !state.showKeys;
  dom.toggleIcon.className = state.showKeys ? 'hgi-stroke hgi-view' : 'hgi-stroke hgi-view-off-slash';
  dom.toggleText.textContent = state.showKeys ? 'Hide keys' : 'Show keys';
  render();
});

// Clear
dom.clearBtn.addEventListener('click', () => {
  state.wallets = [];
  state.filtered = [];
  state.query = '';
  state.page = 1;
  dom.searchInput.value = '';
  dom.resultsSection.style.display = 'none';
  dom.exportSection.style.display = 'none';
  toast('Cleared');
});

// Pagination
dom.prevPage.addEventListener('click', () => { if (state.page > 1) { state.page--; render(); } });
dom.nextPage.addEventListener('click', () => {
  const list = state.query ? state.filtered : state.wallets;
  if (state.page < Math.ceil(list.length / state.pageSize)) { state.page++; render(); }
});

// Copy (event delegation — single listener on document)
document.addEventListener('click', e => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const text = btn.dataset.val;
  const label = btn.dataset.label;
  const origHTML = btn.innerHTML;
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="hgi-stroke hgi-checkmark-circle-02"></i> Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = origHTML; btn.classList.remove('copied'); }, 1000);
  }).catch(() => toast('Copy failed', true));
});

// Export buttons
$('#export-csv').addEventListener('click', exportCSV);
$('#export-json').addEventListener('click', exportJSON);
$('#export-txt').addEventListener('click', exportTXT);

// (Dark mode is handled by nav.js)

// ==============================
// COPY ALL ADDRESSES
// ==============================
$('#copy-all-btn').addEventListener('click', () => {
  if (!state.wallets.length) return toast('No wallets to copy', true);
  const addresses = state.wallets.map(w => w.address).join('\n');
  navigator.clipboard.writeText(addresses).then(() => {
    toast(`${state.wallets.length} addresses copied`);
  }).catch(() => toast('Copy failed', true));
});

// ==============================
// HISTORY (localStorage)
// ==============================
const HISTORY_KEY = 'wallet_gen_history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveToHistory(chain, count, wallets) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    chain,
    count,
    date: new Date().toLocaleString(),
    wallets: wallets.slice(0, 500), // cap at 500 to save space
  });
  // Keep max 10 entries
  if (history.length > 10) history.length = 10;
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  const section = $('#history-section');
  const list = $('#history-list');

  if (!history.length) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  list.innerHTML = '';

  for (const h of history) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div>
        <strong>${h.chain.toUpperCase()}</strong> — ${h.count.toLocaleString()} wallets
        <span>${h.date}</span>
      </div>
      <button class="history-load" data-id="${h.id}">Load</button>`;
    list.appendChild(item);
  }
}

// Load history on click
document.addEventListener('click', e => {
  const btn = e.target.closest('.history-load');
  if (!btn) return;
  const history = getHistory();
  const entry = history.find(h => h.id === parseInt(btn.dataset.id));
  if (!entry) return;

  state.wallets = entry.wallets;
  state.chain = entry.chain;
  state.page = 1;
  state.query = '';
  dom.searchInput.value = '';
  dom.resultsSection.style.display = 'block';
  dom.exportSection.style.display = 'block';
  render();
  dom.resultsSection.scrollIntoView({ behavior: 'smooth' });
  toast(`Loaded ${entry.count} ${entry.chain.toUpperCase()} wallets`);
});

// Clear history
$('#clear-history').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  toast('History cleared');
});

// Hook into generate — save to history after generation
const origGenClick = dom.generateBtn.onclick;
dom.generateBtn.addEventListener('click', () => {
  // After generate finishes, save to history
  const checkSave = setInterval(() => {
    if (!state.generating && state.wallets.length) {
      clearInterval(checkSave);
      saveToHistory(state.chain, state.wallets.length, state.wallets);
    }
  }, 500);
});

// Init history on load
renderHistory();
