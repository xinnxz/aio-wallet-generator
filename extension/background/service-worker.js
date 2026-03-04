/**
 * service-worker.js — Background Service Worker (Manifest V3)
 * 
 * Handles:
 * 1. Context menu (right-click) — Validate Address, Generate QR
 * 2. Omnibox commands — type 'aio' in address bar
 * 3. Badge counter — show scanned address count
 */

// ============================
// CONTEXT MENUS
// ============================

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'validate-address',
    title: 'AIO: Validate "%s"',
    contexts: ['selection'],
  });
  
  chrome.contextMenus.create({
    id: 'copy-qr',
    title: 'AIO: Generate QR for "%s"',
    contexts: ['selection'],
  });
  
  chrome.contextMenus.create({
    id: 'scan-page',
    title: 'AIO: Scan page for addresses',
    contexts: ['page'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = info.selectionText?.trim();
  
  switch (info.menuItemId) {
    case 'validate-address':
      if (text) {
        const chain = detectChainBG(text);
        const msg = chain 
          ? `✅ Valid ${chain} address` 
          : `❌ Unknown format — not a recognized address`;
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'AIO Chain — Validate',
          message: msg,
        });
      }
      break;
      
    case 'copy-qr':
      // Open popup or web app with QR
      if (text) {
        chrome.tabs.create({
          url: `https://aio-wallet-generator.vercel.app/qrcode.html?addr=${encodeURIComponent(text)}`,
        });
      }
      break;
      
    case 'scan-page':
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCANNER' });
      }
      break;
  }
});


// ============================
// OMNIBOX
// ============================

chrome.omnibox.onInputEntered.addListener((text) => {
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  
  switch (cmd) {
    case 'gen':
    case 'generate':
      // Open web app to generate
      chrome.tabs.create({ url: 'https://aio-wallet-generator.vercel.app/' });
      break;
      
    case 'val':
    case 'validate':
      const addr = parts.slice(1).join('');
      if (addr) {
        const chain = detectChainBG(addr);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'AIO Chain — Validate',
          message: chain ? `✅ ${chain} address` : `❌ Not recognized`,
        });
      }
      break;
      
    case 'qr':
      const qrAddr = parts.slice(1).join('');
      if (qrAddr) {
        chrome.tabs.create({
          url: `https://aio-wallet-generator.vercel.app/qrcode.html?addr=${encodeURIComponent(qrAddr)}`,
        });
      }
      break;
      
    default:
      // Open web app
      chrome.tabs.create({ url: 'https://aio-wallet-generator.vercel.app/' });
      break;
  }
});

chrome.omnibox.onInputStarted.addListener(() => {
  chrome.omnibox.setDefaultSuggestion({
    description: 'AIO Chain: gen [chain] | val [address] | qr [address]',
  });
});


// ============================
// BADGE — show scanned count
// ============================

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'SCAN_COUNT' && sender.tab) {
    const count = msg.count;
    chrome.action.setBadgeText({
      text: count > 0 ? String(count) : '',
      tabId: sender.tab.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#3b82f6',
      tabId: sender.tab.id,
    });
  }
});


// ============================
// CHAIN DETECTION (BG copy)
// ============================

function detectChainBG(address) {
  if (!address || address.length < 20) return null;
  const t = address.trim();
  if (/^0x0[0-9a-fA-F]{63}$/.test(t)) return 'Starknet';
  if (/^0x[0-9a-fA-F]{64}$/.test(t)) return 'Sui/Aptos';
  if (/^0x[0-9a-fA-F]{40}$/.test(t)) return 'EVM';
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(t)) return 'Tron';
  if (/^(bc1|1|3)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(t)) return 'Bitcoin';
  if (/^(cosmos|osmo|atom)[a-z0-9]{38,45}$/.test(t)) return 'Cosmos';
  if (/^(EQ|UQ)[A-Za-z0-9_-]{46}$/.test(t)) return 'TON';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(t)) return 'Solana';
  return null;
}
