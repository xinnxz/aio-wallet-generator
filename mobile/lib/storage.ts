/**
 * storage.ts — AsyncStorage Wrapper
 *
 * PENJELASAN:
 * Wrapper untuk AsyncStorage — menyimpan data lokal di device.
 * Dipakai untuk:
 * - Session history (riwayat generate)
 * - User preferences (theme, default chain)
 * - Saved wallets (encrypted di Phase M3)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from './generator';

const KEYS = {
    HISTORY: '@aio_history',
    PREFS: '@aio_prefs',
    SAVED: '@aio_saved',
};

// ── History ──

export interface HistoryEntry {
    id: string;
    chain: string;
    count: number;
    timestamp: number;
    wallets: Wallet[];
}

export async function saveHistory(entry: HistoryEntry): Promise<void> {
    const existing = await getHistory();
    existing.unshift(entry); // newest first
    // Keep last 50 entries
    const trimmed = existing.slice(0, 50);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
}

export async function getHistory(): Promise<HistoryEntry[]> {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
}

export async function clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.HISTORY);
}

// ── Saved Wallets ──

export async function saveSavedWallets(wallets: Wallet[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.SAVED, JSON.stringify(wallets));
}

export async function getSavedWallets(): Promise<Wallet[]> {
    const raw = await AsyncStorage.getItem(KEYS.SAVED);
    return raw ? JSON.parse(raw) : [];
}

// ── Preferences ──

export interface Preferences {
    theme: 'dark' | 'light';
    defaultChain: string;
    defaultCount: number;
}

const DEFAULT_PREFS: Preferences = {
    theme: 'dark',
    defaultChain: 'evm',
    defaultCount: 10,
};

export async function getPrefs(): Promise<Preferences> {
    const raw = await AsyncStorage.getItem(KEYS.PREFS);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
}

export async function savePrefs(prefs: Partial<Preferences>): Promise<void> {
    const existing = await getPrefs();
    await AsyncStorage.setItem(KEYS.PREFS, JSON.stringify({ ...existing, ...prefs }));
}
