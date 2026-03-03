/**
 * generate.js — CLI Generate Command
 * 
 * PENJELASAN:
 * ==========
 * Command utama untuk generate wallet dari terminal.
 * 
 * Contoh penggunaan:
 * $ web3-wallet generate --chain evm --count 100
 * $ web3-wallet generate --chain solana --count 1000 --output json
 * $ web3-wallet generate --chain evm,solana,cosmos --count 500
 * $ web3-wallet generate --chain evm --count 10000 --hd
 * $ web3-wallet generate --chain all --count 10
 */

import chalk from 'chalk';
import { processBatch } from '../../core/batch.js';
import { generateWallets, getSupportedChains } from '../../core/generator.js';
import { generateMnemonic, deriveWalletsAsync } from '../../core/hd-wallet.js';
import { validateBatch } from '../../security/validator.js';
import { exportToCSV } from '../../export/csv.js';
import { exportToJSON } from '../../export/json-export.js';
import { exportToExcel } from '../../export/excel.js';
import { exportEncrypted } from '../../export/encrypted.js';
import { createSpinner, updateSpinner, renderWalletTable, renderSummary, formatNumber, formatTime } from '../ui.js';
import logger from '../../utils/logger.js';
import { BATCH_CONFIG } from '../../utils/config.js';

/**
 * Handler untuk command `generate`
 * 
 * @param {Object} options - Options dari commander.js
 * @param {string} options.chain - Chain name(s), comma-separated
 * @param {number} options.count - Jumlah wallet
 * @param {boolean} options.hd - HD wallet mode?
 * @param {string} options.output - Output format (json/csv/xlsx/encrypted)
 * @param {string} options.file - Output file path
 * @param {string} options.password - Password for encrypted export
 * @param {boolean} options.showKeys - Show private keys in table?
 */
export async function handleGenerate(options) {
  const {
    chain: chainInput = 'evm',
    count = BATCH_CONFIG.defaultCount,
    hd = false,
    output: outputFormat,
    file: outputFile,
    password,
    showKeys = false,
  } = options;

  // Parse chains (bisa comma-separated: "evm,solana,cosmos")
  let chains;
  if (chainInput === 'all') {
    chains = getSupportedChains();
  } else {
    chains = chainInput.split(',').map(c => c.trim().toLowerCase());
  }

  // Validasi chains
  const supported = getSupportedChains();
  for (const chain of chains) {
    if (!supported.includes(chain)) {
      logger.error(`Unknown chain: "${chain}"`);
      logger.info(`Supported chains: ${supported.join(', ')}`);
      process.exit(1);
    }
  }

  // Validasi count
  const walletCount = parseInt(count);
  if (isNaN(walletCount) || walletCount < 1) {
    logger.error('Count harus angka positif');
    process.exit(1);
  }
  if (walletCount > BATCH_CONFIG.maxWallets) {
    logger.error(`Maksimum ${formatNumber(BATCH_CONFIG.maxWallets)} wallets per generate`);
    process.exit(1);
  }

  console.log('');
  logger.info(`Chain(s): ${chalk.hex('#06B6D4').bold(chains.map(c => c.toUpperCase()).join(', '))}`);
  logger.info(`Count: ${chalk.hex('#10B981').bold(formatNumber(walletCount))} wallets per chain`);
  if (hd) logger.info(`Mode: ${chalk.hex('#F59E0B').bold('HD Wallet (single mnemonic)')}`);
  console.log('');

  const allResults = {};
  const startTime = Date.now();

  for (const chain of chains) {
    const spinner = createSpinner(`Generating ${formatNumber(walletCount)} ${chain.toUpperCase()} wallets...`);
    spinner.start();

    try {
      let wallets;

      if (hd && ['evm', 'bitcoin', 'tron'].includes(chain)) {
        // HD Wallet mode: 1 mnemonic → banyak wallet
        const mnemonic = generateMnemonic();
        spinner.text = chalk.cyan(`Deriving ${formatNumber(walletCount)} wallets from HD mnemonic...`);
        wallets = await deriveWalletsAsync(mnemonic, walletCount, chain);
        spinner.succeed(chalk.green(`${formatNumber(walletCount)} ${chain.toUpperCase()} HD wallets generated`));
        logger.info(`Master mnemonic: ${chalk.hex('#F59E0B')(mnemonic)}`);
      } else if (walletCount > 500) {
        // Batch mode: chunked generation untuk jumlah besar
        wallets = await processBatch(chain, walletCount, {
          onProgress: (progress) => {
            updateSpinner(spinner,
              `[${chain.toUpperCase()}] ${formatNumber(progress.current)}/${formatNumber(progress.total)} ` +
              `wallets (${progress.percentage}%) ` +
              `Chunk ${progress.chunk}/${progress.totalChunks}`
            );
          },
        });
        spinner.succeed(chalk.green(`${formatNumber(walletCount)} ${chain.toUpperCase()} wallets generated`));
      } else {
        // Normal mode: generate langsung
        wallets = await generateWallets(chain, walletCount, {
          onProgress: (progress) => {
            updateSpinner(spinner,
              `[${chain.toUpperCase()}] ${formatNumber(progress.current)}/${formatNumber(progress.total)} wallets (${progress.percentage}%)`
            );
          },
        });
        spinner.succeed(chalk.green(`${formatNumber(walletCount)} ${chain.toUpperCase()} wallets generated`));
      }

      // Validasi batch
      const validation = validateBatch(wallets, chain);
      if (!validation.allValid) {
        logger.warn(`${validation.invalidCount} invalid wallets detected`);
        if (validation.duplicateCheck.hasDuplicates) {
          logger.warn(`${validation.duplicateCheck.duplicates.length} duplicate addresses!`);
        }
      }

      allResults[chain] = wallets;
    } catch (error) {
      spinner.fail(chalk.red(`Failed to generate ${chain.toUpperCase()} wallets`));
      logger.error(error.message);
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;

  // Tampilkan preview table
  console.log('');
  for (const [chain, wallets] of Object.entries(allResults)) {
    if (wallets.length > 0) {
      console.log(chalk.hex('#8B5CF6').bold(`\n  📋 ${chain.toUpperCase()} Wallets Preview:`));
      renderWalletTable(wallets, { showPrivateKey: showKeys, maxRows: 10 });
    }
  }

  // Tampilkan summary
  const totalWallets = Object.values(allResults).reduce((sum, w) => sum + w.length, 0);
  console.log('');
  renderSummary({
    '🔗 Chains': chains.map(c => c.toUpperCase()).join(', '),
    '💰 Total Wallets': formatNumber(totalWallets),
    '⏱️  Time': formatTime(totalTime),
    '⚡ Speed': `${(totalWallets / totalTime).toFixed(0)} wallets/sec`,
    '🔐 HD Mode': hd ? 'Yes' : 'No',
  });

  // Auto-export jika ada --output flag
  if (outputFormat) {
    console.log('');
    const allWallets = Object.values(allResults).flat();
    await autoExport(allWallets, outputFormat, outputFile, password);
  }

  // Save results untuk export command nanti
  return allResults;
}

/**
 * Auto-export ke format yang dipilih
 */
async function autoExport(wallets, format, outputFile, password) {
  const spinner = createSpinner(`Exporting to ${format.toUpperCase()}...`);
  spinner.start();

  try {
    switch (format.toLowerCase()) {
      case 'csv':
        exportToCSV(wallets, outputFile);
        break;
      case 'json':
        exportToJSON(wallets, outputFile);
        break;
      case 'xlsx':
      case 'excel':
        exportToExcel(wallets, outputFile);
        break;
      case 'encrypted':
        if (!password) {
          spinner.fail('Password required for encrypted export');
          logger.info('Usage: --output encrypted --password "your-password"');
          return;
        }
        exportEncrypted(wallets, password, outputFile);
        break;
      default:
        spinner.fail(`Unknown format: ${format}`);
        logger.info('Supported: csv, json, xlsx, encrypted');
        return;
    }
    spinner.succeed(chalk.green(`Exported to ${format.toUpperCase()}`));
  } catch (error) {
    spinner.fail(`Export failed: ${error.message}`);
  }
}
