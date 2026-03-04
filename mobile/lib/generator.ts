/**
 * generator.ts — Wallet Generator (Demo Mode)
 *
 * PENJELASAN:
 * Di React Native, crypto libraries seperti ethers.js butuh polyfill.
 * Untuk Phase M1, kita pakai demo mode (random hex) supaya UI bisa
 * dibangun dan ditest dulu. Phase M2 akan integrate real crypto libs.
 *
 * Demo mode menghasilkan address dan key format yang VALID secara visual
 * tapi BUKAN real wallet (jangan dipakai untuk menyimpan dana).
 */

export interface Wallet {
    chain: string;
    address: string;
    privateKey: string;
    mnemonic?: string;
    createdAt: number;
}

/**
 * Generate random hex string
 */
function randomHex(bytes: number): string {
    const arr = new Uint8Array(bytes);
    for (let i = 0; i < bytes; i++) {
        arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate random Base58 string
 */
function randomBase58(length: number): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate a demo wallet for the specified chain
 *
 * @param chainId - Chain identifier (evm, solana, bitcoin, etc.)
 * @returns Wallet object with address and private key
 */
export async function generateWallet(chainId: string): Promise<Wallet> {
    const now = Date.now();

    switch (chainId) {
        case 'evm':
            return {
                chain: 'EVM',
                address: '0x' + randomHex(20),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };

        case 'solana':
            return {
                chain: 'Solana',
                address: randomBase58(44),
                privateKey: randomBase58(88),
                createdAt: now,
            };

        case 'bitcoin':
            return {
                chain: 'Bitcoin',
                address: 'bc1q' + randomHex(20),
                privateKey: randomBase58(52),
                createdAt: now,
            };

        case 'tron':
            return {
                chain: 'Tron',
                address: 'T' + randomBase58(33),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };

        case 'sui':
            return {
                chain: 'Sui',
                address: '0x' + randomHex(32),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };

        case 'aptos':
            return {
                chain: 'Aptos',
                address: '0x' + randomHex(32),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };

        case 'cosmos':
            return {
                chain: 'Cosmos',
                address: 'cosmos1' + randomHex(20),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };

        case 'ton':
            return {
                chain: 'TON',
                address: 'EQ' + randomBase58(46),
                privateKey: randomHex(32),
                createdAt: now,
            };

        case 'starknet':
            return {
                chain: 'Starknet',
                address: '0x0' + randomHex(31),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };

        default:
            return {
                chain: chainId.toUpperCase(),
                address: '0x' + randomHex(20),
                privateKey: '0x' + randomHex(32),
                createdAt: now,
            };
    }
}

/**
 * Bulk generate wallets with progress callback
 */
export async function generateBulk(
    chainId: string,
    count: number,
    onProgress?: (current: number, total: number) => void,
): Promise<Wallet[]> {
    const wallets: Wallet[] = [];

    for (let i = 0; i < count; i++) {
        const wallet = await generateWallet(chainId);
        wallets.push(wallet);

        if (onProgress && i % 10 === 0) {
            onProgress(i + 1, count);
            // Yield to UI thread
            await new Promise(r => setTimeout(r, 0));
        }
    }

    if (onProgress) onProgress(count, count);
    return wallets;
}
