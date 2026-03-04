/**
 * converter.js — Format Conversion Engine
 * Tools: Hex↔Base58, EVM Checksum, Mnemonic→Keys, Text↔Hex
 * 100% client-side
 */

// ============================
// BASE58 CODEC
// ============================

/**
 * Base58 encoding/decoding
 * 
 * Base58 dipakai oleh Bitcoin, Solana, Tron, dll.
 * Berbeda dari Base64 karena menghilangkan karakter yang mirip:
 * - 0 (nol) vs O (huruf besar)
 * - I (huruf besar) vs l (huruf kecil)
 * - + dan / (tidak URL-safe)
 */
const BASE58_ALPHA = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function hexToBytes(hex) {
  hex = hex.replace(/^0x/, '');
  if (hex.length % 2) hex = '0' + hex;
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function encodeBase58(bytes) {
  let num = BigInt('0x' + bytesToHex(bytes));
  let result = '';
  while (num > 0n) {
    result = BASE58_ALPHA[Number(num % 58n)] + result;
    num /= 58n;
  }
  // Leading zeros → '1' in Base58
  for (const b of bytes) {
    if (b === 0) result = '1' + result;
    else break;
  }
  return result || '1';
}

function decodeBase58(str) {
  let num = 0n;
  for (const c of str) {
    const i = BASE58_ALPHA.indexOf(c);
    if (i === -1) throw new Error(`Invalid Base58 character: "${c}"`);
    num = num * 58n + BigInt(i);
  }
  let hex = num.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  // Leading '1's → 0x00 bytes
  for (const c of str) {
    if (c === '1') bytes.unshift(0);
    else break;
  }
  return new Uint8Array(bytes);
}


// ============================
// DOM REFS
// ============================

const dom = {
  hexInput:      document.getElementById('hex-input'),
  b58Input:      document.getElementById('b58-input'),
  checksumInput: document.getElementById('checksum-input'),
  checksumResult:document.getElementById('checksum-result'),
  mnemonicInput: document.getElementById('mnemonic-input'),
  seedResult:    document.getElementById('seed-result'),
  textInput:     document.getElementById('text-input'),
  textHexInput:  document.getElementById('text-hex-input'),
};


// ============================
// TOOL 1: HEX ↔ BASE58
// ============================

document.getElementById('hex-to-b58').addEventListener('click', () => {
  try {
    const hex = dom.hexInput.value.trim();
    if (!hex) return toast('Enter a hex value', true);
    dom.b58Input.value = encodeBase58(hexToBytes(hex));
    toast('Converted to Base58');
  } catch (e) {
    toast('Invalid hex: ' + e.message, true);
  }
});

document.getElementById('b58-to-hex').addEventListener('click', () => {
  try {
    const b58 = dom.b58Input.value.trim();
    if (!b58) return toast('Enter a Base58 value', true);
    dom.hexInput.value = bytesToHex(decodeBase58(b58));
    toast('Converted to Hex');
  } catch (e) {
    toast('Invalid Base58: ' + e.message, true);
  }
});

// Swap button
document.getElementById('swap-hex-b58').addEventListener('click', () => {
  const tmp = dom.hexInput.value;
  dom.hexInput.value = dom.b58Input.value;
  dom.b58Input.value = tmp;
});


// ============================
// TOOL 2: EVM CHECKSUM (EIP-55)
// ============================

/**
 * EIP-55 Checksum
 * 
 * EVM address sebenarnya case-insensitive (0xabc = 0xABC).
 * Tapi EIP-55 menggunakan case (uppercase/lowercase) sebagai checksum:
 * - Hash address lowercase dengan keccak256
 * - Jika bit hash ≥ 8, uppercase karakter tersebut
 * 
 * Kita pakai ethers.js getAddress() yang sudah implement ini.
 */
document.getElementById('checksum-btn').addEventListener('click', () => {
  const addr = dom.checksumInput.value.trim();
  if (!addr) return toast('Enter an EVM address', true);
  try {
    const checksummed = ethers.getAddress(addr);
    showOutput('checksum-result', `
      <div class="output-item">
        <span class="output-label">Checksummed</span>
        <span class="output-value mono">${checksummed}</span>
        <button class="copy-btn copy-btn--icon" data-val="${checksummed}" title="Copy">
          <i class="hgi-stroke hgi-copy-01"></i>
        </button>
      </div>
      <div class="output-item">
        <span class="output-label">Lowercase</span>
        <span class="output-value mono">${addr.toLowerCase()}</span>
        <button class="copy-btn copy-btn--icon" data-val="${addr.toLowerCase()}" title="Copy">
          <i class="hgi-stroke hgi-copy-01"></i>
        </button>
      </div>
    `);
    toast('Checksum applied');
  } catch {
    toast('Invalid EVM address', true);
  }
});


// ============================
// TOOL 3: MNEMONIC → KEYS
// ============================

/**
 * BIP39 Mnemonic → EVM keys
 * 
 * Mnemonic (12/24 kata) di-derive menjadi:
 * - Seed → private key → public key → address
 * Derivation path default: m/44'/60'/0'/0/0 (EVM)
 * 
 * Kita pakai ethers.Wallet.fromPhrase() yang handle semua ini.
 */
document.getElementById('mnemonic-btn').addEventListener('click', () => {
  const mn = dom.mnemonicInput.value.trim();
  if (!mn) return toast('Enter a mnemonic phrase', true);
  
  const words = mn.split(/\s+/);
  if (words.length !== 12 && words.length !== 24) {
    return toast(`Expected 12 or 24 words, got ${words.length}`, true);
  }
  
  try {
    const wallet = ethers.Wallet.fromPhrase(mn);
    showOutput('seed-result', `
      <div class="output-item">
        <span class="output-label">Address</span>
        <span class="output-value mono">${wallet.address}</span>
        <button class="copy-btn copy-btn--icon" data-val="${wallet.address}" title="Copy">
          <i class="hgi-stroke hgi-copy-01"></i>
        </button>
      </div>
      <div class="output-item">
        <span class="output-label">Private Key</span>
        <span class="output-value mono">${wallet.privateKey}</span>
        <button class="copy-btn copy-btn--icon" data-val="${wallet.privateKey}" title="Copy">
          <i class="hgi-stroke hgi-copy-01"></i>
        </button>
      </div>
      <div class="output-item">
        <span class="output-label">Path</span>
        <span class="output-value">m/44'/60'/0'/0/0 (EVM default)</span>
      </div>
    `);
    toast('Keys derived');
  } catch (e) {
    toast('Invalid mnemonic: ' + e.message, true);
  }
});


// ============================
// TOOL 4: TEXT ↔ HEX
// ============================

document.getElementById('text-to-hex').addEventListener('click', () => {
  const text = dom.textInput.value;
  if (!text) return toast('Enter text', true);
  const hex = Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  dom.textHexInput.value = hex;
  toast('Converted to Hex');
});

document.getElementById('hex-to-text').addEventListener('click', () => {
  try {
    const hex = dom.textHexInput.value.trim().replace(/^0x/, '');
    if (!hex) return toast('Enter hex', true);
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    dom.textInput.value = new TextDecoder().decode(bytes);
    toast('Converted to Text');
  } catch (e) {
    toast('Invalid hex: ' + e.message, true);
  }
});

document.getElementById('swap-text-hex').addEventListener('click', () => {
  const tmp = dom.textInput.value;
  dom.textInput.value = dom.textHexInput.value;
  dom.textHexInput.value = tmp;
});


// ============================
// HELPERS
// ============================

function showOutput(id, html) {
  const el = document.getElementById(id);
  el.style.display = '';
  el.innerHTML = html;
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

// Copy buttons (event delegation)
document.addEventListener('click', e => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const val = btn.dataset.val;
  navigator.clipboard.writeText(val).then(() => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1500);
    toast('Copied');
  });
});
