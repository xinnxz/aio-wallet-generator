/**
 * export.ts — Export Utilities
 *
 * PENJELASAN:
 * Fungsi untuk export wallets ke berbagai format:
 * - CSV (comma-separated)
 * - JSON (pretty-printed)
 * - TXT (plain text list)
 *
 * Di mobile, export hasil bisa di-share via native share sheet
 * menggunakan expo-sharing + expo-file-system.
 */

import { Wallet } from './generator';

/**
 * Export wallets ke CSV string
 */
export function toCSV(wallets: Wallet[]): string {
    const header = 'No,Chain,Address,PrivateKey,CreatedAt\n';
    const rows = wallets.map((w, i) =>
        `${i + 1},${w.chain},${w.address},${w.privateKey},${new Date(w.createdAt).toISOString()}`
    ).join('\n');
    return header + rows;
}

/**
 * Export wallets ke JSON string (pretty)
 */
export function toJSON(wallets: Wallet[]): string {
    return JSON.stringify(wallets.map((w, i) => ({
        index: i + 1,
        chain: w.chain,
        address: w.address,
        privateKey: w.privateKey,
        createdAt: new Date(w.createdAt).toISOString(),
    })), null, 2);
}

/**
 * Export wallets ke plain text
 */
export function toTXT(wallets: Wallet[]): string {
    return wallets.map((w, i) =>
        `#${i + 1} [${w.chain}]\nAddress: ${w.address}\nKey: ${w.privateKey}\n`
    ).join('\n');
}

/**
 * Get formatted filename
 */
export function getFilename(chain: string, count: number, format: string): string {
    const date = new Date().toISOString().slice(0, 10);
    return `aio-chain_${chain}_${count}_${date}.${format}`;
}
