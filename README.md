# 🔐 Web3 Wallet Generator

> Generate cryptocurrency wallets at scale across **30+ blockchain chains** — from CLI or a clean web dashboard.

All wallets are generated **client-side** (browser) or **locally** (Node.js). No data is ever sent to any server.

---

## Features

- **30+ chains** — EVM (22 networks), Solana, Bitcoin (3 address types), Tron, Sui, Aptos, Cosmos (12 IBC), TON, Starknet
- **Batch generation** — up to 100,000 wallets in one run
- **HD wallets** — BIP39/BIP44 derivation (1 mnemonic → many wallets)
- **4 export formats** — CSV, JSON, Excel (.xlsx), Encrypted (.encrypted)
- **AES-256-GCM encryption** — password-protect your wallet files
- **CLI** — 4 commands with colored output, spinners, and tables
- **Web Dashboard** — clean UI with parallax, motion, real chain logos, search, pagination
- **Multi-chain address validation** — format + checksum verification

## Supported Chains

| Chain | Networks | Curve | Address Format |
|-------|----------|-------|----------------|
| EVM | Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, zkSync, Avalanche, Fantom, Cronos, Gnosis, Celo, Moonbeam, Harmony, Metis, Mantle, Linea, Scroll, Blast, Mode, Manta, Zora | secp256k1 | 0x... (42 chars) |
| Solana | Solana | Ed25519 | Base58 (32-44 chars) |
| Bitcoin | Bitcoin | secp256k1 | Legacy/SegWit/Native SegWit |
| Tron | Tron | secp256k1 | T... (Base58Check) |
| Sui | Sui | Ed25519 | 0x... (66 chars) |
| Aptos | Aptos | Ed25519 | 0x... (66 chars) |
| Cosmos | ATOM, OSMO, TIA, SEI, INJ, JUNO, EVMOS, KAVA, STRIDE, AKASH, STARGAZE, REGEN | secp256k1 | Bech32 (chain prefix) |
| TON | TON | Ed25519 | EQ... (Base64url) |
| Starknet | Starknet | STARK | 0x... (66 chars) |

## Quick Start

### Install

```bash
git clone https://github.com/your-username/aio-wallet-generator.git
cd aio-wallet-generator
npm install
```

### CLI Usage

```bash
# Generate 10 EVM wallets
node src/index.js generate --chain evm --count 10

# Generate 100 Solana wallets, export to CSV
node src/index.js generate --chain solana --count 100 --output csv

# Multi-chain generation
node src/index.js generate --chain evm,solana,cosmos --count 50

# HD wallet mode (1 mnemonic → many wallets)
node src/index.js generate --chain evm --count 100 --hd

# Export to different formats
node src/index.js export --format xlsx --file ./output/wallets-latest.json

# Show all supported chains
node src/index.js info

# Show specific chain details
node src/index.js info --chain cosmos

# Decrypt an encrypted file
node src/index.js decrypt --file ./wallets.encrypted --password "mypass"
```

### Web Dashboard

```bash
npx vite web --port 5173
# Open http://localhost:5173
```

## CLI Commands

### `generate`

| Flag | Description | Default |
|------|-------------|---------|
| `--chain <chains>` | Chain(s) to generate, comma-separated | `evm` |
| `--count <n>` | Number of wallets per chain | `10` |
| `--output <format>` | Auto-export: `csv`, `json`, `xlsx`, `encrypted` | none |
| `--hd` | HD wallet mode (BIP44 derivation) | `false` |
| `--password <pass>` | Password for encrypted export | prompted |

### `export`

| Flag | Description |
|------|-------------|
| `--format <fmt>` | Export format: `csv`, `json`, `xlsx`, `encrypted` |
| `--file <path>` | Input JSON file to export |

### `info`

| Flag | Description |
|------|-------------|
| `--chain <name>` | Show details for a specific chain |

### `decrypt`

| Flag | Description |
|------|-------------|
| `--file <path>` | Path to `.encrypted` file |
| `--password <pass>` | Decryption password |
| `--export <format>` | Re-export after decryption |

## Project Structure

```
aio-wallet-generator/
├── src/
│   ├── index.js              # CLI entry point
│   ├── cli/
│   │   ├── ui.js             # Banner, spinner, tables
│   │   └── commands/
│   │       ├── generate.js   # Generate command
│   │       ├── export.js     # Export command
│   │       ├── info.js       # Chain info command
│   │       └── decrypt.js    # Decrypt command
│   ├── core/
│   │   ├── generator.js      # Strategy Pattern orchestrator
│   │   ├── batch.js          # Chunked batch processing
│   │   ├── hd-wallet.js      # BIP39/BIP44 derivation
│   │   └── chains/
│   │       ├── evm.js        # 22 EVM networks
│   │       ├── solana.js     # Solana
│   │       ├── bitcoin.js    # Bitcoin (3 types)
│   │       ├── tron.js       # Tron
│   │       ├── sui.js        # Sui
│   │       ├── aptos.js      # Aptos
│   │       ├── cosmos.js     # Cosmos (12 IBC)
│   │       ├── ton.js        # TON
│   │       └── starknet.js   # Starknet
│   ├── security/
│   │   ├── encryption.js     # AES-256-GCM + PBKDF2
│   │   └── validator.js      # Multi-chain address validation
│   └── export/
│       ├── csv.js            # CSV stream export
│       ├── json-export.js    # JSON export
│       ├── excel.js          # Excel export
│       └── encrypted.js      # Encrypted export
├── web/
│   ├── index.html            # Dashboard
│   ├── chains.html           # Chain info page
│   ├── style.css             # Clean theme + motion
│   ├── app.js                # Client-side logic
│   └── images/               # Chain logos
└── package.json
```

## Security

- **AES-256-GCM** encryption with authenticated ciphertext
- **PBKDF2** key derivation (100,000 iterations) — resistant to brute force
- Random **salt** and **IV** per encryption — no two ciphertexts are the same
- Private keys generated **locally** — never transmitted
- `.gitignore` excludes `output/` and `*.encrypted` files

## License

MIT
