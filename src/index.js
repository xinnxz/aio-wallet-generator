#!/usr/bin/env node

/**
 * index.js — Main CLI Entry Point
 * 
 * PENJELASAN:
 * ==========
 * File ini adalah entry point utama untuk CLI tool.
 * 
 * #!/usr/bin/env node (baris pertama):
 * - Ini disebut "shebang line"
 * - Memberitahu OS untuk menjalankan file ini dengan Node.js
 * - Diperlukan supaya bisa dijalankan langsung: `web3-wallet generate ...`
 *   (tanpa perlu ketik `node src/index.js generate ...`)
 * 
 * Commander.js:
 * - Library standar untuk membuat CLI di Node.js
 * - Handle parsing arguments, options, help text
 * - Auto-generate --help message
 * 
 * COMMANDS:
 * 1. generate — Generate wallet (inti dari tool ini)
 * 2. export   — Export wallet data ke file
 * 3. info     — Tampilkan info chain yang didukung
 * 4. decrypt  — Decrypt file .encrypted
 */

import { Command } from 'commander';
import { showBanner } from './cli/ui.js';
import { handleGenerate } from './cli/commands/generate.js';
import { handleExport } from './cli/commands/export.js';
import { handleInfo } from './cli/commands/info.js';
import { handleDecrypt } from './cli/commands/decrypt.js';
import { setVerbose } from './utils/logger.js';

// Buat program CLI
const program = new Command();

// Metadata program
program
  .name('web3-wallet')
  .description('🔐 All-in-One Web3 Wallet Generator — Generate, manage & export wallets across 30+ chains')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose/debug output');

// ============================================================
// COMMAND: generate
// Generate wallet baru untuk chain tertentu
// ============================================================
program
  .command('generate')
  .description('Generate new wallets for specified chain(s)')
  .option('-c, --chain <chains>', 'Chain name(s), comma-separated (evm,solana,bitcoin,tron,sui,aptos,cosmos,ton,starknet,all)', 'evm')
  .option('-n, --count <number>', 'Number of wallets to generate', '10')
  .option('--hd', 'Use HD wallet mode (derive from single mnemonic)')
  .option('-o, --output <format>', 'Auto-export format (csv/json/xlsx/encrypted)')
  .option('-f, --file <path>', 'Output file path')
  .option('-p, --password <password>', 'Password for encrypted export')
  .option('--show-keys', 'Show private keys in terminal preview')
  .action(async (options) => {
    showBanner();
    
    // Set verbose mode from parent options
    if (program.opts().verbose) setVerbose(true);

    await handleGenerate(options);
  });

// ============================================================
// COMMAND: export
// Export wallet data yang sudah ada ke format file
// ============================================================
program
  .command('export')
  .description('Export wallet data to file (csv/json/xlsx/encrypted)')
  .option('-f, --format <format>', 'Export format: csv, json, xlsx, encrypted', 'json')
  .option('-o, --file <path>', 'Output file path')
  .option('-i, --input <path>', 'Input wallet JSON file')
  .option('-p, --password <password>', 'Password for encrypted export')
  .action(async (options) => {
    showBanner();
    if (program.opts().verbose) setVerbose(true);
    await handleExport(options);
  });

// ============================================================
// COMMAND: info
// Tampilkan informasi chain yang didukung
// ============================================================
program
  .command('info')
  .description('Show supported chains and their details')
  .option('-c, --chain <chain>', 'Show details for specific chain')
  .action(async (options) => {
    showBanner();
    await handleInfo(options);
  });

// ============================================================
// COMMAND: decrypt
// Decrypt file .encrypted
// ============================================================
program
  .command('decrypt')
  .description('Decrypt an .encrypted wallet file')
  .requiredOption('-f, --file <path>', 'Path to .encrypted file')
  .requiredOption('-p, --password <password>', 'Decryption password')
  .option('-o, --output <format>', 'Re-export format after decryption (csv/json/xlsx)')
  .option('--output-file <path>', 'Output file path for re-export')
  .action(async (options) => {
    showBanner();
    if (program.opts().verbose) setVerbose(true);
    await handleDecrypt(options);
  });

// ============================================================
// Parse arguments dan jalankan
// ============================================================

// Jika tidak ada command, tampilkan help
if (process.argv.length <= 2) {
  showBanner();
  program.help();
}

program.parse(process.argv);
