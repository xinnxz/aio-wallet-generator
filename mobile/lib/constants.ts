/**
 * constants.ts — Chain Registry
 *
 * PENJELASAN:
 * Data semua 9 chain yang didukung. Dipakai oleh:
 * - Chain selector chips di Generate screen
 * - Address validation regex
 * - Wallet generation
 */

export interface Chain {
    id: string;
    name: string;
    symbol: string;
    color: string;
    addressRegex: RegExp;
    keyType: string;
}

export const CHAINS: Chain[] = [
    {
        id: 'evm',
        name: 'EVM',
        symbol: 'ETH',
        color: '#627eea',
        addressRegex: /^0x[0-9a-fA-F]{40}$/,
        keyType: 'secp256k1',
    },
    {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        color: '#14f195',
        addressRegex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
        keyType: 'Ed25519',
    },
    {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        color: '#f7931a',
        addressRegex: /^(bc1|1|3)[a-zA-HJ-NP-Z0-9]{25,62}$/,
        keyType: 'secp256k1',
    },
    {
        id: 'tron',
        name: 'Tron',
        symbol: 'TRX',
        color: '#ff0013',
        addressRegex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
        keyType: 'secp256k1',
    },
    {
        id: 'sui',
        name: 'Sui',
        symbol: 'SUI',
        color: '#6fbcf0',
        addressRegex: /^0x[0-9a-fA-F]{64}$/,
        keyType: 'Ed25519',
    },
    {
        id: 'aptos',
        name: 'Aptos',
        symbol: 'APT',
        color: '#2dd8a7',
        addressRegex: /^0x[0-9a-fA-F]{64}$/,
        keyType: 'Ed25519',
    },
    {
        id: 'cosmos',
        name: 'Cosmos',
        symbol: 'ATOM',
        color: '#2e3148',
        addressRegex: /^cosmos[a-z0-9]{38,45}$/,
        keyType: 'secp256k1',
    },
    {
        id: 'ton',
        name: 'TON',
        symbol: 'TON',
        color: '#0098ea',
        addressRegex: /^(EQ|UQ)[A-Za-z0-9_-]{46}$/,
        keyType: 'Ed25519',
    },
    {
        id: 'starknet',
        name: 'Starknet',
        symbol: 'STRK',
        color: '#ec796b',
        addressRegex: /^0x0[0-9a-fA-F]{63}$/,
        keyType: 'STARK',
    },
];

export function detectChain(address: string): Chain | null {
    return CHAINS.find(c => c.addressRegex.test(address.trim())) || null;
}

export function getChain(id: string): Chain | undefined {
    return CHAINS.find(c => c.id === id);
}
