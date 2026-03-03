/**
 * ui.js — CLI UI Rendering (Progress, Tables, Banner)
 * 
 * PENJELASAN:
 * ==========
 * File ini handle semua tampilan visual di terminal:
 * - ASCII art banner saat startup
 * - Progress bar / spinner saat generate wallet
 * - Tabel hasil generate
 * - Colored messages
 * 
 * Library yang dipakai:
 * - ora: animated spinner (loading indicator)
 * - cli-table3: render tabel di terminal
 * - chalk: warnai teks
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';

/**
 * ASCII Art Banner — tampil saat pertama kali run CLI
 * Menggunakan gradient warna untuk efek premium
 */
export function showBanner() {
  const banner = `
${chalk.hex('#8B5CF6')('╔════════════════════════════════════════════════════════════╗')}
${chalk.hex('#8B5CF6')('║')}                                                            ${chalk.hex('#8B5CF6')('║')}
${chalk.hex('#A78BFA')('║')}   ${chalk.bold.hex('#06B6D4')('██╗    ██╗')}${chalk.bold.hex('#22D3EE')('███████╗')}${chalk.bold.hex('#67E8F9')('██████╗ ')}${chalk.bold.hex('#06B6D4')('██████╗ ')}                    ${chalk.hex('#A78BFA')('║')}
${chalk.hex('#A78BFA')('║')}   ${chalk.bold.hex('#06B6D4')('██║    ██║')}${chalk.bold.hex('#22D3EE')('██╔════╝')}${chalk.bold.hex('#67E8F9')('██╔══██╗')}${chalk.bold.hex('#06B6D4')('╚════██╗')}                    ${chalk.hex('#A78BFA')('║')}
${chalk.hex('#C4B5FD')('║')}   ${chalk.bold.hex('#06B6D4')('██║ █╗ ██║')}${chalk.bold.hex('#22D3EE')('█████╗  ')}${chalk.bold.hex('#67E8F9')('██████╔╝')}${chalk.bold.hex('#06B6D4')(' █████╔╝')}                    ${chalk.hex('#C4B5FD')('║')}
${chalk.hex('#C4B5FD')('║')}   ${chalk.bold.hex('#06B6D4')('██║███╗██║')}${chalk.bold.hex('#22D3EE')('██╔══╝  ')}${chalk.bold.hex('#67E8F9')('██╔══██╗')}${chalk.bold.hex('#06B6D4')(' ╚═══██╗')}                    ${chalk.hex('#C4B5FD')('║')}
${chalk.hex('#DDD6FE')('║')}   ${chalk.bold.hex('#06B6D4')('╚███╔███╔╝')}${chalk.bold.hex('#22D3EE')('███████╗')}${chalk.bold.hex('#67E8F9')('██████╔╝')}${chalk.bold.hex('#06B6D4')('██████╔╝')}                    ${chalk.hex('#DDD6FE')('║')}
${chalk.hex('#DDD6FE')('║')}   ${chalk.bold.hex('#06B6D4')(' ╚══╝╚══╝ ')}${chalk.bold.hex('#22D3EE')('╚══════╝')}${chalk.bold.hex('#67E8F9')('╚═════╝ ')}${chalk.bold.hex('#06B6D4')('╚═════╝ ')}                    ${chalk.hex('#DDD6FE')('║')}
${chalk.hex('#EDE9FE')('║')}                                                            ${chalk.hex('#EDE9FE')('║')}
${chalk.hex('#EDE9FE')('║')}   ${chalk.hex('#10B981')('🔐 Wallet Generator Toolkit')}                               ${chalk.hex('#EDE9FE')('║')}
${chalk.hex('#F5F3FF')('║')}   ${chalk.gray('Generate • Manage • Export • 30+ Chains')}                   ${chalk.hex('#F5F3FF')('║')}
${chalk.hex('#F5F3FF')('║')}                                                            ${chalk.hex('#F5F3FF')('║')}
${chalk.hex('#8B5CF6')('╚════════════════════════════════════════════════════════════╝')}
`;
  console.log(banner);
}

/**
 * Buat spinner (loading indicator)
 * Spinner berputar saat wallet sedang di-generate
 * 
 * @param {string} text - Teks yang ditampilkan di samping spinner
 * @returns {Object} Ora spinner object (call .stop() untuk berhenti)
 */
export function createSpinner(text) {
  return ora({
    text: chalk.cyan(text),
    spinner: 'dots12',    // Animasi dots — terlihat modern
    color: 'cyan',
  });
}

/**
 * Update spinner text (saat progress berubah)
 */
export function updateSpinner(spinner, text) {
  spinner.text = chalk.cyan(text);
}

/**
 * Render tabel wallet results di terminal
 * 
 * @param {Array<Object>} wallets - Array wallet objects
 * @param {Object} options - Opsi tampilan
 * @param {boolean} options.showPrivateKey - Tampilkan private key? (default: false)
 * @param {number} options.maxRows - Maks baris yang ditampilkan (default: 20)
 */
export function renderWalletTable(wallets, options = {}) {
  const {
    showPrivateKey = false,
    maxRows = 20,
  } = options;

  // Header kolom
  const headers = [
    chalk.hex('#8B5CF6').bold('#'),
    chalk.hex('#06B6D4').bold('Chain'),
    chalk.hex('#10B981').bold('Address'),
  ];
  if (showPrivateKey) {
    headers.push(chalk.hex('#F59E0B').bold('Private Key'));
  }

  // Buat tabel
  const table = new Table({
    head: headers,
    style: {
      head: [],     // No default colors (kita pakai chalk)
      border: [],
    },
    chars: {
      'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
      'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
      'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
      'right': '║', 'right-mid': '╢', 'middle': '│',
    },
  });

  // Tambah data (batasi maxRows)
  const displayWallets = wallets.slice(0, maxRows);
  for (const wallet of displayWallets) {
    const row = [
      chalk.gray(wallet.index || ''),
      chalk.hex('#06B6D4')(wallet.chain?.toUpperCase() || ''),
      truncateAddress(wallet.address),
    ];
    if (showPrivateKey) {
      row.push(chalk.hex('#F59E0B')(truncate(wallet.privateKey, 20) + '...'));
    }
    table.push(row);
  }

  // Warning jika ada wallet yang tidak ditampilkan
  if (wallets.length > maxRows) {
    table.push([
      chalk.gray('...'),
      chalk.gray('...'),
      chalk.gray(`+${wallets.length - maxRows} more wallets (use export to see all)`),
      ...(showPrivateKey ? [chalk.gray('...')] : []),
    ]);
  }

  console.log(table.toString());
}

/**
 * Render tabel ringkasan (summary) setelah generate
 */
export function renderSummary(data) {
  const table = new Table({
    style: { head: [], border: [] },
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│',
    },
  });

  for (const [key, value] of Object.entries(data)) {
    table.push([chalk.hex('#8B5CF6')(key), chalk.white(String(value))]);
  }

  console.log(table.toString());
}

/**
 * Render chain info table
 */
export function renderChainInfo(chainInfos) {
  const table = new Table({
    head: [
      chalk.hex('#8B5CF6').bold('Chain'),
      chalk.hex('#06B6D4').bold('Curve'),
      chalk.hex('#10B981').bold('Address Format'),
    ],
    style: { head: [], border: [] },
    chars: {
      'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
      'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
      'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
      'right': '║', 'right-mid': '╢', 'middle': '│',
    },
  });

  for (const [name, info] of Object.entries(chainInfos)) {
    table.push([
      chalk.hex('#06B6D4').bold(info.name || name),
      chalk.gray(info.curve || 'N/A'),
      chalk.white(info.addressFormat || 'N/A'),
    ]);
  }

  console.log(table.toString());
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Truncate address untuk tampilan (awal...akhir)
 * Contoh: 0x742d35Cc6634...7DivfNa
 */
function truncateAddress(address) {
  if (!address || address.length <= 20) return chalk.hex('#10B981')(address || '');
  return chalk.hex('#10B981')(address.slice(0, 10) + '...' + address.slice(-8));
}

/**
 * Truncate string ke panjang tertentu
 */
function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen);
}

/**
 * Format angka dengan comma separator (1000 → 1,000)
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format waktu (detik → menit:detik)
 */
export function formatTime(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}m ${secs}s`;
}
