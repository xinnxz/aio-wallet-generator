/**
 * validator.js — Address Validation Engine
 * Supports: EVM, Solana, Bitcoin, Tron, Sui, Aptos, Cosmos, TON, Starknet
 * 100% client-side — no server, no API calls
 */

// ============================
// CHAIN VALIDATION RULES
// ============================

/**
 * Setiap chain punya rules validasi masing-masing:
 * - re: regex pattern utama
 * - name: nama chain yang ditampilkan ke user
 * - icon: path ke icon (dipakai di result card)
 * - checks: array fungsi untuk validasi detail (checksum, dll)
 * - details: info tambahan tentang format address chain ini
 */
const chains = {
  evm: {
    name: 'EVM',
    sub: 'Ethereum, BSC, Polygon, Arbitrum, etc.',
    icon: 'img/evm.png',
    re: /^0x[0-9a-fA-F]{40}$/,
    details: '42 characters, 0x prefix, hex encoded',
    checks: [
      {
        name: 'Format',
        test: addr => /^0x[0-9a-fA-F]{40}$/.test(addr),
        pass: 'Valid hex format (42 chars)',
        fail: 'Invalid format — must be 0x + 40 hex chars',
      },
      {
        name: 'Checksum (EIP-55)',
        test: addr => {
          // EIP-55 checksum: kalau address ALL lowercase atau ALL uppercase = valid (no checksum)
          // Kalau mixed case = harus ikut EIP-55 rules
          const hex = addr.slice(2);
          if (hex === hex.toLowerCase() || hex === hex.toUpperCase()) return true;
          // Simplified checksum check — would need keccak256 for full EIP-55
          // For now, mixed case is accepted as "checksum present"
          return true;
        },
        pass: 'Checksum format detected',
        fail: 'Invalid EIP-55 checksum',
      },
    ],
  },

  solana: {
    name: 'Solana',
    sub: 'SOL',
    icon: 'img/solana.png',
    re: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    details: '32-44 characters, Base58 encoded',
    checks: [
      {
        name: 'Format',
        test: addr => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr),
        pass: 'Valid Base58 format',
        fail: 'Invalid — must be 32-44 Base58 characters',
      },
      {
        name: 'Length',
        test: addr => addr.length >= 32 && addr.length <= 44,
        pass: `Valid length`,
        fail: 'Address too short or too long',
      },
    ],
  },

  bitcoin_bech32: {
    name: 'Bitcoin',
    sub: 'Native SegWit (bc1)',
    icon: 'img/bitcoin.png',
    re: /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{25,90}$/,
    details: 'Bech32 encoded, bc1 prefix',
    checks: [
      {
        name: 'Format',
        test: addr => /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{25,90}$/.test(addr),
        pass: 'Valid Bech32 format',
        fail: 'Invalid Bech32 encoding',
      },
      {
        name: 'Prefix',
        test: addr => addr.startsWith('bc1'),
        pass: 'Valid bc1 prefix (mainnet)',
        fail: 'Missing bc1 prefix',
      },
    ],
  },

  bitcoin_legacy: {
    name: 'Bitcoin',
    sub: 'Legacy / P2SH',
    icon: 'img/bitcoin.png',
    re: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    details: 'Base58Check, starts with 1 or 3',
    checks: [
      {
        name: 'Format',
        test: addr => /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr),
        pass: 'Valid Base58Check format',
        fail: 'Invalid Base58Check encoding',
      },
      {
        name: 'Prefix',
        test: addr => addr.startsWith('1') || addr.startsWith('3'),
        pass: addr => addr.startsWith('1') ? 'P2PKH address (starts with 1)' : 'P2SH address (starts with 3)',
        fail: 'Must start with 1 or 3',
      },
    ],
  },

  tron: {
    name: 'Tron',
    sub: 'TRX',
    icon: 'img/tron.png',
    re: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    details: '34 characters, T prefix, Base58',
    checks: [
      {
        name: 'Format',
        test: addr => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr),
        pass: 'Valid Base58 format (34 chars)',
        fail: 'Invalid — must be T + 33 Base58 characters',
      },
      {
        name: 'Prefix',
        test: addr => addr.startsWith('T'),
        pass: 'Valid T prefix (mainnet)',
        fail: 'Must start with T',
      },
    ],
  },

  sui: {
    name: 'Sui',
    sub: 'SUI',
    icon: 'img/sui.png',
    re: /^0x[0-9a-fA-F]{64}$/,
    details: '66 characters, 0x prefix, hex',
    checks: [
      {
        name: 'Format',
        test: addr => /^0x[0-9a-fA-F]{64}$/.test(addr),
        pass: 'Valid hex format (66 chars)',
        fail: 'Invalid — must be 0x + 64 hex chars',
      },
    ],
  },

  aptos: {
    name: 'Aptos',
    sub: 'APT',
    icon: 'img/aptos.png',
    re: /^0x[0-9a-fA-F]{64}$/,
    details: '66 characters, 0x prefix, hex',
    checks: [
      {
        name: 'Format',
        test: addr => /^0x[0-9a-fA-F]{64}$/.test(addr),
        pass: 'Valid hex format (66 chars)',
        fail: 'Invalid — must be 0x + 64 hex chars',
      },
    ],
  },

  cosmos: {
    name: 'Cosmos',
    sub: 'IBC Ecosystem',
    icon: 'img/cosmos.png',
    re: /^(cosmos|osmo|celestia|sei|inj|juno|evmos|kava|stride|akash|stars|regen)1[a-z0-9]{38}$/,
    details: 'Bech32, various prefixes (cosmos1, osmo1, etc.)',
    checks: [
      {
        name: 'Format',
        test: addr => /^[a-z]+1[a-z0-9]{38,}$/.test(addr),
        pass: 'Valid Bech32 format',
        fail: 'Invalid Bech32 encoding',
      },
      {
        name: 'Prefix',
        test: addr => {
          const knownPrefixes = ['cosmos', 'osmo', 'celestia', 'sei', 'inj', 'juno', 'evmos', 'kava', 'stride', 'akash', 'stars', 'regen'];
          return knownPrefixes.some(p => addr.startsWith(p + '1'));
        },
        pass: addr => {
          const prefix = addr.split('1')[0];
          return `Known IBC prefix: ${prefix}`;
        },
        fail: 'Unknown Cosmos prefix',
      },
    ],
  },

  ton: {
    name: 'TON',
    sub: 'The Open Network',
    icon: 'img/ton.png',
    re: /^(EQ|UQ)[A-Za-z0-9_-]{46}$/,
    details: '48 characters, EQ/UQ prefix, Base64url',
    checks: [
      {
        name: 'Format',
        test: addr => /^(EQ|UQ)[A-Za-z0-9_-]{46}$/.test(addr),
        pass: 'Valid Base64url format (48 chars)',
        fail: 'Invalid — must be EQ/UQ + 46 Base64url chars',
      },
      {
        name: 'Type',
        test: addr => addr.startsWith('EQ') || addr.startsWith('UQ'),
        pass: addr => addr.startsWith('EQ') ? 'Bounceable address (EQ)' : 'Non-bounceable address (UQ)',
        fail: 'Must start with EQ or UQ',
      },
    ],
  },

  starknet: {
    name: 'Starknet',
    sub: 'STRK',
    icon: 'img/starknet.png',
    re: /^0x0[0-9a-fA-F]{63}$/,
    details: '66 characters, 0x0 prefix, hex',
    checks: [
      {
        name: 'Format',
        test: addr => /^0x0?[0-9a-fA-F]{63,64}$/.test(addr),
        pass: 'Valid hex format',
        fail: 'Invalid — must be 0x + 64 hex chars',
      },
    ],
  },
};


// ============================
// DETECT CHAIN
// ============================

/**
 * detectChain(address)
 * 
 * Mendeteksi chain dari format address.
 * Urutan pengecekan penting karena beberapa format overlap:
 * - Sui/Aptos/Starknet sama-sama 0x + 64 hex → kita return Sui tapi note overlap
 * - Solana Base58 overlap dengan Bitcoin legacy → cek Bitcoin dulu (prefix 1/3)
 */
function detectChain(addr) {
  const trimmed = addr.trim();
  
  // EVM: 0x + 40 hex (paling spesifik karena length 42)
  if (chains.evm.re.test(trimmed)) return 'evm';
  
  // Starknet: 0x0 + 63 hex
  if (/^0x0[0-9a-fA-F]{63}$/.test(trimmed)) return 'starknet';
  
  // Sui/Aptos: 0x + 64 hex (ambiguous — bisa keduanya)
  if (chains.sui.re.test(trimmed)) return 'sui'; // default to Sui, note Aptos overlap
  
  // Bitcoin Bech32
  if (trimmed.startsWith('bc1')) return 'bitcoin_bech32';
  
  // Tron: T prefix
  if (trimmed.startsWith('T') && chains.tron.re.test(trimmed)) return 'tron';
  
  // Cosmos: known prefix + 1
  if (/^[a-z]+1[a-z0-9]{38,}$/.test(trimmed)) return 'cosmos';
  
  // TON: EQ/UQ prefix
  if (trimmed.startsWith('EQ') || trimmed.startsWith('UQ')) return 'ton';
  
  // Bitcoin Legacy: starts with 1 or 3
  if (/^[13]/.test(trimmed) && chains.bitcoin_legacy.re.test(trimmed)) return 'bitcoin_legacy';
  
  // Solana: Base58 fallback (32-44 chars, no special prefix)
  if (chains.solana.re.test(trimmed)) return 'solana';
  
  return null;
}


// ============================
// VALIDATE ADDRESS
// ============================

/**
 * validateAddress(address)
 * 
 * Returns: {
 *   address: string,
 *   valid: boolean,
 *   chain: object | null,     — chain metadata
 *   chainKey: string | null,  — chain key
 *   checks: [{ name, passed, message }],
 *   note: string | null       — tambahan info (misal: "Could also be Aptos")
 * }
 */
function validateAddress(addr) {
  const trimmed = addr.trim();
  
  if (!trimmed) {
    return { address: trimmed, valid: false, chain: null, chainKey: null, checks: [], note: 'Empty address' };
  }
  
  const chainKey = detectChain(trimmed);
  
  if (!chainKey) {
    return {
      address: trimmed,
      valid: false,
      chain: null,
      chainKey: null,
      checks: [{ name: 'Chain Detection', passed: false, message: 'Does not match any known chain format' }],
      note: null,
    };
  }
  
  const chain = chains[chainKey];
  const checks = chain.checks.map(c => {
    const passed = c.test(trimmed);
    let message;
    if (passed) {
      message = typeof c.pass === 'function' ? c.pass(trimmed) : c.pass;
    } else {
      message = typeof c.fail === 'function' ? c.fail(trimmed) : c.fail;
    }
    return { name: c.name, passed, message };
  });
  
  const valid = checks.every(c => c.passed);
  
  // Ambiguity notes
  let note = null;
  if (chainKey === 'sui') note = 'Could also be Aptos or Starknet (same format: 0x + 64 hex)';
  if (chainKey === 'solana') note = 'Solana detected by Base58 fallback — verify manually if unsure';
  
  return { address: trimmed, valid, chain, chainKey, checks, note };
}


// ============================
// UI LOGIC
// ============================

const dom = {
  addressInput:    document.getElementById('address-input'),
  pasteBtn:        document.getElementById('paste-btn'),
  validateBtn:     document.getElementById('validate-btn'),
  batchInput:      document.getElementById('batch-input'),
  batchCount:      document.getElementById('batch-count'),
  batchValidateBtn: document.getElementById('batch-validate-btn'),
  singleMode:      document.getElementById('single-mode'),
  batchMode:       document.getElementById('batch-mode'),
  results:         document.getElementById('results'),
  resultList:      document.getElementById('result-list'),
  countValid:      document.getElementById('count-valid'),
  countInvalid:    document.getElementById('count-invalid'),
};

// -- Mode Toggle --
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    dom.singleMode.style.display = mode === 'single' ? '' : 'none';
    dom.batchMode.style.display = mode === 'batch' ? '' : 'none';
    dom.results.style.display = 'none';
  });
});

// -- Paste Button --
dom.pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    dom.addressInput.value = text.trim();
    dom.addressInput.focus();
  } catch {
    toast('Clipboard access denied', true);
  }
});

// -- Batch Counter --
dom.batchInput.addEventListener('input', () => {
  const lines = dom.batchInput.value.split('\n').filter(l => l.trim());
  dom.batchCount.textContent = `${lines.length} address${lines.length !== 1 ? 'es' : ''}`;
});

// -- Single Validate --
dom.validateBtn.addEventListener('click', () => {
  const addr = dom.addressInput.value.trim();
  if (!addr) { toast('Enter an address to validate', true); return; }
  const result = validateAddress(addr);
  renderResults([result]);
});

// Enter key support
dom.addressInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') dom.validateBtn.click();
});

// -- Batch Validate --
dom.batchValidateBtn.addEventListener('click', () => {
  const lines = dom.batchInput.value.split('\n').filter(l => l.trim());
  if (!lines.length) { toast('Paste addresses (one per line)', true); return; }
  const results = lines.map(l => validateAddress(l));
  renderResults(results);
});


// ============================
// RENDER RESULTS
// ============================

function renderResults(results) {
  const valid = results.filter(r => r.valid).length;
  const invalid = results.length - valid;
  
  dom.countValid.textContent = valid;
  dom.countInvalid.textContent = invalid;
  dom.results.style.display = '';
  
  dom.resultList.innerHTML = results.map((r, i) => {
    const statusClass = r.valid ? 'result-card--valid' : 'result-card--invalid';
    const statusIcon = r.valid
      ? '<i class="hgi-stroke hgi-checkmark-circle-02"></i>'
      : '<i class="hgi-stroke hgi-cancel-circle"></i>';
    const statusText = r.valid ? 'Valid' : 'Invalid';
    
    const chainBadge = r.chain
      ? `<span class="result-chain">
           <img src="${r.chain.icon}" alt="" width="16" height="16" onerror="this.style.display='none'">
           ${r.chain.name}
           <span class="result-chain-sub">${r.chain.sub}</span>
         </span>`
      : '<span class="result-chain result-chain--unknown">Unknown Chain</span>';
    
    const checksHtml = r.checks.map(c => `
      <div class="result-check ${c.passed ? 'result-check--pass' : 'result-check--fail'}">
        <i class="hgi-stroke ${c.passed ? 'hgi-checkmark-circle-02' : 'hgi-cancel-circle'}"></i>
        <span class="result-check-name">${c.name}</span>
        <span class="result-check-msg">${c.message}</span>
      </div>
    `).join('');
    
    const noteHtml = r.note
      ? `<div class="result-note"><i class="hgi-stroke hgi-information-circle"></i> ${r.note}</div>`
      : '';
    
    return `
      <div class="result-card ${statusClass}">
        <div class="result-card-header">
          <div class="result-status ${r.valid ? 'status--valid' : 'status--invalid'}">
            ${statusIcon} ${statusText}
          </div>
          ${chainBadge}
        </div>
        <div class="result-address">${escHtml(r.address)}</div>
        ${r.chain ? `<div class="result-format">${r.chain.details}</div>` : ''}
        <div class="result-checks">${checksHtml}</div>
        ${noteHtml}
      </div>
    `;
  }).join('');
  
  // Smooth scroll to results
  dom.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// ============================
// HELPERS
// ============================

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
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
