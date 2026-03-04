/**
 * useHistory.ts — History Hook
 *
 * PENJELASAN:
 * Custom hook untuk manage session history.
 * Auto-load dari AsyncStorage saat pertama render.
 * Simpan setiap kali generate wallets.
 */

import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry, getHistory, saveHistory, clearHistory } from '../lib/storage';

export function useHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Load history on mount
    useEffect(() => {
        getHistory().then(h => {
            setHistory(h);
            setLoading(false);
        });
    }, []);

    // Add new entry
    const addEntry = useCallback(async (entry: HistoryEntry) => {
        await saveHistory(entry);
        setHistory(prev => [entry, ...prev].slice(0, 50));
    }, []);

    // Clear all
    const clear = useCallback(async () => {
        await clearHistory();
        setHistory([]);
    }, []);

    return { history, loading, addEntry, clear };
}
