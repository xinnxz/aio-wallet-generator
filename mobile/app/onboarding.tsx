/**
 * onboarding.tsx — Onboarding / Lock Screen
 *
 * PENJELASAN:
 * Screen yang muncul saat pertama kali buka app:
 * 1. Welcome → fitur overview
 * 2. Setup vault password (opsional)
 * 3. Enable biometric (jika tersedia)
 *
 * Juga dipakai sebagai lock screen:
 * Kalau biometric enabled, minta Face ID/fingerprint saat buka app.
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    SafeAreaView, StyleSheet, Alert, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import {
    isBiometricAvailable, getBiometricType,
    authenticateBiometric, setBiometricEnabled,
    setVaultPassword, hasVaultPassword,
    isBiometricEnabled,
} from '../lib/secure';

const { width } = Dimensions.get('window');

const FEATURES = [
    { icon: '⚡', title: '9 Chains', desc: 'EVM, Solana, Bitcoin, Tron, Sui, Aptos, Cosmos, TON, Starknet' },
    { icon: '🔐', title: '100% Offline', desc: 'No server, no tracking, works without internet' },
    { icon: '📱', title: 'Native Feel', desc: 'Haptic feedback, dark mode, gesture navigation' },
    { icon: '🔒', title: 'Secure', desc: 'Biometric lock, encrypted storage, open source' },
];

export default function OnboardingScreen() {
    const c = Colors.dark; // Always dark for onboarding
    const [step, setStep] = useState<'welcome' | 'password' | 'biometric' | 'lock'>('welcome');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [bioAvailable, setBioAvailable] = useState(false);
    const [bioType, setBioType] = useState('Biometric');

    useEffect(() => {
        checkState();
    }, []);

    const checkState = async () => {
        const hasPw = await hasVaultPassword();
        const bioEnabled = await isBiometricEnabled();

        if (hasPw && bioEnabled) {
            setStep('lock');
            attemptBiometric();
        } else if (hasPw) {
            // Already setup, go to app
            router.replace('/');
        }

        const available = await isBiometricAvailable();
        setBioAvailable(available);
        if (available) {
            const type = await getBiometricType();
            setBioType(type);
        }
    };

    const attemptBiometric = async () => {
        const success = await authenticateBiometric('Unlock AIO Chain');
        if (success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/');
        }
    };

    const handleSetPassword = async () => {
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Use at least 6 characters');
            return;
        }
        if (password !== confirmPw) {
            Alert.alert('Mismatch', 'Passwords do not match');
            return;
        }
        await setVaultPassword(password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (bioAvailable) {
            setStep('biometric');
        } else {
            router.replace('/');
        }
    };

    const handleEnableBiometric = async () => {
        const success = await authenticateBiometric(`Enable ${bioType}`);
        if (success) {
            await setBiometricEnabled(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/');
        }
    };

    // ── Lock Screen ──
    if (step === 'lock') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.center}>
                    <Text style={{ fontSize: 60 }}>🔒</Text>
                    <Text style={[styles.lockTitle, { color: c.text }]}>AIO Chain Locked</Text>
                    <TouchableOpacity
                        onPress={attemptBiometric}
                        style={[styles.mainBtn, { backgroundColor: c.accent }]}
                    >
                        <Text style={styles.mainBtnText}>Unlock with {bioType}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Welcome ──
    if (step === 'welcome') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.welcomeContent}>
                    <Text style={{ fontSize: 48, textAlign: 'center' }}>⚡</Text>
                    <Text style={[styles.appName, { color: c.text }]}>AIO Chain</Text>
                    <Text style={[styles.tagline, { color: c.textDim }]}>
                        All-in-One Web3 Wallet Toolkit
                    </Text>

                    <View style={styles.features}>
                        {FEATURES.map((f, i) => (
                            <View key={i} style={[styles.featureRow, { borderColor: c.border }]}>
                                <Text style={styles.featureIcon}>{f.icon}</Text>
                                <View style={styles.featureInfo}>
                                    <Text style={[styles.featureTitle, { color: c.text }]}>{f.title}</Text>
                                    <Text style={[styles.featureDesc, { color: c.textMuted }]}>{f.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => setStep('password')}
                        style={[styles.mainBtn, { backgroundColor: c.accent }]}
                    >
                        <Text style={styles.mainBtnText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <Text style={[styles.skipText, { color: c.textMuted }]}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Password Setup ──
    if (step === 'password') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.formContent}>
                    <Text style={{ fontSize: 40, textAlign: 'center' }}>🔐</Text>
                    <Text style={[styles.formTitle, { color: c.text }]}>Create Vault Password</Text>
                    <Text style={[styles.formSub, { color: c.textMuted }]}>
                        Protects your saved wallets. Min 6 characters.
                    </Text>

                    <TextInput
                        style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                        placeholder="Password"
                        placeholderTextColor={c.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoFocus
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                        placeholder="Confirm password"
                        placeholderTextColor={c.textMuted}
                        value={confirmPw}
                        onChangeText={setConfirmPw}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        onPress={handleSetPassword}
                        style={[styles.mainBtn, { backgroundColor: c.accent }]}
                    >
                        <Text style={styles.mainBtnText}>Set Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <Text style={[styles.skipText, { color: c.textMuted }]}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Biometric Setup ──
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={styles.center}>
                <Text style={{ fontSize: 48 }}>👆</Text>
                <Text style={[styles.formTitle, { color: c.text }]}>Enable {bioType}</Text>
                <Text style={[styles.formSub, { color: c.textMuted }]}>
                    Quick unlock with {bioType} every time you open the app.
                </Text>

                <TouchableOpacity
                    onPress={handleEnableBiometric}
                    style={[styles.mainBtn, { backgroundColor: c.accent }]}
                >
                    <Text style={styles.mainBtnText}>Enable {bioType}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/')}>
                    <Text style={[styles.skipText, { color: c.textMuted }]}>Not now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    welcomeContent: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
    formContent: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
    appName: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: Spacing.md, letterSpacing: -1 },
    tagline: { fontSize: FontSize.sm, textAlign: 'center', marginTop: 4, marginBottom: Spacing.xxxl },
    features: { marginBottom: Spacing.xxxl },
    featureRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, borderBottomWidth: 1,
    },
    featureIcon: { fontSize: 24, width: 40 },
    featureInfo: { flex: 1 },
    featureTitle: { fontSize: FontSize.sm, fontWeight: '700' },
    featureDesc: { fontSize: FontSize.xs, marginTop: 1 },
    mainBtn: { paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', width: '100%' },
    mainBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
    skipText: { fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.lg },
    lockTitle: { fontSize: FontSize.xl, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.xxl },
    formTitle: { fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center', marginTop: Spacing.lg },
    formSub: { fontSize: FontSize.sm, textAlign: 'center', marginTop: 4, marginBottom: Spacing.xxl },
    input: {
        padding: Spacing.lg, borderRadius: Radius.sm, borderWidth: 1,
        fontSize: FontSize.md, marginBottom: Spacing.md,
    },
});
