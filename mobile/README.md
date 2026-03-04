# AIO Chain — Mobile App

> React Native + Expo (TypeScript) — iOS & Android

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your device.

## Features

| Screen | Description |
|---|---|
| **Generate** | Bulk wallet generation (9 chains), progress bar, copy/export |
| **Validate** | Address validation with auto-detect chain, batch mode |
| **QR** | QR code generator + camera scanner (M3) |
| **Tools** | Address converter (checksum/hex) + Encrypt/decrypt |
| **Settings** | Dark mode, chain info, security, links |

## Security

- **100% Offline** — zero network calls
- **Biometric Lock** — Face ID / Fingerprint (expo-local-authentication)
- **Encrypted Storage** — Keychain (iOS) / Keystore (Android) via expo-secure-store
- **Clipboard Auto-Clear** — Sensitive data cleared after 60 seconds
- **Open Source** — Every line auditable

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Storage | AsyncStorage + expo-secure-store |
| Biometric | expo-local-authentication |
| Export | expo-file-system + expo-sharing |

## Project Structure

```
mobile/
├── app/             10 screens (Expo Router)
├── lib/             7 business logic modules
├── hooks/           Custom React hooks
├── store/           Zustand state management
├── theme/           Design tokens (dark-first)
└── assets/          Icons, splash, fonts
```

## Development Phases

- ✅ **M1 Foundation** — Setup, navigation, generate screen, design system
- ✅ **M2 Core Features** — Export, history, wallet detail
- ✅ **M3 Advanced** — Biometric, secure store, onboarding
- ✅ **M4 Polish** — Performance, clipboard security, README
