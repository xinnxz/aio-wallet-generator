/**
 * share.ts — Native Share & File Export
 *
 * PENJELASAN:
 * Export wallets ke file di device, lalu share via native share sheet.
 * Menggunakan expo-file-system untuk write + expo-sharing untuk share.
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Wallet } from './generator';
import { toCSV, toJSON, toTXT, getFilename } from './export';

/**
 * Export wallets ke file dan share
 */
export async function exportAndShare(
    wallets: Wallet[],
    format: 'csv' | 'json' | 'txt',
    chain: string,
): Promise<void> {
    let content: string;
    let mimeType: string;

    switch (format) {
        case 'csv':
            content = toCSV(wallets);
            mimeType = 'text/csv';
            break;
        case 'json':
            content = toJSON(wallets);
            mimeType = 'application/json';
            break;
        case 'txt':
            content = toTXT(wallets);
            mimeType = 'text/plain';
            break;
        default:
            content = toCSV(wallets);
            mimeType = 'text/csv';
    }

    const filename = getFilename(chain, wallets.length, format);
    const filePath = FileSystem.cacheDirectory + filename;

    // Write file
    await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
    }

    // Share file via native share sheet
    await Sharing.shareAsync(filePath, {
        mimeType,
        dialogTitle: `Export ${wallets.length} wallets`,
        UTI: format === 'csv' ? 'public.comma-separated-values-text' : 'public.plain-text',
    });
}

/**
 * Save file to local documents (tanpa share)
 */
export async function saveToLocal(
    wallets: Wallet[],
    format: 'csv' | 'json' | 'txt',
    chain: string,
): Promise<string> {
    let content: string;

    switch (format) {
        case 'csv': content = toCSV(wallets); break;
        case 'json': content = toJSON(wallets); break;
        case 'txt': content = toTXT(wallets); break;
        default: content = toCSV(wallets);
    }

    const filename = getFilename(chain, wallets.length, format);
    const dir = FileSystem.documentDirectory + 'exports/';

    // Create directory if not exists
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const filePath = dir + filename;
    await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    return filePath;
}
