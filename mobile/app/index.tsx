/**
 * index.tsx — Generate Screen (Home Tab)
 *
 * PENJELASAN:
 * Screen utama app. User memilih chain, jumlah wallet,
 * lalu tap Generate. Hasil ditampilkan dalam FlatList.
 *
 * UI Elements:
 * - Header dengan logo + theme toggle
 * - Horizontal chain selector chips (scrollable)
 * - Count input (quick buttons: 5, 10, 50, 100)
 * - Generate button (full width, accent color)
 * - Progress bar saat generating
 * - FlatList hasil wallet (address + copy button)
 * - Bulk actions (Copy All, Export CSV)
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    TextInput,
    Pressable,
    StyleSheet,
    SafeAreaView,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '../store/walletStore';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import { CHAINS } from '../lib/constants';
import { generateBulk, Wallet } from '../lib/generator';

export default function GenerateScreen() {
    const {
        selectedChain, setChain,
        walletCount, setCount,
        generatedWallets, setWallets,
        isGenerating, setGenerating,
        progress, setProgress,
        savedWallets, addSaved,
        theme,
    } = useWalletStore();

    const c = Colors[theme];
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    // ── Generate ──
    const handleGenerate = useCallback(async () => {
        setGenerating(true);
        setProgress(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const wallets = await generateBulk(selectedChain, walletCount, (cur, total) => {
                setProgress(Math.round((cur / total) * 100));
            });
            setWallets(wallets);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setGenerating(false);
        }
    }, [selectedChain, walletCount]);

    // ── Copy ──
    const copyAddress = useCallback(async (address: string, idx: number) => {
        await Clipboard.setStringAsync(address);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    }, []);

    // ── Copy All ──
    const copyAll = useCallback(async () => {
        const all = generatedWallets.map(w => w.address).join('\n');
        await Clipboard.setStringAsync(all);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Copied', `${generatedWallets.length} addresses copied`);
    }, [generatedWallets]);

    // ── Save All ──
    const saveAll = useCallback(() => {
        addSaved(generatedWallets);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Saved', `${generatedWallets.length} wallets saved`);
    }, [generatedWallets]);

    // ── Render Wallet Row ──
    const renderWallet = useCallback(({ item, index }: { item: Wallet; index: number }) => (
        <View style={[styles.walletRow, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.walletIdx, { color: c.textMuted }]}>{index + 1}</Text>
            <View style={styles.walletInfo}>
                <Text style={[styles.walletAddr, { color: c.textDim }]} numberOfLines={1}>
                    {item.address}
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => copyAddress(item.address, index)}
                style={[styles.copyBtn, {
                    backgroundColor: copiedIdx === index ? c.green : c.surface2,
                    borderColor: copiedIdx === index ? c.green : c.border,
                }]}
            >
                <Text style={{ color: copiedIdx === index ? '#fff' : c.textMuted, fontSize: 10, fontWeight: '700' }}>
                    {copiedIdx === index ? '✓' : 'COPY'}
                </Text>
            </TouchableOpacity>
        </View>
    ), [c, copiedIdx]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <Text style={[styles.logo, { color: c.text }]}>⚡ AIO Chain</Text>
                <TouchableOpacity
                    onPress={() => useWalletStore.getState().toggleTheme()}
                    style={[styles.themeBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                    <Text style={{ fontSize: 16 }}>{theme === 'dark' ? '☀' : '🌙'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Chain Selector */}
                <Text style={[styles.label, { color: c.textDim }]}>CHAIN</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainScroll}>
                    {CHAINS.map(chain => {
                        const isActive = chain.id === selectedChain;
                        return (
                            <TouchableOpacity
                                key={chain.id}
                                onPress={() => { setChain(chain.id); Haptics.selectionAsync(); }}
                                style={[styles.chainChip, {
                                    backgroundColor: isActive ? c.accentGlow : c.surface,
                                    borderColor: isActive ? c.accent : c.border,
                                }]}
                            >
                                <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                                <Text style={[styles.chainName, { color: isActive ? c.accent : c.textDim }]}>
                                    {chain.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Count */}
                <Text style={[styles.label, { color: c.textDim }]}>QUANTITY</Text>
                <View style={styles.countRow}>
                    {[5, 10, 50, 100, 500].map(n => (
                        <TouchableOpacity
                            key={n}
                            onPress={() => { setCount(n); Haptics.selectionAsync(); }}
                            style={[styles.countChip, {
                                backgroundColor: walletCount === n ? c.accentGlow : c.surface,
                                borderColor: walletCount === n ? c.accent : c.border,
                            }]}
                        >
                            <Text style={[styles.countText, { color: walletCount === n ? c.accent : c.textDim }]}>
                                {n}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TextInput
                        style={[styles.countInput, {
                            backgroundColor: c.surface,
                            borderColor: c.border,
                            color: c.text,
                        }]}
                        value={String(walletCount)}
                        onChangeText={(t) => setCount(Math.max(1, parseInt(t) || 1))}
                        keyboardType="number-pad"
                        placeholder="Custom"
                        placeholderTextColor={c.textMuted}
                    />
                </View>

                {/* Generate Button */}
                <Pressable
                    onPress={handleGenerate}
                    disabled={isGenerating}
                    style={({ pressed }) => [
                        styles.generateBtn,
                        { backgroundColor: isGenerating ? c.surface2 : (pressed ? c.accentHover : c.accent) },
                    ]}
                >
                    <Text style={styles.generateText}>
                        {isGenerating ? `Generating... ${progress}%` : `Generate ${walletCount} Wallets`}
                    </Text>
                </Pressable>

                {/* Progress Bar */}
                {isGenerating && (
                    <View style={[styles.progressBar, { backgroundColor: c.surface }]}>
                        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: c.accent }]} />
                    </View>
                )}

                {/* Bulk Actions */}
                {generatedWallets.length > 0 && !isGenerating && (
                    <View style={styles.bulkActions}>
                        <Text style={[styles.bulkCount, { color: c.textDim }]}>
                            {generatedWallets.length} wallets
                        </Text>
                        <View style={styles.bulkBtns}>
                            <TouchableOpacity
                                onPress={saveAll}
                                style={[styles.smallBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                            >
                                <Text style={[styles.smallBtnText, { color: c.textDim }]}>Save All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={copyAll}
                                style={[styles.smallBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                            >
                                <Text style={[styles.smallBtnText, { color: c.textDim }]}>Copy All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Results List */}
            {generatedWallets.length > 0 && (
                <FlatList
                    data={generatedWallets}
                    renderItem={renderWallet}
                    keyExtractor={(_, i) => String(i)}
                    style={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={20}
                    maxToRenderPerBatch={50}
                    windowSize={10}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    logo: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: -0.5 },
    themeBtn: {
        width: 36, height: 36, borderRadius: Radius.sm,
        borderWidth: 1, justifyContent: 'center', alignItems: 'center',
    },
    content: { padding: Spacing.lg },
    label: {
        fontSize: FontSize.xs, fontWeight: '700',
        letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.lg,
    },
    chainScroll: { marginBottom: Spacing.sm },
    chainChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.md, borderWidth: 1, marginRight: Spacing.sm,
    },
    chainDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    chainName: { fontSize: FontSize.sm, fontWeight: '600' },
    countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    countChip: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.sm, borderWidth: 1,
    },
    countText: { fontSize: FontSize.sm, fontWeight: '600' },
    countInput: {
        flex: 1, minWidth: 60, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
        borderRadius: Radius.sm, borderWidth: 1, fontSize: FontSize.sm,
        fontWeight: '600', textAlign: 'center',
    },
    generateBtn: {
        marginTop: Spacing.xl, paddingVertical: 14,
        borderRadius: Radius.md, alignItems: 'center',
    },
    generateText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
    progressBar: { height: 4, borderRadius: 2, marginTop: Spacing.sm, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    bulkActions: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: Spacing.md, paddingVertical: Spacing.sm,
    },
    bulkCount: { fontSize: FontSize.sm, fontWeight: '600' },
    bulkBtns: { flexDirection: 'row', gap: Spacing.sm },
    smallBtn: {
        paddingHorizontal: Spacing.md, paddingVertical: 6,
        borderRadius: Radius.sm, borderWidth: 1,
    },
    smallBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
    resultsList: { flex: 1, paddingHorizontal: Spacing.lg },
    walletRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1,
        marginBottom: 4,
    },
    walletIdx: { width: 28, fontSize: FontSize.xs, fontWeight: '600', textAlign: 'right', marginRight: Spacing.sm },
    walletInfo: { flex: 1 },
    walletAddr: { fontSize: 11, fontFamily: 'monospace' },
    copyBtn: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 4, borderWidth: 1, marginLeft: Spacing.sm,
    },
});
