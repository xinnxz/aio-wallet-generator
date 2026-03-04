/**
 * settings.tsx — Settings Screen
 *
 * PENJELASAN:
 * Settings: theme toggle, chain info, saved wallets count,
 * app version, security info, dan links.
 */

import React from 'react';
import {
    View, Text, TouchableOpacity, Switch,
    ScrollView, SafeAreaView, StyleSheet, Linking, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import { CHAINS } from '../lib/constants';

export default function SettingsScreen() {
    const theme = useWalletStore(s => s.theme);
    const toggleTheme = useWalletStore(s => s.toggleTheme);
    const savedWallets = useWalletStore(s => s.savedWallets);
    const c = Colors[theme];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: c.text }]}>Settings</Text>

                {/* Appearance */}
                <Text style={[styles.sectionTitle, { color: c.textDim }]}>APPEARANCE</Text>
                <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: c.text }]}>Dark Mode</Text>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={() => { toggleTheme(); Haptics.selectionAsync(); }}
                            trackColor={{ false: c.surface3, true: c.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Data */}
                <Text style={[styles.sectionTitle, { color: c.textDim }]}>DATA</Text>
                <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: c.text }]}>Saved Wallets</Text>
                        <Text style={[styles.settingValue, { color: c.accent }]}>{savedWallets.length}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert('Clear Data', 'Clear all saved wallets?', [
                                { text: 'Cancel' },
                                { text: 'Clear', style: 'destructive', onPress: () => useWalletStore.setState({ savedWallets: [] }) },
                            ]);
                        }}
                        style={styles.settingRow}
                    >
                        <Text style={[styles.settingLabel, { color: c.red }]}>Clear Saved Wallets</Text>
                    </TouchableOpacity>
                </View>

                {/* Chains */}
                <Text style={[styles.sectionTitle, { color: c.textDim }]}>SUPPORTED CHAINS</Text>
                <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    {CHAINS.map((chain, i) => (
                        <View key={chain.id}>
                            {i > 0 && <View style={[styles.divider, { backgroundColor: c.border }]} />}
                            <View style={styles.chainRow}>
                                <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                                <Text style={[styles.chainName, { color: c.text }]}>{chain.name}</Text>
                                <Text style={[styles.chainSymbol, { color: c.textMuted }]}>{chain.symbol}</Text>
                                <Text style={[styles.chainKey, { color: c.textMuted }]}>{chain.keyType}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Security */}
                <Text style={[styles.sectionTitle, { color: c.textDim }]}>SECURITY</Text>
                <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: c.text }]}>Biometric Lock</Text>
                        <Text style={[styles.settingValue, { color: c.textMuted }]}>Phase M3</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: c.text }]}>Encryption</Text>
                        <Text style={[styles.settingValue, { color: c.green }]}>AES-256-GCM</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: c.text }]}>Client-Side</Text>
                        <Text style={[styles.settingValue, { color: c.green }]}>100%</Text>
                    </View>
                </View>

                {/* About */}
                <Text style={[styles.sectionTitle, { color: c.textDim }]}>ABOUT</Text>
                <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: c.text }]}>Version</Text>
                        <Text style={[styles.settingValue, { color: c.textMuted }]}>1.0.0</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://github.com/xinnxz/aio-wallet-generator')}
                        style={styles.settingRow}
                    >
                        <Text style={[styles.settingLabel, { color: c.accent }]}>Source Code (GitHub)</Text>
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: c.border }]} />
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://aio-wallet-generator.vercel.app')}
                        style={styles.settingRow}
                    >
                        <Text style={[styles.settingLabel, { color: c.accent }]}>Web App</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
    title: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.lg },
    sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    card: { borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
    settingRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: Spacing.lg,
    },
    settingLabel: { fontSize: FontSize.sm, fontWeight: '500' },
    settingValue: { fontSize: FontSize.sm, fontWeight: '600' },
    divider: { height: 1 },
    chainRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    },
    chainDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
    chainName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
    chainSymbol: { fontSize: FontSize.xs, fontWeight: '600', width: 45, textAlign: 'right' },
    chainKey: { fontSize: FontSize.xs, width: 75, textAlign: 'right' },
});
