/**
 * vault.js — Encrypted Wallet Vault
 * 
 * Menyimpan wallet terenkripsi di chrome.storage.local.
 * Menggunakan AES-256-GCM + PBKDF2 (sama seperti web app).
 * 
 * Flow:
 * 1. User buat password → derive AES key → encrypt vault data
 * 2. Vault data disimpan sebagai base64 di chrome.storage.local
 * 3. Unlock: input password → derive key → decrypt → show wallets
 */

const VAULT = {
  isUnlocked: false,
  wallets: [],
  key: null,
};


// ============================
// CRYPTO
// ============================

async function vaultDeriveKey(password, salt) {
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

async function vaultEncrypt(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await vaultDeriveKey(password, salt);
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(data));
  
  const packed = new Uint8Array(salt.length + iv.length + ct.byteLength);
  packed.set(salt, 0);
  packed.set(iv, 16);
  packed.set(new Uint8Array(ct), 28);
  return btoa(String.fromCharCode(...packed));
}

async function vaultDecrypt(base64, password) {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const ct = raw.slice(28);
  const key = await vaultDeriveKey(password, salt);
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(dec);
}


// ============================
// STORAGE
// ============================

async function vaultSave(password) {
  const json = JSON.stringify(VAULT.wallets);
  const encrypted = await vaultEncrypt(json, password);
  await chrome.storage.local.set({ vault: encrypted });
}

async function vaultLoad(password) {
  const result = await chrome.storage.local.get('vault');
  if (!result.vault) throw new Error('No vault found');
  const json = await vaultDecrypt(result.vault, password);
  VAULT.wallets = JSON.parse(json);
  VAULT.isUnlocked = true;
  return VAULT.wallets;
}

async function vaultCreate(password) {
  VAULT.wallets = [];
  VAULT.isUnlocked = true;
  await vaultSave(password);
  return VAULT.wallets;
}

function vaultAddWallet(wallet) {
  VAULT.wallets.push({
    ...wallet,
    savedAt: new Date().toISOString(),
  });
}

function vaultLock() {
  VAULT.isUnlocked = false;
  VAULT.wallets = [];
  VAULT.key = null;
}

async function vaultExport() {
  const json = JSON.stringify(VAULT.wallets, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  chrome.downloads?.download({
    url,
    filename: `aio-vault-${Date.now()}.json`,
    saveAs: true,
  });
}

async function vaultHasData() {
  const result = await chrome.storage.local.get('vault');
  return !!result.vault;
}
