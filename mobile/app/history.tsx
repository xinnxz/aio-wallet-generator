/**
 * history.tsx — History Screen
 *
 * PENJELASAN:
 * Riwayat semua session generate sebelumnya.
 * Disimpan di AsyncStorage, max 50 entries.
 * User bisa lihat detail atau clear history.
 */

import React from 'react';
import {
    View, Text, TouchableOpacity, FlatList,
    SafeAreaView, StyleSheet, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import { useHistory } from '../hooks/useHistory';

export default function HistoryScreen() {
    const theme = useWalletStore(s => s.theme);
    const c = Colors[theme];
    const { history, clear } = useHistory();

    const handleClear = () => {
        Alert.alert('Clear History', 'Delete all generation history?', [
            { text: 'Cancel' },
            {
                text: 'Clear', style: 'destructive',
                onPress: () => { clear(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.backBtn, { color: c.accent }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>History</Text>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={{ color: c.red, fontSize: FontSize.xs, fontWeight: '600' }}>Clear</Text>
                </TouchableOpacity>
            </View>

            {history.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 40, opacity: 0.3 }}>📜</Text>
                    <Text style={[styles.emptyText, { color: c.textMuted }]}>No history yet</Text>
                    <Text style={[styles.emptySub, { color: c.textMuted }]}>Generated wallets will appear here</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: Spacing.lg }}
                    renderItem={({ item }) => {
                        const date = new Date(item.timestamp);
                        const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    useWalletStore.getState().setWallets(item.wallets);
                                    useWalletStore.getState().setChain(item.chain);
                                    router.navigate('/');
                                }}
                                style={[styles.historyRow, { backgroundColor: c.surface, borderColor: c.border }]}
                            >
                                <View style={styles.historyLeft}>
                                    <Text style={[styles.historyChain, { color: c.accent }]}>{item.chain.toUpperCase()}</Text>
                                    <Text style={[styles.historyTime, { color: c.textMuted }]}>{timeStr}</Text>
                                </View>
                                <View style={styles.historyRight}>
                                    <Text style={[styles.historyCount, { color: c.text }]}>{item.count}</Text>
                                    <Text style={[styles.historyLabel, { color: c.textMuted }]}>wallets</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
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
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.md },
    emptySub: { fontSize: FontSize.sm, marginTop: 4 },
    historyRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm,
    },
    historyLeft: {},
    historyChain: { fontSize: FontSize.sm, fontWeight: '700' },
    historyTime: { fontSize: FontSize.xs, marginTop: 2 },
    historyRight: { alignItems: 'flex-end' },
    historyCount: { fontSize: FontSize.lg, fontWeight: '700' },
    historyLabel: { fontSize: FontSize.xs },
});
