/**
 * encrypted.js — Password-Protected Encrypted Export
 * 
 * PENJELASAN:
 * ==========
 * Format .encrypted adalah format custom kita yang:
 * - JSON data → AES-256-GCM encrypt → Base64 encode → save to file
 * 
 * Berguna untuk:
 * - Menyimpan wallet file di cloud storage (Google Drive, Dropbox)
 * - Mengirim wallet data via email
 * - Backup yang aman (membutuhkan password untuk membuka)
 * 
 * FORMAT FILE:
 * Line 1: "WEB3-WALLET-TOOLKIT-ENCRYPTED-V1" (magic header)
 * Line 2: metadata JSON (jumlah wallet, chain, timestamp)
 * Line 3: "" (empty line separator) 
 * Line 4+: Base64 encoded encrypted data
 * 
 * Magic header berguna untuk:
 * - Identifikasi file sehingga tidak salah decrypt
 * - Versi format (untuk backward compatibility di masa depan)
 */

import fs from 'fs';
import path from 'path';
import { encrypt, decrypt, encryptToBase64, decryptFromBase64 } from '../security/encryption.js';
import { EXPORT_CONFIG } from '../utils/config.js';
import logger from '../utils/logger.js';

const MAGIC_HEADER = 'WEB3-WALLET-TOOLKIT-ENCRYPTED-V1';

/**
 * Export wallet ke file .encrypted
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @param {string} password - Password untuk encrypt
 * @param {string} [outputPath] - Path file output
 * @returns {string} Path file yang dibuat
 */
export function exportEncrypted(wallets, password, outputPath) {
  if (!password || password.length < 4) {
    throw new Error('Password minimal 4 karakter untuk keamanan');
  }

  // Default output path
  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const chain = wallets[0]?.chain || 'unknown';
    outputPath = path.join(EXPORT_CONFIG.defaultOutputDir, `wallets-${chain}-${timestamp}.encrypted`);
  }

  // Pastikan folder output ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Prepare data
  const data = {
    wallets: wallets,
    metadata: {
      totalWallets: wallets.length,
      chain: wallets[0]?.chain || 'unknown',
      generatedAt: new Date().toISOString(),
      generator: 'web3-wallet-toolkit',
    },
  };

  // Encrypt
  const encryptedBase64 = encryptToBase64(data, password);

  // Metadata (tidak encrypted, untuk quick info tanpa decrypt)
  const metadata = JSON.stringify({
    totalWallets: wallets.length,
    chain: (wallets[0]?.chain || 'unknown').toUpperCase(),
    encryptedAt: new Date().toISOString(),
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-SHA512-100K',
  });

  // Tulis file dengan magic header
  const fileContent = [
    MAGIC_HEADER,
    metadata,
    '',
    encryptedBase64,
  ].join('\n');

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  const fileSizeKB = (Buffer.byteLength(fileContent) / 1024).toFixed(1);
  logger.success(`Encrypted export: ${outputPath} (${wallets.length} wallets, ${fileSizeKB} KB)`);

  return outputPath;
}

/**
 * Decrypt file .encrypted dan return wallet data
 * 
 * @param {string} filePath - Path ke file .encrypted
 * @param {string} password - Password untuk decrypt
 * @returns {Object} { wallets: [], metadata: {} }
 */
export function decryptFile(filePath, password) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');

  // Verify magic header
  if (lines[0] !== MAGIC_HEADER) {
    throw new Error(
      'File ini bukan format encrypted yang valid!\n' +
      'Pastikan file dibuat oleh web3-wallet-toolkit.'
    );
  }

  // Read metadata (line 2 — not encrypted)
  const metadata = JSON.parse(lines[1]);
  logger.info(`File contains ${metadata.totalWallets} ${metadata.chain} wallets`);
  logger.info(`Encrypted at: ${metadata.encryptedAt}`);

  // Decrypt data (line 4+)
  const encryptedBase64 = lines.slice(3).join('\n');
  const decryptedString = decryptFromBase64(encryptedBase64, password);
  const data = JSON.parse(decryptedString);

  logger.success(`Successfully decrypted ${data.wallets.length} wallets`);

  return data;
}

/**
 * Get info dari file .encrypted tanpa decrypt
 * Berguna untuk preview sebelum memasukkan password
 */
export function getEncryptedFileInfo(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');

  if (lines[0] !== MAGIC_HEADER) {
    throw new Error('File bukan format encrypted yang valid');
  }

  const metadata = JSON.parse(lines[1]);
  const fileSize = fs.statSync(filePath).size;

  return {
    ...metadata,
    fileSizeBytes: fileSize,
    fileSizeKB: (fileSize / 1024).toFixed(1),
    format: lines[0],
  };
}
