/**
 * export-modal.tsx — Export Modal Screen
 *
 * PENJELASAN:
 * Modal screen untuk export wallets ke berbagai format.
 * User bisa pilih format (CSV, JSON, TXT) dan share via native share sheet.
 */

import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    SafeAreaView, StyleSheet, Alert, Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import { toCSV, toJSON, toTXT } from '../lib/export';

const FORMATS = [
    { id: 'csv', name: 'CSV', desc: 'Spreadsheet-compatible, opens in Excel' },
    { id: 'json', name: 'JSON', desc: 'Structured data, developer-friendly' },
    { id: 'txt', name: 'TXT', desc: 'Plain text, human-readable' },
];

export default function ExportModal() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const wallets = useWalletStore(s => s.generatedWallets);
    const [selected, setSelected] = useState('csv');

    const handleExport = async () => {
        if (!wallets.length) {
            Alert.alert('No wallets', 'Generate wallets first');
            return;
        }

        let content: string;
        switch (selected) {
            case 'csv': content = toCSV(wallets); break;
            case 'json': content = toJSON(wallets); break;
            case 'txt': content = toTXT(wallets); break;
            default: content = toCSV(wallets);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            await Share.share({
                message: content,
                title: `AIO Chain - ${wallets.length} wallets (${selected.toUpperCase()})`,
            });
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.backBtn, { color: c.accent }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Export</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={[styles.subtitle, { color: c.textDim }]}>
                    {wallets.length} wallets ready to export
                </Text>

                {/* Format Selector */}
                <Text style={[styles.label, { color: c.textDim }]}>FORMAT</Text>
                {FORMATS.map(f => (
                    <TouchableOpacity
                        key={f.id}
                        onPress={() => { setSelected(f.id); Haptics.selectionAsync(); }}
                        style={[styles.formatCard, {
                            backgroundColor: selected === f.id ? c.accentGlow : c.surface,
                            borderColor: selected === f.id ? c.accent : c.border,
                        }]}
                    >
                        <View style={styles.formatLeft}>
                            <Text style={[styles.formatName, { color: selected === f.id ? c.accent : c.text }]}>
                                {f.name}
                            </Text>
                            <Text style={[styles.formatDesc, { color: c.textMuted }]}>{f.desc}</Text>
                        </View>
                        <View style={[styles.radio, {
                            borderColor: selected === f.id ? c.accent : c.border,
                            backgroundColor: selected === f.id ? c.accent : 'transparent',
                        }]}>
                            {selected === f.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Export Button */}
                <TouchableOpacity
                    onPress={handleExport}
                    style={[styles.exportBtn, { backgroundColor: c.accent }]}
                >
                    <Text style={styles.exportText}>
                        Export as {selected.toUpperCase()} & Share
                    </Text>
                </TouchableOpacity>

                {/* Security Note */}
                <View style={[styles.note, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Text style={[styles.noteText, { color: c.textMuted }]}>
                        ⚠ Exported files contain private keys. Store securely and never share publicly.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1,
    },
    backBtn: { fontSize: FontSize.sm, fontWeight: '600' },
    headerTitle: { fontSize: FontSize.md, fontWeight: '700' },
    content: { padding: Spacing.lg },
    subtitle: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xl },
    label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm },
    formatCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm,
    },
    formatLeft: {},
    formatName: { fontSize: FontSize.md, fontWeight: '700' },
    formatDesc: { fontSize: FontSize.xs, marginTop: 2 },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        justifyContent: 'center', alignItems: 'center',
    },
    radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
    exportBtn: {
        marginTop: Spacing.xl, paddingVertical: 16,
        borderRadius: Radius.md, alignItems: 'center',
    },
    exportText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
    note: {
        marginTop: Spacing.lg, padding: Spacing.md,
        borderRadius: Radius.sm, borderWidth: 1,
    },
    noteText: { fontSize: FontSize.xs, lineHeight: 16 },
});
