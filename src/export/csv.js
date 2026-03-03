/**
 * csv.js — CSV Export Module
 * 
 * PENJELASAN:
 * ==========
 * CSV (Comma-Separated Values) adalah format paling universal.
 * Bisa dibuka di:
 * - Excel, Google Sheets, LibreOffice
 * - Text editor biasa (Notepad, VS Code)
 * - Di-import ke database atau script lain
 * 
 * KENAPA STREAM WRITING?
 * Untuk 10K wallet, file bisa berisi ~5MB+ data.
 * Dengan stream, kita tulis baris per baris ke disk,
 * bukan simpan seluruh file di memory dulu.
 * Ini menjaga RAM usage tetap rendah.
 */

import fs from 'fs';
import path from 'path';
import { EXPORT_CONFIG } from '../utils/config.js';
import logger from '../utils/logger.js';

/**
 * Export wallet array ke file CSV
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @param {string} [outputPath] - Path file output
 * @param {Object} [options] - Opsi export
 * @param {boolean} [options.includePrivateKey=true] - Include private key?
 * @param {boolean} [options.includeMnemonic=true] - Include mnemonic?
 * @returns {string} Path file yang dibuat
 * 
 * FORMAT CSV:
 * index,chain,address,privateKey,mnemonic,path,timestamp
 * 1,evm,0x742d...,0xabc...,word1 word2...,m/44'/60'/0'/0/0,2024-01-01T00:00:00Z
 * 2,evm,0x8f3e...,0xdef...,word1 word2...,m/44'/60'/0'/0/0,2024-01-01T00:00:01Z
 */
export function exportToCSV(wallets, outputPath, options = {}) {
  const {
    includePrivateKey = true,
    includeMnemonic = true,
  } = options;

  // Default output path
  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const chain = wallets[0]?.chain || 'unknown';
    outputPath = path.join(EXPORT_CONFIG.defaultOutputDir, `wallets-${chain}-${timestamp}.csv`);
  }

  // Pastikan folder output ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Tentukan kolom berdasarkan chain
  const baseColumns = ['index', 'chain', 'address'];
  if (includePrivateKey) baseColumns.push('privateKey');
  if (includeMnemonic) baseColumns.push('mnemonic');

  // Tambah kolom tambahan berdasarkan chain
  const extraColumns = getExtraColumns(wallets[0]);
  const allColumns = [...baseColumns, ...extraColumns, 'timestamp'];

  // Tulis header
  const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });
  writeStream.write(allColumns.join(',') + '\n');

  // Tulis data per baris (stream writing)
  for (const wallet of wallets) {
    const row = allColumns.map(col => {
      let value = wallet[col] || '';
      // Escape comma dan quote di value
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      // Untuk object (seperti addresses di Cosmos), stringify
      if (typeof value === 'object') {
        value = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return value;
    });
    writeStream.write(row.join(',') + '\n');
  }

  writeStream.end();
  logger.success(`CSV exported: ${outputPath} (${wallets.length} wallets)`);
  return outputPath;
}

/**
 * Get kolom tambahan berdasarkan chain
 * Setiap chain punya data unik yang perlu di-export
 */
function getExtraColumns(sampleWallet) {
  if (!sampleWallet) return [];

  const extras = [];
  if (sampleWallet.path) extras.push('path');
  if (sampleWallet.legacy) extras.push('legacy');
  if (sampleWallet.segwit) extras.push('segwit');
  if (sampleWallet.native) extras.push('native');
  if (sampleWallet.evmAddress) extras.push('evmAddress');
  if (sampleWallet.rawAddress) extras.push('rawAddress');
  if (sampleWallet.publicKey) extras.push('publicKey');
  if (sampleWallet.secretKeyArray) extras.push('secretKeyArray');
  if (sampleWallet.addresses) extras.push('addresses');

  return extras;
}
