# ⚡ AIO Chain — All-in-One Web3 Wallet Toolkit

> Generate, validate, convert, and secure crypto wallets across **9 chains / 30+ networks** — from **Web**, **CLI**, **Browser Extension**, or **Mobile App**.

100% **client-side**. Zero tracking. Open source.

- 🌐 **Live**: [aio-wallet-generator.vercel.app](https://aio-wallet-generator.vercel.app)
- 📦 **npm**: `npx aio-chain generate --chain evm --count 10`
- 🧩 **Extension**: Chrome / Edge / Brave
- 📱 **Mobile**: iOS & Android (Expo)

---

## Platforms

| Platform | Stack | Status |
|---|---|---|
| **Web** | Vanilla JS + Vite | ✅ 12 pages, PWA, i18n (EN/ID) |
| **CLI** | Node.js + Commander.js | ✅ 6 commands |
| **Extension** | Chrome MV3 | ✅ Vault + Scanner |
| **Mobile** | React Native + Expo (TypeScript) | ✅ 10 screens, biometric |

---

## Supported Chains

| Chain | Networks | Curve | Address Format |
|---|---|---|---|
| **EVM** | Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, zkSync, Avalanche +14 more | secp256k1 | `0x...` (42 chars) |
| **Solana** | Solana | Ed25519 | Base58 (32-44 chars) |
| **Bitcoin** | Bitcoin | secp256k1 | Legacy / SegWit / Native SegWit |
| **Tron** | Tron | secp256k1 | `T...` (Base58Check) |
| **Sui** | Sui | Ed25519 | `0x...` (66 chars) |
| **Aptos** | Aptos | Ed25519 | `0x...` (66 chars) |
| **Cosmos** | ATOM, OSMO, TIA, SEI, INJ +7 IBC chains | secp256k1 | Bech32 |
| **TON** | TON | Ed25519 | `EQ...` (Base64url) |
| **Starknet** | Starknet | STARK | `0x0...` (66 chars) |

---

## Quick Start

### Web App

```bash
git clone https://github.com/xinnxz/aio-wallet-generator.git
cd aio-wallet-generator
npm install
npm run dev    # → http://localhost:5173
```

### CLI

```bash
# Generate 10 EVM wallets
npx aio-chain generate --chain evm --count 10

# Bulk generate, export to CSV
npx aio-chain generate --chain solana --count 1000 --output csv

# Multi-chain
npx aio-chain generate --chain evm,solana,bitcoin --count 50

# HD wallet (1 mnemonic → many wallets)
npx aio-chain generate --chain evm --count 100 --hd

# Validate an address
npx aio-chain validate --address 0x742d35Cc...

# Convert address format
npx aio-chain convert --address 0x742d35Cc... --to lowercase

# All supported chains
npx aio-chain info

# Decrypt an encrypted file
npx aio-chain decrypt --file ./wallets.encrypted
```

### Mobile App

```bash
cd mobile
npm install
npx expo start    # Scan QR with Expo Go
```

### Browser Extension

1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `extension/` folder

---

## CLI Commands

| Command | Description |
|---|---|
| `generate` | Bulk wallet generation (all 9 chains, HD mode, 4 export formats) |
| `validate` | Address validation (single, batch, file input, auto-detect chain) |
| `convert` | Address format conversion (checksum, lowercase, hex) |
| `export` | Re-export wallet files (CSV, JSON, XLSX, Encrypted) |
| `info` | Show chain details and supported networks |
| `decrypt` | Decrypt `.encrypted` wallet files |

---

## Web Pages

| Page | URL | Description |
|---|---|---|
| Dashboard | `/` | Multi-chain wallet generator with batch, export, and history |
| Validator | `/validator.html` | Address validation (single + batch + CSV upload) |
| Converter | `/converter.html` | Address format converter (hex, base58, checksum) |
| Encrypt | `/encrypt.html` | AES-256-GCM file encryption / decryption |
| Chains | `/chains.html` | Chain info table with real logos |
| QR Code | `/qrcode.html` | QR generator for addresses (custom colors, bulk ZIP) |
| HD Wallet | `/hdwallet.html` | BIP39/BIP44 derivation explorer |
| Paper Wallet | `/paperwallet.html` | Printable paper wallet cards |
| Bulk Tools | `/bulktools.html` | Airdrop formatter, duplicate detector, batch checksum |
| Docs | `/docs.html` | Full documentation (CLI, Web, Extension) |
| Security | `/security.html` | Security model, crypto stack, self-audit |
| Plugins | `/plugins.html` | Plugin system architecture |

---

## Project Structure

```
aio-wallet-generator/
├── src/                    CLI (Node.js)
│   ├── index.js            Entry point (6 commands)
│   ├── cli/commands/       generate, validate, convert, export, info, decrypt
│   ├── core/chains/        9 chain generators
│   ├── security/           AES-256, validator
│   └── export/             CSV, JSON, XLSX, encrypted
├── web/                    Web App (Vite)
│   ├── *.html              12 pages
│   ├── style.css           Design system
│   ├── nav.js              Navigation
│   └── *.js                Page logic
├── extension/              Browser Extension (MV3)
│   ├── manifest.json
│   ├── popup/              Popup UI (vault, generate, validate)
│   ├── background/         Service worker (context menu, omnibox)
│   ├── content/            Address scanner
│   └── vault/              Encrypted storage
├── mobile/                 Mobile App (Expo + TypeScript)
│   ├── app/                10 screens (Expo Router)
│   ├── lib/                Wallet generation, export, security
│   ├── store/              Zustand state
│   └── theme/              Design tokens
├── docs/                   Documentation, roadmap, plans
└── package.json
```

---

## Security

| Feature | Implementation |
|---|---|
| **Encryption** | AES-256-GCM + PBKDF2 (100K iterations) |
| **Key Generation** | CSPRNG (crypto.getRandomValues) |
| **Storage** | Keychain (iOS) / Keystore (Android) / chrome.storage |
| **Biometric** | Face ID / Fingerprint (mobile) |
| **Privacy** | Zero network calls, no analytics, no tracking |
| **Clipboard** | Auto-clear after 60 seconds |
| **Open Source** | Every line auditable on GitHub |

---

## License

MIT
