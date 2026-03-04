/**
 * useClipboard.ts — Clipboard Hook with Auto-Clear
 *
 * PENJELASAN:
 * Custom hook untuk clipboard dengan fitur keamanan:
 * - Copy text ke clipboard
 * - Auto-clear setelah 60 detik (private key safety)
 * - Haptic feedback saat copy
 * - Visual feedback state (copied)
 */

import { useState, useCallback, useRef } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

const CLEAR_TIMEOUT = 60000; // 60 seconds

export function useClipboard() {
    const [copied, setCopied] = useState(false);
    const clearTimer = useRef<NodeJS.Timeout | null>(null);

    const copy = useCallback(async (text: string, isSensitive = false) => {
        await Clipboard.setStringAsync(text);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCopied(true);

        // Reset visual feedback
        setTimeout(() => setCopied(false), 1500);

        // Auto-clear sensitive data from clipboard
        if (isSensitive) {
            if (clearTimer.current) clearTimeout(clearTimer.current);
            clearTimer.current = setTimeout(async () => {
                await Clipboard.setStringAsync('');
            }, CLEAR_TIMEOUT);
        }
    }, []);

    const paste = useCallback(async (): Promise<string> => {
        const text = await Clipboard.getStringAsync();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return text;
    }, []);

    return { copy, paste, copied };
}
