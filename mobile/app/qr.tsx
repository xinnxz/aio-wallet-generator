/**
 * qr.tsx — QR Code Screen
 *
 * PENJELASAN:
 * Screen untuk QR code generate + scan.
 * Phase M1: Generate QR dari address.
 * Phase M3: Camera QR scan (butuh expo-camera).
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

export default function QRScreen() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const [address, setAddress] = useState('');
    const [showQR, setShowQR] = useState(false);

    const generateQR = () => {
        if (!address.trim()) return;
        setShowQR(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const pasteAddr = async () => {
        const text = await Clipboard.getStringAsync();
        setAddress(text);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: c.text }]}>QR Code</Text>

                {/* Scanner placeholder */}
                <TouchableOpacity style={[styles.scannerBox, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Text style={{ fontSize: 40, opacity: 0.3 }}>📷</Text>
                    <Text style={[styles.scannerLabel, { color: c.textMuted }]}>Camera Scanner</Text>
                    <Text style={[styles.scannerSub, { color: c.textMuted }]}>Coming in Phase M3</Text>
                </TouchableOpacity>

                {/* Generate QR */}
                <Text style={[styles.label, { color: c.textDim }]}>GENERATE QR</Text>
                <View style={[styles.inputRow, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <TextInput
                        style={[styles.input, { color: c.text }]}
                        placeholder="Enter address..."
                        placeholderTextColor={c.textMuted}
                        value={address}
                        onChangeText={setAddress}
                    />
                    <TouchableOpacity onPress={pasteAddr}>
                        <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700' }}>PASTE</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={generateQR}
                    style={[styles.btn, { backgroundColor: c.accent }]}
                >
                    <Text style={styles.btnText}>Generate QR</Text>
                </TouchableOpacity>

                {/* QR Result */}
                {showQR && address && (
                    <View style={[styles.qrBox, { backgroundColor: c.surface, borderColor: c.border }]}>
                        <View style={styles.qrPlaceholder}>
                            <Text style={{ fontSize: 60, opacity: 0.7 }}>▣</Text>
                            <Text style={[styles.qrAddr, { color: c.textDim }]} numberOfLines={2}>{address}</Text>
                        </View>
                        <Text style={[styles.qrNote, { color: c.textMuted }]}>
                            QR rendering coming with react-native-qrcode-svg
                        </Text>
                    </View>
                )}

                {/* Saved Wallets QR */}
                <Text style={[styles.label, { color: c.textDim, marginTop: Spacing.xxl }]}>SAVED WALLETS</Text>
                <SavedWalletsList />
            </ScrollView>
        </SafeAreaView>
    );
}

function SavedWalletsList() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const saved = useWalletStore(s => s.savedWallets);

    if (!saved.length) return (
        <Text style={[{ color: c.textMuted, fontSize: FontSize.sm, padding: Spacing.md }]}>
            No saved wallets yet. Generate and save wallets first.
        </Text>
    );

    return (
        <View>
            {saved.slice(0, 5).map((w, i) => (
                <View key={i} style={[styles.savedRow, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Text style={[styles.savedChain, { color: c.accent }]}>{w.chain}</Text>
                    <Text style={[styles.savedAddr, { color: c.textDim }]} numberOfLines={1}>{w.address}</Text>
                </View>
            ))}
            {saved.length > 5 && (
                <Text style={{ color: c.textMuted, fontSize: FontSize.xs, marginTop: 4 }}>
                    +{saved.length - 5} more
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
    title: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.lg },
    label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm },
    scannerBox: {
        height: 140, borderRadius: Radius.lg, borderWidth: 1, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xxl,
    },
    scannerLabel: { fontSize: FontSize.sm, fontWeight: '600', marginTop: Spacing.sm },
    scannerSub: { fontSize: FontSize.xs, marginTop: 2 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: Radius.sm, borderWidth: 1, paddingRight: Spacing.md,
    },
    input: { flex: 1, padding: Spacing.md, fontSize: FontSize.sm, fontFamily: 'monospace' },
    btn: { marginTop: Spacing.md, paddingVertical: 12, borderRadius: Radius.sm, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
    qrBox: {
        marginTop: Spacing.lg, padding: Spacing.xl,
        borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center',
    },
    qrPlaceholder: { alignItems: 'center' },
    qrAddr: { fontSize: 10, fontFamily: 'monospace', marginTop: Spacing.sm, textAlign: 'center' },
    qrNote: { fontSize: FontSize.xs, marginTop: Spacing.md },
    savedRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1, marginBottom: 4,
    },
    savedChain: { fontSize: FontSize.xs, fontWeight: '700', width: 60 },
    savedAddr: { flex: 1, fontSize: 10, fontFamily: 'monospace' },
});
