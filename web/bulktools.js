/**
 * bulktools.js — Bulk Address Utilities
 * Tools: Airdrop Formatter, Duplicate Detector, Batch Checksum
 */

// ============================
// TOOL 1: AIRDROP FORMATTER
// ============================

let formattedLines = [];

document.getElementById('airdrop-format').addEventListener('click', () => {
  const raw = document.getElementById('airdrop-input').value.trim();
  if (!raw) return toast('Paste address,amount pairs', true);
  
  const lines = raw.split('\n').filter(l => l.trim());
  let valid = 0, invalid = 0;
  formattedLines = [];
  
  const results = lines.map(line => {
    // Parse: address,amount (comma, tab, or space separated)
    const parts = line.trim().split(/[,\t\s]+/);
    const addr = parts[0]?.trim();
    const amount = parts[1]?.trim();
    
    if (!addr || !amount || isNaN(Number(amount))) {
      invalid++;
      return `❌ ${line.trim()}`;
    }
    
    // Try EIP-55 checksum if EVM
    let checksummed = addr;
    try {
      if (addr.startsWith('0x') && addr.length === 42) {
        checksummed = ethers.getAddress(addr);
      }
    } catch { /* keep original */ }
    
    valid++;
    const formatted = `${checksummed},${amount}`;
    formattedLines.push(formatted);
    return `✅ ${formatted}`;
  });
  
  document.getElementById('airdrop-stats').textContent = `${valid} valid, ${invalid} invalid`;
  document.getElementById('airdrop-result').textContent = results.join('\n');
  document.getElementById('airdrop-output').style.display = '';
  toast(`${valid} addresses formatted`);
});

document.getElementById('airdrop-download').addEventListener('click', () => {
  if (!formattedLines.length) return toast('Format addresses first', true);
  const csv = 'address,amount\n' + formattedLines.join('\n');
  downloadText(csv, `airdrop-${Date.now()}.csv`, 'text/csv');
  toast('CSV downloaded');
});


// ============================
// TOOL 2: DUPLICATE DETECTOR
// ============================

document.getElementById('dup-detect').addEventListener('click', () => {
  const raw = document.getElementById('dup-input').value.trim();
  if (!raw) return toast('Paste addresses', true);
  
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const seen = {};
  const dupes = {};
  
  lines.forEach((addr, i) => {
    const key = addr.toLowerCase();
    if (seen[key] !== undefined) {
      if (!dupes[key]) dupes[key] = [seen[key]];
      dupes[key].push(i + 1);
    } else {
      seen[key] = i + 1;
    }
  });
  
  const dupeKeys = Object.keys(dupes);
  const resultEl = document.getElementById('dup-result');
  
  if (!dupeKeys.length) {
    document.getElementById('dup-stats').textContent = 'No duplicates found ✅';
    resultEl.innerHTML = '<div style="padding:12px;color:var(--green);font-size:13px">All addresses are unique!</div>';
  } else {
    document.getElementById('dup-stats').textContent = `${dupeKeys.length} duplicate${dupeKeys.length > 1 ? 's' : ''} found`;
    resultEl.innerHTML = dupeKeys.map(key => {
      const addr = lines[dupes[key][0] - 1];
      const lineNums = dupes[key].join(', ');
      return `<div class="dup-item">
        <span class="mono" style="font-size:11px;word-break:break-all">${addr}</span>
        <span class="dup-lines">Lines: ${lineNums}</span>
      </div>`;
    }).join('');
  }
  
  document.getElementById('dup-output').style.display = '';
  toast(`${dupeKeys.length} duplicate(s) found`);
});


// ============================
// TOOL 3: BATCH CHECKSUM
// ============================

document.getElementById('checksum-convert').addEventListener('click', () => {
  const raw = document.getElementById('checksum-input').value.trim();
  if (!raw) return toast('Paste EVM addresses', true);
  
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const results = lines.map(addr => {
    try {
      return ethers.getAddress(addr);
    } catch {
      return `❌ ${addr} (invalid)`;
    }
  });
  
  document.getElementById('checksum-result').textContent = results.join('\n');
  document.getElementById('checksum-output').style.display = '';
  toast('Checksummed');
});

document.getElementById('checksum-copy').addEventListener('click', () => {
  const text = document.getElementById('checksum-result').textContent;
  if (!text) return toast('Convert first', true);
  navigator.clipboard.writeText(text).then(() => toast('Copied'));
});


// ============================
// HELPERS
// ============================

function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
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
