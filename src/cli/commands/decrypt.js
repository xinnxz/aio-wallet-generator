/**
 * decrypt.js — CLI Decrypt Command
 * 
 * PENJELASAN:
 * ==========
 * Command untuk decrypt file .encrypted yang dibuat oleh export command.
 * 
 * Contoh:
 * $ web3-wallet decrypt --file ./wallets.encrypted --password "mypassword"
 * $ web3-wallet decrypt --file ./wallets.encrypted --password "mypassword" --output json
 */

import chalk from 'chalk';
import { decryptFile, getEncryptedFileInfo } from '../../export/encrypted.js';
import { exportToCSV } from '../../export/csv.js';
import { exportToJSON } from '../../export/json-export.js';
import { exportToExcel } from '../../export/excel.js';
import { createSpinner, renderWalletTable, renderSummary } from '../ui.js';
import logger from '../../utils/logger.js';

/**
 * Handler untuk command `decrypt`
 * 
 * @param {Object} options
 * @param {string} options.file - Path ke file .encrypted
 * @param {string} options.password - Password untuk decrypt
 * @param {string} options.output - Format output setelah decrypt (json/csv/xlsx)
 * @param {string} options.outputFile - Path output file
 */
export async function handleDecrypt(options) {
  const {
    file: filePath,
    password,
    output: outputFormat,
    outputFile,
  } = options;

  if (!filePath) {
    logger.error('File path required!');
    logger.info('Usage: web3-wallet decrypt --file ./wallets.encrypted --password "password"');
    process.exit(1);
  }

  if (!password) {
    logger.error('Password required!');
    logger.info('Usage: web3-wallet decrypt --file ./wallets.encrypted --password "password"');
    process.exit(1);
  }

  // Step 1: Show file info tanpa decrypt
  console.log('');
  try {
    const fileInfo = getEncryptedFileInfo(filePath);
    renderSummary({
      '📁 File': filePath,
      '🔗 Chain': fileInfo.chain,
      '💰 Wallets': fileInfo.totalWallets,
      '🔐 Algorithm': fileInfo.algorithm,
      '📅 Encrypted At': fileInfo.encryptedAt,
      '📏 File Size': `${fileInfo.fileSizeKB} KB`,
    });
    console.log('');
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }

  // Step 2: Decrypt
  const spinner = createSpinner('Decrypting...');
  spinner.start();

  try {
    const data = decryptFile(filePath, password);
    spinner.succeed(chalk.green('Decryption successful!'));

    // Show preview
    console.log('');
    renderWalletTable(data.wallets, { showPrivateKey: false, maxRows: 10 });

    // Step 3: Optional re-export ke format lain
    if (outputFormat) {
      console.log('');
      const exportSpinner = createSpinner(`Re-exporting to ${outputFormat.toUpperCase()}...`);
      exportSpinner.start();

      try {
        switch (outputFormat.toLowerCase()) {
          case 'csv':
            exportToCSV(data.wallets, outputFile);
            break;
          case 'json':
            exportToJSON(data.wallets, outputFile);
            break;
          case 'xlsx':
          case 'excel':
            exportToExcel(data.wallets, outputFile);
            break;
          default:
            logger.warn(`Unknown format: ${outputFormat}. Supported: csv, json, xlsx`);
        }
        exportSpinner.succeed(chalk.green(`Re-exported to ${outputFormat.toUpperCase()}`));
      } catch (error) {
        exportSpinner.fail(`Re-export failed: ${error.message}`);
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Decryption failed!'));
    logger.error(error.message);
    process.exit(1);
  }
}
