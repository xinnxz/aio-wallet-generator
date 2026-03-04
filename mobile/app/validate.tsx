/**
 * validate.tsx — Validate Screen
 *
 * PENJELASAN:
 * Screen untuk memvalidasi alamat crypto.
 * User bisa paste address atau scan QR (Phase M3).
 * Auto-detect chain dari format address.
 */

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, StyleSheet, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import { detectChain } from '../lib/constants';

export default function ValidateScreen() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const [address, setAddress] = useState('');
    const [result, setResult] = useState<{ valid: boolean; chain?: string } | null>(null);
    const [batchText, setBatchText] = useState('');
    const [batchResults, setBatchResults] = useState<Array<{ addr: string; chain: string | null }>>([]);

    const validate = () => {
        if (!address.trim()) { Alert.alert('Error', 'Paste an address first'); return; }
        const chain = detectChain(address.trim());
        setResult(chain ? { valid: true, chain: chain.name } : { valid: false });
        Haptics.notificationAsync(
            chain ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
        );
    };

    const pasteFromClipboard = async () => {
        const text = await Clipboard.getStringAsync();
        setAddress(text);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const batchValidate = () => {
        const lines = batchText.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) { Alert.alert('Error', 'Paste addresses (one per line)'); return; }
        const results = lines.map(addr => ({
            addr,
            chain: detectChain(addr)?.name || null,
        }));
        setBatchResults(results);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: c.text }]}>Validate Address</Text>

                {/* Single Validate */}
                <Text style={[styles.label, { color: c.textDim }]}>ADDRESS</Text>
                <View style={[styles.inputRow, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <TextInput
                        style={[styles.input, { color: c.text }]}
                        placeholder="Paste any crypto address..."
                        placeholderTextColor={c.textMuted}
                        value={address}
                        onChangeText={setAddress}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={pasteFromClipboard} style={styles.pasteBtn}>
                        <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700' }}>PASTE</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={validate}
                    style={[styles.btn, { backgroundColor: c.accent }]}
                >
                    <Text style={styles.btnText}>Validate</Text>
                </TouchableOpacity>

                {/* Result */}
                {result && (
                    <View style={[styles.resultCard, {
                        backgroundColor: result.valid ? c.greenGlow : c.redGlow,
                        borderColor: result.valid ? c.green : c.red,
                    }]}>
                        <Text style={[styles.resultIcon, { color: result.valid ? c.green : c.red }]}>
                            {result.valid ? '✓ Valid' : '✗ Invalid'}
                        </Text>
                        {result.chain && (
                            <View style={[styles.badge, { backgroundColor: c.surface, borderColor: c.border }]}>
                                <Text style={[styles.badgeText, { color: c.accent }]}>{result.chain}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Batch Validate */}
                <Text style={[styles.label, { color: c.textDim, marginTop: Spacing.xxl }]}>BATCH VALIDATE</Text>
                <TextInput
                    style={[styles.textarea, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                    placeholder="One address per line..."
                    placeholderTextColor={c.textMuted}
                    value={batchText}
                    onChangeText={setBatchText}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    onPress={batchValidate}
                    style={[styles.btn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]}
                >
                    <Text style={[styles.btnText, { color: c.text }]}>Validate All</Text>
                </TouchableOpacity>

                {/* Batch Results */}
                {batchResults.length > 0 && (
                    <View style={styles.batchResults}>
                        <Text style={[styles.batchSummary, { color: c.textDim }]}>
                            {batchResults.filter(r => r.chain).length}/{batchResults.length} valid
                        </Text>
                        {batchResults.map((r, i) => (
                            <View key={i} style={[styles.batchRow, {
                                backgroundColor: r.chain ? c.greenGlow : c.redGlow,
                            }]}>
                                <Text style={[styles.batchChain, { color: r.chain ? c.green : c.red }]}>
                                    {r.chain || 'INVALID'}
                                </Text>
                                <Text style={[styles.batchAddr, { color: c.textDim }]} numberOfLines={1}>
                                    {r.addr}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
    title: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.lg },
    label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: Radius.sm, borderWidth: 1, paddingRight: Spacing.sm,
    },
    input: { flex: 1, padding: Spacing.md, fontSize: FontSize.sm, fontFamily: 'monospace' },
    pasteBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
    btn: {
        marginTop: Spacing.md, paddingVertical: 12,
        borderRadius: Radius.sm, alignItems: 'center',
    },
    btnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
    resultCard: {
        marginTop: Spacing.md, padding: Spacing.lg,
        borderRadius: Radius.md, borderWidth: 1,
    },
    resultIcon: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
    badge: {
        alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2,
        borderRadius: Radius.full, borderWidth: 1, marginTop: Spacing.sm,
    },
    badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
    textarea: {
        borderRadius: Radius.sm, borderWidth: 1, padding: Spacing.md,
        fontSize: FontSize.sm, fontFamily: 'monospace', minHeight: 100,
    },
    batchResults: { marginTop: Spacing.md },
    batchSummary: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
    batchRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.sm, borderRadius: 4, marginBottom: 3,
    },
    batchChain: { fontSize: FontSize.xs, fontWeight: '700', width: 60 },
    batchAddr: { flex: 1, fontSize: 10, fontFamily: 'monospace' },
});
