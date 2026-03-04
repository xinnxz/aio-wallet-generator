# 🗺️ AIO Chain — Unified Roadmap

> **Vision**: The most complete, open-source, client-side Web3 wallet toolkit — for Web & Mobile.

---

## Platform Strategy

| Platform | Tech Stack | Status |
|---|---|---|
| **Web** | Vanilla JS + Vite + CSS | ✅ Phase 1 done |
| **Mobile** | React Native + Expo (TypeScript) | 📋 Planned (after web Phase 2) |
| **CLI** | Node.js | ✅ Basic done |

> **Rule**: Build & test every feature on **Web first**, then port shared logic to **Mobile**.

---

## Phase 1 — Core Generator ✅ `DONE`

> *Both platforms share the same 9 chain generators.*

| Feature | Web | Mobile | Shared Logic |
|---|---|---|---|
| Multi-chain generation (9 chains, 30+ networks) | ✅ | 📋 | `src/core/chains/*` |
| Batch generate (up to 100K) | ✅ | 📋 | `src/core/batch.js` |
| Export CSV / JSON / TXT | ✅ | 📋 | `src/export/*` |
| Copy address / key / mnemonic | ✅ | 📋 | — |
| Session history | ✅ | 📋 | — |
| Dark mode | ✅ | 📋 | — |
| 3D Cube loading | ✅ | 📋 | — |
| Trust & Security section | ✅ | 📋 | — |
| Mobile responsive | ✅ | — | — |

---

## Phase 2 — Nav Tools 🔧 `IN PROGRESS`

> *Build on Web first → port logic to Mobile.*

### 🔍 Validate

| Feature | Web | Mobile | Notes |
|---|---|---|---|
| Single address validation | 📋 `validator.html` | 📋 `validate.tsx` | — |
| Auto-detect chain from address format | 📋 | 📋 | Shared: `lib/validate.ts` |
| Checksum / length / prefix check | 📋 | 📋 | Per-chain rules |
| Batch validate (paste list / CSV) | 📋 | 📋 | — |
| QR scan to validate | ❌ N/A | 📋 | Mobile-only (camera) |
| Result: ✅ valid / ❌ invalid / ⚠️ warning | 📋 | 📋 | — |

### 🔄 Convert

| Feature | Web | Mobile | Notes |
|---|---|---|---|
| Hex ↔ Bech32 (Bitcoin, Cosmos) | 📋 `converter.html` | 📋 `convert.tsx` | Shared |
| Base58 ↔ Hex (Solana, Bitcoin) | 📋 | 📋 | Shared |
| Checksum ↔ lowercase (EVM) | 📋 | 📋 | — |
| Mnemonic ↔ seed ↔ private key viewer | 📋 | 📋 | BIP39/BIP32 |
| ENS / SNS name resolver | 📋 | 📋 | Needs network |
| Live convert-as-you-type | 📋 | 📋 | — |

### 🔐 Encrypt

| Feature | Web | Mobile | Notes |
|---|---|---|---|
| AES-256-GCM file encryption | 📋 `encrypt.html` | 📋 `encrypt.tsx` | Web Crypto API / quick-crypto |
| Password-protected wallet export | 📋 | 📋 | Shared |
| Decrypt & view encrypted files | 📋 | 📋 | — |
| Password strength meter | 📋 | 📋 | — |
| Shamir's Secret Sharing (split N / need M) | 📋 | 📋 | Advanced |

### 📋 Chains Info

| Feature | Web | Mobile | Notes |
|---|---|---|---|
| Chain detail page (explorer, RPC, docs) | 📋 `chains.html` | 📋 `settings.tsx` | — |
| Network comparison table | 📋 | 📋 | — |
| Deep link to generate with chain selected | 📋 | 📋 | — |

---

## Phase 3 — Advanced Features

> *These can be built in parallel on Web & Mobile.*

### 📊 Balance Checker

| Feature | Web | Mobile |
|---|---|---|
| Batch check balances via public RPC | 📋 | 📋 |
| Support EVM, Solana, Bitcoin | 📋 | 📋 |
| CSV export with address + balance | 📋 | 📋 |
| Rate-limited requests | 📋 | 📋 |

### 🖼️ QR Code

| Feature | Web | Mobile |
|---|---|---|
| Generate QR per address | 📋 | 📋 |
| Bulk download as ZIP | 📋 | 📋 |
| Customizable style (color, logo) | 📋 | 📋 |
| Scan QR (camera) | ❌ N/A | 📋 |

### 📄 Paper Wallet

| Feature | Web | Mobile |
|---|---|---|
| Printable PDF (address + QR + key) | 📋 | 📋 |
| Tamper-evident fold template | 📋 | ❌ |
| Passphrase encryption on paper | 📋 | 📋 |

### 🌳 HD Wallet Explorer

| Feature | Web | Mobile |
|---|---|---|
| Derive from mnemonic (BIP44/49/84) | 📋 | 📋 |
| Visual derivation tree | 📋 | 📋 |
| Cross-chain derivation from 1 seed | 📋 | 📋 |
| Custom derivation path | 📋 | 📋 |

### 📦 Bulk Tools

| Feature | Web | Mobile |
|---|---|---|
| Airdrop list formatter | 📋 | 📋 |
| Wallet label/tag manager | 📋 | 📋 |
| Duplicate address detector | 📋 | 📋 |

---

## Phase 4 — Platform Growth

| Feature | Web | Mobile | Notes |
|---|---|---|---|
| **Multi-language (i18n)** | 📋 | 📋 | EN, ID, ZH, ES |
| **PWA** (install as app) | 📋 | — | Web-only |
| **Browser Extension** | 📋 | — | Web-only |
| **CLI / API** (`npx aio-chain`) | 📋 | — | Node.js only |
| **Biometric Lock** | ❌ | 📋 | Mobile-only |
| **Haptic Feedback** | ❌ | 📋 | Mobile-only |
| **Share Sheet** (native) | ❌ | 📋 | Mobile-only |
| **Home Screen Widget** | ❌ | 📋 | Mobile-only |

---

## Phase 5 — Community & Ecosystem

| Feature | Platform |
|---|---|
| Documentation site | Web |
| Plugin system (custom chains, exports) | Web + Mobile |
| Security audit + bug bounty | All |
| App Store / Play Store listing | Mobile |
| Video tutorials | All |

---

## Implementation Order

```
Web Phase 2 ──→ Mobile Phase M1 ──→ Mobile Phase M2
(Validate,       (Foundation,        (Core features,
 Convert,         crypto polyfills,    export, dark mode,
 Encrypt,         generate screen)     history)
 Chains)
     │                                      │
     └────── Shared Logic ─────────────────┘
              lib/validate.ts
              lib/convert.ts
              lib/encrypt.ts
              lib/constants.ts
```

---

## 💡 Principles

1. **100% Client-Side** — No server, no tracking, works offline
2. **Open Source** — Every line auditable on GitHub
3. **Privacy First** — Zero data collection, ever
4. **Cross-Chain** — One tool for all blockchains
5. **Web First** — Build, test, then port to mobile

---

*Last updated: March 2026*
