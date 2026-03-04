/**
 * scanner.js — Content Script: Address Scanner
 * 
 * Scans the current webpage for cryptocurrency addresses,
 * highlights them with colored underlines, and adds hover tooltips.
 * 
 * Triggered by:
 * - Popup scanner toggle button
 * - Context menu "Scan page for addresses"
 * - Message from background service worker
 */

let scannerActive = false;
const HIGHLIGHT_CLASS = 'aio-addr-highlight';
const TOOLTIP_CLASS = 'aio-addr-tooltip';

// Chain colors for highlights
const CHAIN_COLORS = {
  EVM:      '#3b82f6',
  Bitcoin:  '#f7931a',
  Solana:   '#9945ff',
  Tron:     '#ff0013',
  Starknet: '#29296e',
};

// Regex patterns for scanning
const SCAN_REGEX = [
  { chain: 'EVM',      regex: /\b0x[0-9a-fA-F]{40}\b/g },
  { chain: 'Bitcoin',  regex: /\b(bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][1-9A-HJ-NP-Za-km-z]{25,34})\b/g },
  { chain: 'Tron',     regex: /\bT[1-9A-HJ-NP-Za-km-z]{33}\b/g },
  { chain: 'Starknet', regex: /\b0x0[0-9a-fA-F]{63}\b/g },
];


// ============================
// SCANNER TOGGLE
// ============================

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE_SCANNER') {
    scannerActive = !scannerActive;
    if (scannerActive) {
      scanPage();
    } else {
      clearHighlights();
    }
  }
});


// ============================
// SCAN PAGE
// ============================

function scanPage() {
  clearHighlights();
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script, style, textarea, input, and our own elements
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.classList?.contains(HIGHLIGHT_CLASS)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  let totalFound = 0;
  
  textNodes.forEach(textNode => {
    const text = textNode.textContent;
    let hasMatch = false;
    
    for (const pattern of SCAN_REGEX) {
      if (pattern.regex.test(text)) {
        hasMatch = true;
        break;
      }
      pattern.regex.lastIndex = 0; // Reset regex
    }
    
    if (!hasMatch) return;
    
    // Replace text node with highlighted version
    const fragment = document.createDocumentFragment();
    let remaining = text;
    let lastIndex = 0;
    
    // Find all matches
    const matches = [];
    for (const pattern of SCAN_REGEX) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        matches.push({
          chain: pattern.chain,
          address: match[0],
          index: match.index,
          length: match[0].length,
        });
      }
    }
    
    // Sort by position
    matches.sort((a, b) => a.index - b.index);
    
    // Deduplicate overlapping
    const filtered = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.index >= lastEnd) {
        filtered.push(m);
        lastEnd = m.index + m.length;
      }
    }
    
    totalFound += filtered.length;
    
    // Build fragment
    let pos = 0;
    for (const m of filtered) {
      // Text before match
      if (m.index > pos) {
        fragment.appendChild(document.createTextNode(remaining.substring(pos, m.index)));
      }
      
      // Highlighted address
      const span = document.createElement('span');
      span.className = HIGHLIGHT_CLASS;
      span.textContent = m.address;
      span.style.borderBottomColor = CHAIN_COLORS[m.chain] || '#3b82f6';
      span.dataset.chain = m.chain;
      span.dataset.address = m.address;
      
      // Add tooltip on hover
      span.addEventListener('mouseenter', showTooltip);
      span.addEventListener('mouseleave', hideTooltip);
      span.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(m.address);
        showCopiedFlash(span);
      });
      
      fragment.appendChild(span);
      pos = m.index + m.length;
    }
    
    // Remaining text
    if (pos < remaining.length) {
      fragment.appendChild(document.createTextNode(remaining.substring(pos)));
    }
    
    textNode.parentNode.replaceChild(fragment, textNode);
  });
  
  // Send count to background for badge
  chrome.runtime.sendMessage({ type: 'SCAN_COUNT', count: totalFound });
}


// ============================
// TOOLTIPS
// ============================

function showTooltip(e) {
  const el = e.target;
  const existing = document.querySelector('.' + TOOLTIP_CLASS);
  if (existing) existing.remove();
  
  const tip = document.createElement('div');
  tip.className = TOOLTIP_CLASS;
  tip.innerHTML = `
    <strong>${el.dataset.chain}</strong>
    <span>${truncAddr(el.dataset.address)}</span>
    <em>Click to copy</em>
  `;
  
  document.body.appendChild(tip);
  
  const rect = el.getBoundingClientRect();
  tip.style.left = rect.left + 'px';
  tip.style.top = (rect.bottom + window.scrollY + 6) + 'px';
}

function hideTooltip() {
  const tip = document.querySelector('.' + TOOLTIP_CLASS);
  if (tip) tip.remove();
}

function showCopiedFlash(el) {
  el.classList.add('aio-copied');
  setTimeout(() => el.classList.remove('aio-copied'), 1000);
}


// ============================
// CLEAR
// ============================

function clearHighlights() {
  document.querySelectorAll('.' + HIGHLIGHT_CLASS).forEach(el => {
    el.replaceWith(document.createTextNode(el.textContent));
  });
  document.querySelectorAll('.' + TOOLTIP_CLASS).forEach(el => el.remove());
  chrome.runtime.sendMessage({ type: 'SCAN_COUNT', count: 0 });
}


// ============================
// HELPERS
// ============================

function truncAddr(addr) {
  if (addr.length <= 16) return addr;
  return addr.slice(0, 8) + '...' + addr.slice(-6);
}
