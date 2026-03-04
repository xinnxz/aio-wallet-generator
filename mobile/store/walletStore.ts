/**
 * walletStore.ts — Zustand State Management
 *
 * PENJELASAN:
 * Global state management pakai Zustand (ringan, tanpa boilerplate).
 * Menyimpan:
 * - Generated wallets (session saat ini)
 * - Selected chain
 * - Wallet count
 * - Theme preference
 */

import { create } from 'zustand';
import { Wallet } from '../lib/generator';

interface WalletState {
    // Generation
    selectedChain: string;
    walletCount: number;
    generatedWallets: Wallet[];
    isGenerating: boolean;
    progress: number;

    // Saved
    savedWallets: Wallet[];

    // Theme
    theme: 'dark' | 'light';

    // Actions
    setChain: (chain: string) => void;
    setCount: (count: number) => void;
    setGenerating: (v: boolean) => void;
    setProgress: (p: number) => void;
    setWallets: (wallets: Wallet[]) => void;
    addSaved: (wallets: Wallet[]) => void;
    clearGenerated: () => void;
    toggleTheme: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
    selectedChain: 'evm',
    walletCount: 10,
    generatedWallets: [],
    isGenerating: false,
    progress: 0,
    savedWallets: [],
    theme: 'dark',

    setChain: (chain) => set({ selectedChain: chain }),
    setCount: (count) => set({ walletCount: count }),
    setGenerating: (v) => set({ isGenerating: v }),
    setProgress: (p) => set({ progress: p }),
    setWallets: (wallets) => set({ generatedWallets: wallets }),
    addSaved: (wallets) => set((s) => ({
        savedWallets: [...s.savedWallets, ...wallets],
    })),
    clearGenerated: () => set({ generatedWallets: [], progress: 0 }),
    toggleTheme: () => set((s) => ({
        theme: s.theme === 'dark' ? 'light' : 'dark',
    })),
}));
