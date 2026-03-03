/**
 * json-export.js — JSON Export Module
 * 
 * PENJELASAN:
 * ==========
 * JSON (JavaScript Object Notation) adalah format paling natural
 * untuk data wallet karena:
 * - Bisa langsung di-parse oleh program lain
 * - Mendukung nested data (seperti addresses Cosmos)
 * - Human-readable
 * 
 * DUA MODE:
 * 1. Pretty-print: indented, mudah dibaca manusia
 * 2. Minified: compact, ukuran file lebih kecil
 */

import fs from 'fs';
import path from 'path';
import { EXPORT_CONFIG } from '../utils/config.js';
import logger from '../utils/logger.js';

/**
 * Export wallet array ke file JSON
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @param {string} [outputPath] - Path file output
 * @param {Object} [options] - Opsi export
 * @param {boolean} [options.pretty=true] - Pretty-print (indented)?
 * @param {boolean} [options.includeMetadata=true] - Include metadata?
 * @returns {string} Path file yang dibuat
 */
export function exportToJSON(wallets, outputPath, options = {}) {
  const {
    pretty = true,
    includeMetadata = true,
  } = options;

  // Default output path
  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const chain = wallets[0]?.chain || 'unknown';
    outputPath = path.join(EXPORT_CONFIG.defaultOutputDir, `wallets-${chain}-${timestamp}.json`);
  }

  // Pastikan folder output ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Buat output object
  const output = {};

  if (includeMetadata) {
    output.metadata = {
      generatedAt: new Date().toISOString(),
      totalWallets: wallets.length,
      chain: wallets[0]?.chain || 'unknown',
      generator: 'web3-wallet-toolkit',
      version: '1.0.0',
    };
  }

  output.wallets = wallets;

  // Tulis ke file
  const jsonString = pretty
    ? JSON.stringify(output, null, 2)   // Pretty: 2-space indentation
    : JSON.stringify(output);            // Minified: no whitespace

  fs.writeFileSync(outputPath, jsonString, 'utf8');

  const fileSizeKB = (Buffer.byteLength(jsonString) / 1024).toFixed(1);
  logger.success(`JSON exported: ${outputPath} (${wallets.length} wallets, ${fileSizeKB} KB)`);

  return outputPath;
}
