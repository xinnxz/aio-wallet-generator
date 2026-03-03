/**
 * export.js — CLI Export Command
 * 
 * PENJELASAN:
 * ==========
 * Command untuk export wallet data yang sudah di-generate
 * ke berbagai format file.
 * 
 * Contoh penggunaan:
 * $ web3-wallet export --format csv --file ./wallets.csv
 * $ web3-wallet export --format xlsx --file ./wallets.xlsx
 * $ web3-wallet export --format encrypted --password "mypass"
 * $ web3-wallet export --format json --file ./wallets.json --input ./output/wallets.json
 */

import fs from 'fs';
import path from 'path';
import { exportToCSV } from '../../export/csv.js';
import { exportToJSON } from '../../export/json-export.js';
import { exportToExcel } from '../../export/excel.js';
import { exportEncrypted } from '../../export/encrypted.js';
import { createSpinner } from '../ui.js';
import logger from '../../utils/logger.js';
import { EXPORT_CONFIG } from '../../utils/config.js';
import chalk from 'chalk';

/**
 * Handler untuk command `export`
 * 
 * @param {Object} options - Options dari commander.js
 * @param {string} options.format - Export format (csv/json/xlsx/encrypted)
 * @param {string} options.file - Output file path
 * @param {string} options.input - Input file (JSON wallet data)
 * @param {string} options.password - Password for encrypted export
 */
export async function handleExport(options) {
  const {
    format = 'json',
    file: outputFile,
    input: inputFile,
    password,
  } = options;

  // Cari wallet data dari file input
  let wallets;

  if (inputFile) {
    // Load dari file yang di-specify
    wallets = loadWalletsFromFile(inputFile);
  } else {
    // Cari file terbaru di output directory
    wallets = loadLatestWallets();
  }

  if (!wallets || wallets.length === 0) {
    logger.error('No wallet data found!');
    logger.info('Generate wallets first: web3-wallet generate --chain evm --count 100');
    logger.info('Or specify input file: web3-wallet export --input ./wallets.json --format csv');
    process.exit(1);
  }

  logger.info(`Found ${chalk.bold(wallets.length)} wallets to export`);

  const spinner = createSpinner(`Exporting to ${format.toUpperCase()}...`);
  spinner.start();

  try {
    let outputPath;
    switch (format.toLowerCase()) {
      case 'csv':
        outputPath = exportToCSV(wallets, outputFile);
        break;
      case 'json':
        outputPath = exportToJSON(wallets, outputFile);
        break;
      case 'xlsx':
      case 'excel':
        outputPath = exportToExcel(wallets, outputFile);
        break;
      case 'encrypted':
        if (!password) {
          spinner.fail('Password required!');
          logger.info('Usage: web3-wallet export --format encrypted --password "your-password"');
          return;
        }
        outputPath = exportEncrypted(wallets, password, outputFile);
        break;
      default:
        spinner.fail(`Unknown format: ${format}`);
        logger.info(`Supported formats: ${EXPORT_CONFIG.formats.join(', ')}`);
        return;
    }

    spinner.succeed(chalk.green(`✅ Exported successfully to: ${outputPath}`));
  } catch (error) {
    spinner.fail(`Export failed: ${error.message}`);
    logger.error(error.message);
  }
}

/**
 * Load wallets dari file JSON
 */
function loadWalletsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    logger.error(`File not found: ${filePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    // Support both { wallets: [...] } dan direct array format
    return data.wallets || data;
  } catch (error) {
    logger.error(`Failed to parse file: ${error.message}`);
    return null;
  }
}

/**
 * Cari dan load file wallet terbaru dari output/
 */
function loadLatestWallets() {
  const outputDir = EXPORT_CONFIG.defaultOutputDir;

  if (!fs.existsSync(outputDir)) {
    return null;
  }

  // Cari semua .json files di output/
  const files = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(outputDir, f),
      mtime: fs.statSync(path.join(outputDir, f)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime); // Sort by newest

  if (files.length === 0) return null;

  const latest = files[0];
  logger.info(`Using latest file: ${latest.name}`);

  return loadWalletsFromFile(latest.path);
}
