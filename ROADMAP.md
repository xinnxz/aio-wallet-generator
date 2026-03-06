# AIO Chain — Feature Roadmap

> Daftar fitur yang bisa ditambahkan ke depan. Prioritas bisa disesuaikan.

## 🔥 High Impact

### 1. Balance Checker
- Input address → cek saldo on-chain via public RPC
- Multi-chain: ETH, BNB, MATIC, SOL, dll
- Gratis pakai public RPC endpoints (tanpa API key)
- Status: `[ ] Belum dimulai`

### 2. Multi-chain Address Book
- Simpan address favorit di localStorage
- Label + catatan per address
- Quick copy + link ke explorer
- Status: `[ ] Belum dimulai`

### 3. Token Metadata Lookup
- Input contract address → nama token, symbol, decimals, total supply
- Pakai public RPC `eth_call` ke ERC-20 methods
- Status: `[ ] Belum dimulai`

---

## 💎 Medium Impact

### 4. Gas Estimator
- Current gas price beberapa chain (ETH, Polygon, BSC)
- Pakai public RPC `eth_gasPrice`
- Status: `[ ] Belum dimulai`

### 5. Export Format Tambahan
- PDF export (paper wallet rapi)
- Excel (.xlsx)
- Encrypted backup file
- Status: `[ ] Belum dimulai`

### 6. Mobile PWA Improvements
- Offline mode lebih robust
- Install prompt yang menarik
- Status: `[ ] Belum dimulai`

---

## 🎨 UI/UX Improvements

### 7. Dark Mode Polish
- Tingkatkan contrast
- Animated transition saat switch theme
- Status: `[ ] Belum dimulai`

### 8. Onboarding Tour
- First-time user guide (tooltip step-by-step)
- "Getting Started" overlay
- Status: `[ ] Belum dimulai`

### 9. Keyboard Shortcuts
- `Ctrl+G` = Generate
- `Ctrl+E` = Export
- `Ctrl+K` = Command palette
- Status: `[ ] Belum dimulai`

---

## Prioritas

| # | Fitur | Alasan |
|---|-------|--------|
| 1 | Balance Checker | Fitur killer — bikin user balik lagi |
| 2 | Address Book | Utility tinggi, mudah implement |
| 3 | Gas Estimator | Real-time data = daily visits |
| 4 | Keyboard Shortcuts | Professional feel |
