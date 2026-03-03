/**
 * logger.js — Colored Logging Utility
 * 
 * PENJELASAN:
 * - Chalk adalah library untuk memberi warna pada teks di terminal
 * - Kita buat wrapper supaya log messages konsisten di seluruh app
 * - Setiap level punya warna sendiri:
 *   ✅ success = hijau (operasi berhasil)
 *   ℹ️  info    = cyan (informasi umum)
 *   ⚠️  warn    = kuning (peringatan)
 *   ❌ error   = merah (kesalahan)
 *   🔍 debug   = abu-abu (debugging, hanya tampil jika verbose=true)
 */

import chalk from 'chalk';

// Flag untuk mengontrol apakah debug messages ditampilkan
let verboseMode = false;

/**
 * Aktifkan/nonaktifkan verbose mode
 * @param {boolean} enabled - true untuk menampilkan debug logs
 */
export function setVerbose(enabled) {
  verboseMode = enabled;
}

/**
 * Log pesan sukses (hijau) dengan prefix ✅
 * Digunakan saat operasi berhasil, misal: "10K wallets generated!"
 */
export function success(message) {
  console.log(chalk.green('✅ ' + message));
}

/**
 * Log informasi umum (cyan) dengan prefix ℹ️
 * Digunakan untuk info non-kritis, misal: "Using EVM chain handler"
 */
export function info(message) {
  console.log(chalk.cyan('ℹ️  ' + message));
}

/**
 * Log peringatan (kuning) dengan prefix ⚠️
 * Digunakan saat ada hal yang perlu diperhatikan tapi bukan error
 */
export function warn(message) {
  console.log(chalk.yellow('⚠️  ' + message));
}

/**
 * Log error (merah) dengan prefix ❌
 * Digunakan saat terjadi kesalahan
 */
export function error(message) {
  console.error(chalk.red('❌ ' + message));
}

/**
 * Log debug info (abu-abu) — hanya tampil jika verbose mode aktif
 * Digunakan untuk detail teknis yang biasanya tidak perlu dilihat
 */
export function debug(message) {
  if (verboseMode) {
    console.log(chalk.gray('🔍 ' + message));
  }
}

/**
 * Log dengan format box — untuk banner atau header penting
 * Membuat border di sekitar teks supaya menonjol
 */
export function box(message) {
  const lines = message.split('\n');
  const maxLen = Math.max(...lines.map(l => l.length));
  const border = '═'.repeat(maxLen + 4);
  
  console.log(chalk.magenta(`╔${border}╗`));
  for (const line of lines) {
    const padding = ' '.repeat(maxLen - line.length);
    console.log(chalk.magenta(`║  ${line}${padding}  ║`));
  }
  console.log(chalk.magenta(`╚${border}╝`));
}

/**
 * Log tabel data sederhana (key-value pairs)
 * @param {Object} data - Objek dengan key-value untuk ditampilkan
 */
export function table(data) {
  const maxKeyLen = Math.max(...Object.keys(data).map(k => k.length));
  for (const [key, value] of Object.entries(data)) {
    const padding = ' '.repeat(maxKeyLen - key.length);
    console.log(`  ${chalk.gray(key)}${padding}  ${chalk.white(value)}`);
  }
}

// Export sebagai default object juga, supaya bisa import { info } atau import logger
const logger = { success, info, warn, error, debug, box, table, setVerbose };
export default logger;
