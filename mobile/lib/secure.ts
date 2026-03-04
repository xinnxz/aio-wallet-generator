/**
 * secure.ts — Secure Storage & Biometric
 *
 * PENJELASAN:
 * Wrapper untuk expo-secure-store + expo-local-authentication.
 *
 * expo-secure-store: simpan data di Keychain (iOS) / Keystore (Android)
 * → Cocok untuk private keys, passwords, dan sensitive data.
 *
 * expo-local-authentication: Face ID, fingerprint, PIN fallback.
 * → Dipakai saat buka app atau lihat private key.
 */

import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// ── Secure Key Storage ──

const SECURE_KEYS = {
    VAULT_PASSWORD: 'aio_vault_password',
    BIOMETRIC_ENABLED: 'aio_biometric',
    VAULT_DATA: 'aio_vault_data',
};

/**
 * Simpan value terenkripsi di Keychain/Keystore
 */
export async function secureSet(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
}

/**
 * Ambil value dari secure storage
 */
export async function secureGet(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
}

/**
 * Hapus dari secure storage
 */
export async function secureDelete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
}

// ── Vault Password ──

export async function setVaultPassword(password: string): Promise<void> {
    await secureSet(SECURE_KEYS.VAULT_PASSWORD, password);
}

export async function getVaultPassword(): Promise<string | null> {
    return secureGet(SECURE_KEYS.VAULT_PASSWORD);
}

export async function hasVaultPassword(): Promise<boolean> {
    const pw = await getVaultPassword();
    return pw !== null && pw.length > 0;
}

// ── Biometric ──

/**
 * Check apakah device support biometric
 */
export async function isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
}

/**
 * Get supported biometric types (Face ID, Fingerprint, etc.)
 */
export async function getBiometricType(): Promise<string> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
    }
    return 'Biometric';
}

/**
 * Authenticate user dengan biometric
 */
export async function authenticateBiometric(prompt?: string): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt || 'Authenticate to continue',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
    });
    return result.success;
}

/**
 * Enable/disable biometric lock
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
    await secureSet(SECURE_KEYS.BIOMETRIC_ENABLED, enabled ? '1' : '0');
}

export async function isBiometricEnabled(): Promise<boolean> {
    const val = await secureGet(SECURE_KEYS.BIOMETRIC_ENABLED);
    return val === '1';
}
