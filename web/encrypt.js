/**
 * encrypt.js — AES-256-GCM Encryption/Decryption Engine
 * 
 * Security specs:
 * - Algorithm: AES-256-GCM (authenticated encryption)
 * - Key derivation: PBKDF2 with 100K iterations + SHA-256
 * - Salt: 16 bytes random (per encryption)
 * - IV: 12 bytes random (per encryption)
 * - File format: [salt(16)] [iv(12)] [ciphertext(N)] [tag(16)]
 * 
 * 100% client-side — uses Web Crypto API (native browser crypto)
 */

// ============================
// CRYPTO CORE
// ============================

/**
 * deriveKey(password, salt)
 * 
 * PBKDF2 mengubah password menjadi AES key:
 * 1. Import password sebagai raw key material
 * 2. Derive 256-bit AES key dengan 100K iterations SHA-256
 * 
 * 100K iterations = ~100ms di modern device
 * Salt mencegah rainbow table attacks
 */
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * encrypt(data, password)
 * 
 * 1. Generate random salt (16 bytes) + IV (12 bytes)
 * 2. Derive AES-256 key dari password + salt
 * 3. Encrypt data dengan AES-GCM (authenticated)
 * 4. Pack: salt + iv + ciphertext (includes GCM tag)
 */
async function encryptData(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, enc.encode(data)
  );
  // Pack: salt(16) + iv(12) + ciphertext(N)
  const packed = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  packed.set(salt, 0);
  packed.set(iv, 16);
  packed.set(new Uint8Array(ciphertext), 28);
  return packed;
}

/**
 * decrypt(packed, password)
 * 
 * 1. Unpack: salt(16) + iv(12) + ciphertext(N)
 * 2. Derive same AES-256 key
 * 3. Decrypt + verify GCM tag (tamper detection)
 */
async function decryptData(packed, password) {
  const arr = new Uint8Array(packed);
  const salt = arr.slice(0, 16);
  const iv = arr.slice(16, 28);
  const ciphertext = arr.slice(28);
  const key = await deriveKey(password, salt);
  const dec = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, ciphertext
  );
  return new TextDecoder().decode(dec);
}


// ============================
// PASSWORD STRENGTH
// ============================

/**
 * Password strength checker
 * Score 0-4 berdasarkan:
 * - Length (8+, 12+, 16+)
 * - Lowercase, Uppercase, Numbers, Symbols
 */
function getPasswordStrength(pass) {
  if (!pass) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;
  score = Math.min(score, 4);
  
  const levels = [
    { label: 'Too weak', color: '#dc2626' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
    { label: 'Very strong', color: '#16a34a' },
  ];
  return { score, ...levels[score] };
}


// ============================
// UI LOGIC
// ============================

const dom = {
  encryptInput:  document.getElementById('encrypt-input'),
  encryptPass:   document.getElementById('encrypt-pass'),
  encryptBtn:    document.getElementById('encrypt-btn'),
  decryptFile:   document.getElementById('decrypt-file'),
  decryptPass:   document.getElementById('decrypt-pass'),
  decryptBtn:    document.getElementById('decrypt-btn'),
  decryptOutput: document.getElementById('decrypt-output'),
  decryptText:   document.getElementById('decrypt-text'),
  strengthFill:  document.getElementById('strength-fill'),
  strengthLabel: document.getElementById('strength-label'),
  fileDrop:      document.getElementById('file-drop'),
  fileName:      document.getElementById('file-name'),
};

// -- Mode Toggle --
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    document.getElementById('encrypt-mode').style.display = mode === 'encrypt' ? '' : 'none';
    document.getElementById('decrypt-mode').style.display = mode === 'decrypt' ? '' : 'none';
  });
});

// -- Password Strength Meter --
dom.encryptPass.addEventListener('input', () => {
  const s = getPasswordStrength(dom.encryptPass.value);
  dom.strengthFill.style.width = `${(s.score / 4) * 100}%`;
  dom.strengthFill.style.background = s.color;
  dom.strengthLabel.textContent = s.label;
  dom.strengthLabel.style.color = s.color;
});

// -- Show/Hide Password --
document.querySelectorAll('.toggle-pass-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.querySelector('i').className = `hgi-stroke ${isPassword ? 'hgi-eye-off' : 'hgi-eye'}`;
  });
});

// -- File Drop Zone --
dom.fileDrop.addEventListener('dragover', e => { e.preventDefault(); dom.fileDrop.classList.add('drag-over'); });
dom.fileDrop.addEventListener('dragleave', () => dom.fileDrop.classList.remove('drag-over'));
dom.fileDrop.addEventListener('drop', e => {
  e.preventDefault();
  dom.fileDrop.classList.remove('drag-over');
  if (e.dataTransfer.files.length) {
    dom.decryptFile.files = e.dataTransfer.files;
    dom.fileName.textContent = e.dataTransfer.files[0].name;
  }
});
dom.decryptFile.addEventListener('change', () => {
  if (dom.decryptFile.files.length) {
    dom.fileName.textContent = dom.decryptFile.files[0].name;
  }
});

// -- ENCRYPT --
dom.encryptBtn.addEventListener('click', async () => {
  const data = dom.encryptInput.value.trim();
  const pass = dom.encryptPass.value;
  
  if (!data) return toast('Paste wallet data to encrypt', true);
  if (!pass) return toast('Enter a password', true);
  if (pass.length < 4) return toast('Password too short (min 4 chars)', true);
  
  try {
    dom.encryptBtn.disabled = true;
    dom.encryptBtn.textContent = 'Encrypting...';
    
    const packed = await encryptData(data, pass);
    
    // Download encrypted file
    const blob = new Blob([packed], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wallets-${Date.now()}.encrypted`;
    a.click();
    URL.revokeObjectURL(a.href);
    
    toast('Encrypted & downloaded!');
  } catch (e) {
    toast('Encryption failed: ' + e.message, true);
  } finally {
    dom.encryptBtn.disabled = false;
    dom.encryptBtn.innerHTML = '<i class="hgi-stroke hgi-lock-key"></i> Encrypt & Download';
  }
});

// -- DECRYPT --
dom.decryptBtn.addEventListener('click', async () => {
  const file = dom.decryptFile.files[0];
  const pass = dom.decryptPass.value;
  
  if (!file) return toast('Upload an encrypted file', true);
  if (!pass) return toast('Enter the password', true);
  
  try {
    dom.decryptBtn.disabled = true;
    dom.decryptBtn.textContent = 'Decrypting...';
    
    const buf = await file.arrayBuffer();
    const text = await decryptData(buf, pass);
    
    // Show result
    dom.decryptOutput.style.display = '';
    try {
      dom.decryptText.textContent = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      dom.decryptText.textContent = text;
    }
    
    toast('Decrypted successfully!');
  } catch {
    toast('Decryption failed — wrong password?', true);
  } finally {
    dom.decryptBtn.disabled = false;
    dom.decryptBtn.innerHTML = '<i class="hgi-stroke hgi-lock-unlocked-01"></i> Decrypt';
  }
});

// -- Copy Decrypted --
document.getElementById('copy-decrypted').addEventListener('click', () => {
  navigator.clipboard.writeText(dom.decryptText.textContent).then(() => {
    toast('Copied to clipboard');
  });
});


// ============================
// HELPERS
// ============================

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
