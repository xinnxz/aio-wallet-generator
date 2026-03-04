/**
 * wallet-detail.tsx — Wallet Detail Modal
 *
 * PENJELASAN:
 * Screen detail untuk satu wallet. Menampilkan:
 * - Full address (tap to copy)
 * - Full private key (toggle show/hide)
 * - Mnemonic jika ada
 * - QR code placeholder
 * - Chain badge
 *
 * Diakses via router.push() dari Generate screen.
 */

import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    SafeAreaView, StyleSheet, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, router } from 'expo-router';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';

export default function WalletDetailScreen() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const params = useLocalSearchParams<{
        chain: string; address: string; privateKey: string; mnemonic?: string;
    }>();
    const [showKey, setShowKey] = useState(false);

    const copy = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Copied', `${label} copied to clipboard`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.backBtn, { color: c.accent }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Wallet Detail</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Chain Badge */}
                <View style={[styles.chainBadge, { backgroundColor: c.accentGlow }]}>
                    <Text style={[styles.chainText, { color: c.accent }]}>{params.chain}</Text>
                </View>

                {/* Address */}
                <Text style={[styles.label, { color: c.textDim }]}>ADDRESS</Text>
                <TouchableOpacity
                    onPress={() => copy(params.address || '', 'Address')}
                    style={[styles.valueBox, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                    <Text style={[styles.valueText, { color: c.text }]} selectable>
                        {params.address}
                    </Text>
                    <Text style={[styles.copyHint, { color: c.accent }]}>Tap to copy</Text>
                </TouchableOpacity>

                {/* Private Key */}
                <Text style={[styles.label, { color: c.textDim }]}>PRIVATE KEY</Text>
                <View style={[styles.valueBox, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <TouchableOpacity onPress={() => copy(params.privateKey || '', 'Private Key')}>
                        <Text style={[styles.valueText, { color: c.text }]} selectable>
                            {showKey ? params.privateKey : '••••••••••••••••••••••••••••••••'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setShowKey(!showKey); Haptics.selectionAsync(); }}
                        style={[styles.toggleBtn, { backgroundColor: c.surface2, borderColor: c.border }]}
                    >
                        <Text style={{ color: c.textDim, fontSize: 11, fontWeight: '700' }}>
                            {showKey ? 'HIDE' : 'SHOW'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Warning */}
                <View style={[styles.warningBox, { backgroundColor: c.redGlow, borderColor: c.red }]}>
                    <Text style={[styles.warningText, { color: c.red }]}>
                        ⚠ Never share your private key. Anyone with this key has full access to your funds.
                    </Text>
                </View>

                {/* QR Placeholder */}
                <Text style={[styles.label, { color: c.textDim }]}>QR CODE</Text>
                <View style={[styles.qrBox, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Text style={{ fontSize: 48, opacity: 0.3 }}>▣</Text>
                    <Text style={[styles.qrNote, { color: c.textMuted }]}>QR rendering in Phase M3</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => copy(params.address || '', 'Address')}
                        style={[styles.actionBtn, { backgroundColor: c.accent }]}
                    >
                        <Text style={styles.actionText}>Copy Address</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            const all = `Chain: ${params.chain}\nAddress: ${params.address}\nKey: ${params.privateKey}`;
                            copy(all, 'Wallet info');
                        }}
                        style={[styles.actionBtn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]}
                    >
                        <Text style={[styles.actionText, { color: c.text }]}>Copy All</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
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
    chainBadge: {
        alignSelf: 'flex-start', paddingHorizontal: Spacing.md,
        paddingVertical: 4, borderRadius: Radius.full, marginBottom: Spacing.xl,
    },
    chainText: { fontSize: FontSize.sm, fontWeight: '700' },
    label: {
        fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5,
        marginBottom: Spacing.sm, marginTop: Spacing.lg,
    },
    valueBox: {
        padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1,
    },
    valueText: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
    copyHint: { fontSize: FontSize.xs, fontWeight: '600', marginTop: Spacing.sm },
    toggleBtn: {
        alignSelf: 'flex-start', marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md, paddingVertical: 4,
        borderRadius: Radius.sm, borderWidth: 1,
    },
    warningBox: {
        marginTop: Spacing.lg, padding: Spacing.md,
        borderRadius: Radius.sm, borderWidth: 1,
    },
    warningText: { fontSize: FontSize.xs, fontWeight: '500', lineHeight: 16 },
    qrBox: {
        height: 140, borderRadius: Radius.lg, borderWidth: 1,
        justifyContent: 'center', alignItems: 'center',
    },
    qrNote: { fontSize: FontSize.xs, marginTop: Spacing.sm },
    actions: { marginTop: Spacing.xl, gap: Spacing.sm },
    actionBtn: { paddingVertical: 14, borderRadius: Radius.sm, alignItems: 'center' },
    actionText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
});
