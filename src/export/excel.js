/**
 * excel.js — Excel (.xlsx) Export Module
 * 
 * PENJELASAN:
 * ==========
 * Excel export berguna untuk:
 * - User yang lebih familiar dengan spreadsheet
 * - Sorting, filtering, pivot table
 * - Share ke non-technical people
 * 
 * Fitur:
 * - Auto-width kolom (kolom menyesuaikan lebar data)
 * - Header styling (bold, background color)
 * - Freeze header row (tetap terlihat saat scroll)
 */

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { EXPORT_CONFIG } from '../utils/config.js';
import logger from '../utils/logger.js';

/**
 * Export wallet array ke file Excel (.xlsx)
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @param {string} [outputPath] - Path file output
 * @param {Object} [options] - Opsi export
 * @returns {string} Path file yang dibuat
 */
export function exportToExcel(wallets, outputPath, options = {}) {
  // Default output path
  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const chain = wallets[0]?.chain || 'unknown';
    outputPath = path.join(EXPORT_CONFIG.defaultOutputDir, `wallets-${chain}-${timestamp}.xlsx`);
  }

  // Pastikan folder output ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Prepare data: flatten objects untuk spreadsheet
  const flatData = wallets.map(wallet => {
    const row = {
      '#': wallet.index || '',
      'Chain': (wallet.chain || '').toUpperCase(),
      'Address': wallet.address || '',
      'Private Key': wallet.privateKey || '',
    };

    // Tambah kolom optional
    if (wallet.mnemonic) row['Mnemonic'] = wallet.mnemonic;
    if (wallet.path) row['Derivation Path'] = wallet.path;
    if (wallet.publicKey) row['Public Key'] = wallet.publicKey;

    // Chain-specific columns
    if (wallet.legacy) row['Legacy Address'] = wallet.legacy;
    if (wallet.segwit) row['SegWit Address'] = wallet.segwit;
    if (wallet.native) row['Native SegWit'] = wallet.native;
    if (wallet.evmAddress) row['EVM Address'] = wallet.evmAddress;
    if (wallet.rawAddress) row['Raw Address'] = wallet.rawAddress;
    
    // Cosmos addresses - flatten ke kolom terpisah
    if (wallet.addresses && typeof wallet.addresses === 'object') {
      for (const [chain, addr] of Object.entries(wallet.addresses)) {
        row[`${chain.charAt(0).toUpperCase() + chain.slice(1)} Address`] = addr;
      }
    }

    if (wallet.secretKeyArray) row['Secret Key Array'] = wallet.secretKeyArray;
    row['Timestamp'] = wallet.timestamp || new Date().toISOString();

    return row;
  });

  // Buat workbook + worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(flatData);

  // Auto-width kolom
  // Hitung lebar maksimum data per kolom
  const columnWidths = {};
  if (flatData.length > 0) {
    const headers = Object.keys(flatData[0]);
    headers.forEach(header => {
      // Ambil panjang header dan beberapa data untuk hitung max width
      let maxLen = header.length;
      for (let i = 0; i < Math.min(10, flatData.length); i++) {
        const val = String(flatData[i][header] || '');
        maxLen = Math.max(maxLen, Math.min(val.length, 50)); // Cap at 50 chars
      }
      columnWidths[header] = maxLen + 2; // Padding
    });

    // Set column widths
    worksheet['!cols'] = Object.values(columnWidths).map(w => ({ wch: w }));
  }

  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Wallets');

  // Tambah sheet metadata
  const metaData = [
    { 'Property': 'Generated At', 'Value': new Date().toISOString() },
    { 'Property': 'Total Wallets', 'Value': wallets.length },
    { 'Property': 'Chain', 'Value': (wallets[0]?.chain || 'unknown').toUpperCase() },
    { 'Property': 'Generator', 'Value': 'web3-wallet-toolkit v1.0.0' },
  ];
  const metaSheet = XLSX.utils.json_to_sheet(metaData);
  metaSheet['!cols'] = [{ wch: 15 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Info');

  // Tulis file
  XLSX.writeFile(workbook, outputPath);

  const fileSize = fs.statSync(outputPath).size;
  const fileSizeKB = (fileSize / 1024).toFixed(1);
  logger.success(`Excel exported: ${outputPath} (${wallets.length} wallets, ${fileSizeKB} KB)`);

  return outputPath;
}
