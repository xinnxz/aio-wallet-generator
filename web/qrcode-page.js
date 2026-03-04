/**
 * qrcode-page.js — QR Code Generator
 * 
 * Uses qrcode.js library (CDN) to generate QR codes client-side.
 * Supports:
 * - Single QR with custom size/colors + download PNG + copy image
 * - Bulk QR from paste list + download as ZIP (via JSZip)
 */

// ============================
// DOM REFS
// ============================
const dom = {
  qrInput:      document.getElementById('qr-input'),
  qrPaste:      document.getElementById('qr-paste'),
  qrSize:       document.getElementById('qr-size'),
  qrFg:         document.getElementById('qr-fg'),
  qrBg:         document.getElementById('qr-bg'),
  qrGenerate:   document.getElementById('qr-generate'),
  qrResult:     document.getElementById('qr-result'),
  qrPreview:    document.getElementById('qr-preview'),
  qrDownload:   document.getElementById('qr-download'),
  qrCopyImg:    document.getElementById('qr-copy-img'),
  qrAddrLabel:  document.getElementById('qr-addr-label'),
  bulkInput:    document.getElementById('bulk-input'),
  bulkCount:    document.getElementById('bulk-count'),
  bulkSize:     document.getElementById('bulk-size'),
  bulkFg:       document.getElementById('bulk-fg'),
  bulkBg:       document.getElementById('bulk-bg'),
  bulkGenerate: document.getElementById('bulk-generate'),
  bulkResult:   document.getElementById('bulk-result'),
  bulkLabel:    document.getElementById('bulk-label'),
  qrGrid:       document.getElementById('qr-grid'),
  bulkDownloadZip: document.getElementById('bulk-download-zip'),
};


// ============================
// MODE TOGGLE
// ============================
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    document.getElementById('single-mode').style.display = mode === 'single' ? '' : 'none';
    document.getElementById('bulk-mode').style.display = mode === 'bulk' ? '' : 'none';
  });
});


// ============================
// PASTE BUTTON
// ============================
dom.qrPaste.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    dom.qrInput.value = text.trim();
    dom.qrInput.focus();
  } catch { toast('Clipboard access denied', true); }
});


// ============================
// SINGLE QR GENERATE
// ============================

/**
 * generateQR(text, options)
 * Returns canvas element with QR code
 */
async function generateQR(text, { width = 300, color = '#000000', background = '#ffffff' } = {}) {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width,
    margin: 2,
    color: { dark: color, light: background },
    errorCorrectionLevel: 'M',
  });
  return canvas;
}

dom.qrGenerate.addEventListener('click', async () => {
  const text = dom.qrInput.value.trim();
  if (!text) return toast('Enter an address or text', true);
  
  try {
    const width = parseInt(dom.qrSize.value);
    const canvas = await generateQR(text, {
      width,
      color: dom.qrFg.value,
      background: dom.qrBg.value,
    });
    
    dom.qrPreview.innerHTML = '';
    dom.qrPreview.appendChild(canvas);
    dom.qrAddrLabel.textContent = text.length > 50 ? text.slice(0, 24) + '...' + text.slice(-24) : text;
    dom.qrResult.style.display = '';
    toast('QR code generated');
  } catch (e) {
    toast('Failed to generate QR: ' + e.message, true);
  }
});

// Enter key
dom.qrInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') dom.qrGenerate.click();
});

// Download PNG
dom.qrDownload.addEventListener('click', () => {
  const canvas = dom.qrPreview.querySelector('canvas');
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  const addr = dom.qrInput.value.trim();
  a.download = `qr-${addr.slice(0, 10)}-${Date.now()}.png`;
  a.click();
  toast('Downloaded');
});

// Copy Image
dom.qrCopyImg.addEventListener('click', async () => {
  const canvas = dom.qrPreview.querySelector('canvas');
  if (!canvas) return;
  try {
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Copied to clipboard');
  } catch {
    toast('Copy failed — try download instead', true);
  }
});


// ============================
// BULK MODE
// ============================

// Counter
dom.bulkInput.addEventListener('input', () => {
  const lines = dom.bulkInput.value.split('\n').filter(l => l.trim());
  dom.bulkCount.textContent = `${lines.length} address${lines.length !== 1 ? 'es' : ''}`;
});

// Generate all
dom.bulkGenerate.addEventListener('click', async () => {
  const lines = dom.bulkInput.value.split('\n').filter(l => l.trim());
  if (!lines.length) return toast('Paste addresses (one per line)', true);
  
  const width = parseInt(dom.bulkSize.value);
  const color = dom.bulkFg.value;
  const background = dom.bulkBg.value;
  
  dom.qrGrid.innerHTML = '';
  dom.bulkResult.style.display = '';
  dom.bulkLabel.textContent = `Generating ${lines.length} QR codes...`;
  
  for (const line of lines) {
    const addr = line.trim();
    try {
      const canvas = await generateQR(addr, { width, color, background });
      const item = document.createElement('div');
      item.className = 'qr-grid-item';
      item.innerHTML = `<div class="qr-grid-canvas"></div><span class="qr-grid-addr">${truncAddr(addr)}</span>`;
      item.querySelector('.qr-grid-canvas').appendChild(canvas);
      
      // Click to download individual
      item.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `qr-${addr.slice(0, 10)}.png`;
        a.click();
      });
      
      dom.qrGrid.appendChild(item);
    } catch {
      // Skip invalid
    }
  }
  
  dom.bulkLabel.textContent = `${lines.length} QR codes generated`;
  toast(`${lines.length} QR codes generated`);
});

// Download all as ZIP
dom.bulkDownloadZip.addEventListener('click', async () => {
  const canvases = dom.qrGrid.querySelectorAll('canvas');
  if (!canvases.length) return toast('Generate QR codes first', true);
  
  const lines = dom.bulkInput.value.split('\n').filter(l => l.trim());
  
  dom.bulkDownloadZip.disabled = true;
  dom.bulkDownloadZip.textContent = 'Zipping...';
  
  try {
    const zip = new JSZip();
    
    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const addr = lines[i]?.trim() || `qr-${i}`;
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const shortAddr = addr.length > 20 ? addr.slice(0, 8) + '_' + addr.slice(-8) : addr;
      zip.file(`${String(i + 1).padStart(3, '0')}-${shortAddr}.png`, blob);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `qr-codes-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('ZIP downloaded');
  } catch (e) {
    toast('ZIP failed: ' + e.message, true);
  } finally {
    dom.bulkDownloadZip.disabled = false;
    dom.bulkDownloadZip.innerHTML = '<i class="hgi-stroke hgi-download-04"></i> Download ZIP';
  }
});


// ============================
// HELPERS
// ============================

function truncAddr(addr) {
  if (addr.length <= 16) return addr;
  return addr.slice(0, 8) + '...' + addr.slice(-6);
}

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
