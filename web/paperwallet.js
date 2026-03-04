/**
 * paperwallet.js — Paper Wallet Generator
 * 
 * Generates printable cold storage wallets:
 * - Address QR (public) + Private Key QR (private)
 * - Fold line for security
 * - Print-optimized CSS (@media print)
 * 
 * Can generate new wallets or use pasted address/key.
 */

// ============================
// DOM
// ============================
const dom = {
  chain:    document.getElementById('paper-chain'),
  count:    document.getElementById('paper-count'),
  addr:     document.getElementById('paper-addr'),
  key:      document.getElementById('paper-key'),
  genBtn:   document.getElementById('paper-generate'),
  useBtn:   document.getElementById('paper-use-input'),
  preview:  document.getElementById('paper-preview'),
  cards:    document.getElementById('paper-cards'),
  printBtn: document.getElementById('paper-print'),
};


// ============================
// GENERATE NEW WALLETS
// ============================
dom.genBtn.addEventListener('click', async () => {
  const count = parseInt(dom.count.value);
  const wallets = [];
  
  for (let i = 0; i < count; i++) {
    const w = ethers.Wallet.createRandom();
    wallets.push({ address: w.address, privateKey: w.privateKey });
  }
  
  await renderPaperWallets(wallets);
});

// ============================
// USE PASTED INPUT
// ============================
dom.useBtn.addEventListener('click', async () => {
  const addr = dom.addr.value.trim();
  const key = dom.key.value.trim();
  if (!addr) return toast('Enter an address', true);
  if (!key) return toast('Enter a private key', true);
  await renderPaperWallets([{ address: addr, privateKey: key }]);
});


// ============================
// RENDER PAPER WALLETS
// ============================
async function renderPaperWallets(wallets) {
  dom.cards.innerHTML = '';
  
  for (const w of wallets) {
    const card = document.createElement('div');
    card.className = 'pw-card';
    
    // Generate QR codes
    const addrCanvas = document.createElement('canvas');
    const keyCanvas = document.createElement('canvas');
    
    await QRCode.toCanvas(addrCanvas, w.address, {
      width: 160, margin: 1, color: { dark: '#000', light: '#fff' },
      errorCorrectionLevel: 'M',
    });
    await QRCode.toCanvas(keyCanvas, w.privateKey, {
      width: 160, margin: 1, color: { dark: '#000', light: '#fff' },
      errorCorrectionLevel: 'M',
    });
    
    card.innerHTML = `
      <div class="pw-row">
        <div class="pw-side pw-public">
          <div class="pw-label">PUBLIC ADDRESS</div>
          <div class="pw-qr" id="pw-addr-qr-${Date.now()}"></div>
          <div class="pw-text">${w.address}</div>
          <div class="pw-hint">Receive funds here</div>
        </div>
        <div class="pw-fold">
          <span>◀ FOLD ▶</span>
        </div>
        <div class="pw-side pw-private">
          <div class="pw-label">PRIVATE KEY</div>
          <div class="pw-qr" id="pw-key-qr-${Date.now()}"></div>
          <div class="pw-text">${w.privateKey}</div>
          <div class="pw-hint">⚠ Keep secret — do NOT share</div>
        </div>
      </div>
      <div class="pw-footer">
        <span>AIO Chain Paper Wallet</span>
        <span>${new Date().toLocaleDateString()}</span>
      </div>
    `;
    
    dom.cards.appendChild(card);
    
    // Append canvases
    const qrSlots = card.querySelectorAll('.pw-qr');
    qrSlots[0].appendChild(addrCanvas);
    qrSlots[1].appendChild(keyCanvas);
  }
  
  dom.preview.style.display = '';
  dom.preview.scrollIntoView({ behavior: 'smooth' });
  toast(`${wallets.length} paper wallet(s) generated`);
}


// ============================
// PRINT
// ============================
dom.printBtn.addEventListener('click', () => {
  window.print();
});


// ============================
// HELPERS
// ============================
function toast(msg, isError = false) {
  const wrap = document.getElementById('toast-wrap');
  const t = document.createElement('div');
  t.className = `toast ${isError ? 'toast--error' : ''}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
