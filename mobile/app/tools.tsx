/**
 * tools.tsx — Tools Screen (Convert + Encrypt)
 *
 * PENJELASAN:
 * Gabungan 2 fitur: Convert address format + Encrypt/decrypt.
 * Menggunakan segmented control di atas untuk switch antara 2 mode.
 */

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';

export default function ToolsScreen() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const [tab, setTab] = useState<'convert' | 'encrypt'>('convert');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: c.text }]}>Tools</Text>

                {/* Segmented Control */}
                <View style={[styles.segment, { backgroundColor: c.surface, borderColor: c.border }]}>
                    {(['convert', 'encrypt'] as const).map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
                            style={[styles.segItem, tab === t && { backgroundColor: c.accent }]}
                        >
                            <Text style={[styles.segText, { color: tab === t ? '#fff' : c.textDim }]}>
                                {t === 'convert' ? 'Convert' : 'Encrypt'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {tab === 'convert' ? <ConvertTool c={c} /> : <EncryptTool c={c} />}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Convert ──
function ConvertTool({ c }: { c: any }) {
    const [address, setAddress] = useState('');
    const [results, setResults] = useState<Record<string, string> | null>(null);

    const convert = () => {
        if (!address.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const a = address.trim();

        // EVM address
        if (/^0x[0-9a-fA-F]{40}$/i.test(a)) {
            setResults({
                'Lowercase': a.toLowerCase(),
                'Uppercase': a.toUpperCase(),
                'Raw Hex': a.slice(2).toLowerCase(),
                'Bytes': `${a.slice(2).length / 2} bytes (160-bit)`,
            });
        } else {
            setResults({
                'Length': `${a.length} characters`,
                'Lowercase': a.toLowerCase(),
                'Uppercase': a.toUpperCase(),
            });
        }
    };

    const copyResult = async (text: string) => {
        await Clipboard.setStringAsync(text);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <View style={styles.toolSection}>
            <Text style={[styles.label, { color: c.textDim }]}>ADDRESS</Text>
            <TextInput
                style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                placeholder="0x... or any address"
                placeholderTextColor={c.textMuted}
                value={address}
                onChangeText={setAddress}
                autoCapitalize="none"
            />
            <TouchableOpacity
                onPress={convert}
                style={[styles.btn, { backgroundColor: c.accent }]}
            >
                <Text style={styles.btnText}>Convert</Text>
            </TouchableOpacity>

            {results && Object.entries(results).map(([label, value]) => (
                <TouchableOpacity
                    key={label}
                    onPress={() => copyResult(value)}
                    style={[styles.resultRow, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                    <Text style={[styles.resultLabel, { color: c.accent }]}>{label}</Text>
                    <Text style={[styles.resultValue, { color: c.textDim }]} numberOfLines={1}>{value}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ── Encrypt ──
function EncryptTool({ c }: { c: any }) {
    const [text, setText] = useState('');
    const [password, setPassword] = useState('');
    const [output, setOutput] = useState('');

    const encrypt = () => {
        if (!text.trim() || !password.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Demo: Base64 encode (real AES-256-GCM in Phase M2)
        const encoded = typeof btoa !== 'undefined' ? btoa(text) : Buffer.from(text).toString('base64');
        setOutput(`encrypted:${encoded}`);
    };

    const decrypt = () => {
        if (!output.startsWith('encrypted:') || !password.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const base64 = output.replace('encrypted:', '');
        const decoded = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString();
        setText(decoded);
        setOutput('');
    };

    return (
        <View style={styles.toolSection}>
            <Text style={[styles.label, { color: c.textDim }]}>DATA</Text>
            <TextInput
                style={[styles.textarea, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                placeholder="Paste wallet data..."
                placeholderTextColor={c.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Text style={[styles.label, { color: c.textDim }]}>PASSWORD</Text>
            <TextInput
                style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                placeholder="Strong password..."
                placeholderTextColor={c.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.row}>
                <TouchableOpacity onPress={encrypt} style={[styles.halfBtn, { backgroundColor: c.accent }]}>
                    <Text style={styles.btnText}>Encrypt</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={decrypt} style={[styles.halfBtn, { backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border }]}>
                    <Text style={[styles.btnText, { color: c.text }]}>Decrypt</Text>
                </TouchableOpacity>
            </View>

            {output ? (
                <View style={[styles.outputBox, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Text style={[styles.outputText, { color: c.textDim }]}>{output}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
    title: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.lg },
    segment: {
        flexDirection: 'row', borderRadius: Radius.sm, borderWidth: 1,
        marginBottom: Spacing.xl, overflow: 'hidden',
    },
    segItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    segText: { fontSize: FontSize.sm, fontWeight: '700' },
    toolSection: { marginTop: Spacing.sm },
    label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.md },
    input: {
        padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1,
        fontSize: FontSize.sm, fontFamily: 'monospace',
    },
    textarea: {
        padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1,
        fontSize: FontSize.sm, fontFamily: 'monospace', minHeight: 80,
    },
    btn: { marginTop: Spacing.md, paddingVertical: 12, borderRadius: Radius.sm, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
    resultRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1, marginTop: Spacing.sm,
    },
    resultLabel: { fontSize: FontSize.xs, fontWeight: '700', width: 70 },
    resultValue: { flex: 1, fontSize: 11, fontFamily: 'monospace' },
    row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
    halfBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.sm, alignItems: 'center' },
    outputBox: {
        marginTop: Spacing.md, padding: Spacing.md,
        borderRadius: Radius.sm, borderWidth: 1,
    },
    outputText: { fontSize: 10, fontFamily: 'monospace' },
});
