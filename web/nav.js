/**
 * nav.js — AIO Chain Mega Navigation
 * 
 * PENJELASAN ARSITEKTUR:
 * Nav didesain dengan struktur mega dropdown seperti dapugiftstudio.com:
 * - Logo (kiri), Menu Groups (tengah), Actions (kanan)
 * - Menu "Tools" punya mega dropdown multi-kolom
 * - Menu "Learn" punya mini dropdown
 * - Smooth show/hide animations
 * - Mobile: full-screen slide-in menu
 */
(function() {
  const path = location.pathname;
  const page = path.split('/').pop() || 'index.html';

  // ── Menu Structure ──
  // Grouped into logical categories for mega dropdown
  const menuGroups = {
    tools: {
      label: 'Tools',
      columns: [
        {
          title: 'GENERATE',
          items: [
            { href: '/',               label: 'Wallet Generator', desc: 'Multi-chain wallet creation', match: ['', 'index.html'] },
            { href: '/hdwallet.html',   label: 'HD Wallet',       desc: 'BIP39/44 hierarchical keys', match: ['hdwallet.html'] },
            { href: '/bulktools.html',  label: 'Bulk Tools',      desc: 'Generate up to 100K wallets', match: ['bulktools.html'] },
            { href: '/paperwallet.html',label: 'Paper Wallet',    desc: 'Printable cold storage',     match: ['paperwallet.html'] },
          ]
        },
        {
          title: 'UTILITIES',
          items: [
            { href: '/validator.html',  label: 'Validator',   desc: 'Check address validity',   match: ['validator.html'] },
            { href: '/converter.html',  label: 'Converter',   desc: 'Format & encoding tools',  match: ['converter.html'] },
            { href: '/encrypt.html',    label: 'Encrypt',     desc: 'AES-256 file encryption',  match: ['encrypt.html'] },
            { href: '/qrcode.html',     label: 'QR Code',     desc: 'Generate & scan QR codes', match: ['qrcode.html'] },
          ]
        }
      ]
    },
    learn: {
      label: 'Learn',
      columns: [
        {
          title: 'RESOURCES',
          items: [
            { href: '/docs.html',     label: 'Documentation', desc: 'Guides & API reference',   match: ['docs.html'] },
            { href: '/chains.html',   label: 'Chains',        desc: '30+ supported networks', match: ['chains.html'] },
            { href: '/security.html', label: 'Security',      desc: 'Security model & audit',   match: ['security.html'] },
            { href: '/plugins.html',  label: 'Plugins',       desc: 'Extend with custom chains', match: ['plugins.html'] },
          ]
        }
      ]
    }
  };

  // ── Detect Active ──
  function isActive(matches) {
    return matches.includes(page);
  }

  function getActiveGroup() {
    for (const [key, group] of Object.entries(menuGroups)) {
      for (const col of group.columns) {
        for (const item of col.items) {
          if (isActive(item.match)) return key;
        }
      }
    }
    return null;
  }

  const activeGroup = getActiveGroup();

  // ── SVG Icons for menu items ──
  const menuIcons = {
    'Wallet Generator': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20"/><circle cx="17" cy="15" r="1.5"/></svg>',
    'HD Wallet':        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><path d="M6 12h12"/><path d="M8 17l-4-4"/><path d="M16 17l4-4"/></svg>',
    'Bulk Tools':       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    'Paper Wallet':     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    'Validator':        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'Converter':        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    'Encrypt':          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    'QR Code':          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4" rx="0.5"/><line x1="22" y1="14" x2="22" y2="22"/><line x1="14" y1="22" x2="22" y2="22"/></svg>',
    'Documentation':    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    'Chains':           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    'Security':         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'Plugins':          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17h7"/><path d="M17.5 14v7"/></svg>',
  };

  function getIcon(label) {
    return menuIcons[label] || '';
  }

  // ── Build Nav ──
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) document.documentElement.setAttribute('data-theme', 'dark');

  // Build dropdown HTML
  function buildDropdown(group, key) {
    const isSingle = group.columns.length === 1;
    return `
      <div class="mega-dropdown ${isSingle ? 'mega-mini' : ''}" id="dropdown-${key}">
        <div class="mega-inner">
          ${group.columns.map(col => `
            <div class="mega-col">
              <div class="mega-col-title">${col.title}</div>
              ${col.items.map(item => `
                <a href="${item.href}" class="mega-item ${isActive(item.match) ? 'mega-active' : ''}">
                  <span class="mega-item-icon">${getIcon(item.label)}</span>
                  <div>
                    <div class="mega-item-label">${item.label}</div>
                    <div class="mega-item-desc">${item.desc}</div>
                  </div>
                </a>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <div class="mega-gradient-line"></div>
      </div>
    `;
  }

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/" class="nav-brand">
        <svg class="nav-logo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="3"/>
          <path d="M2 10h20"/>
          <circle cx="17" cy="15" r="1.5"/>
        </svg>
        <span>AIO Chain</span>
      </a>

      <div class="nav-center">
        ${Object.entries(menuGroups).map(([key, group]) => `
          <div class="nav-group" data-group="${key}">
            <button class="nav-group-btn ${activeGroup === key ? 'nav-group-active' : ''}">
              ${group.label}
              <svg class="nav-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            ${buildDropdown(group, key)}
          </div>
        `).join('')}
      </div>

      <div class="nav-right">
        <a href="https://github.com/xinnxz/aio-wallet-generator" class="nav-github" target="_blank" title="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
        <button class="nav-toggle" id="dark-toggle" title="Toggle dark mode">
          <svg id="dark-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${isDark
              ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
              : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'}
          </svg>
        </button>
        <button class="nav-hamburger" id="hamburger" title="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="nav-mobile" id="mobile-menu">
      ${Object.entries(menuGroups).map(([key, group]) => `
        <div class="mob-group">
          <div class="mob-group-title">${group.label}</div>
          ${group.columns.map(col => `
            ${col.items.map(item => `
              <a href="${item.href}" class="mob-link ${isActive(item.match) ? 'mob-active' : ''}">
                <span class="mob-icon">${getIcon(item.label)}</span>
                ${item.label}
              </a>
            `).join('')}
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;

  // ── Dark Mode Toggle ──
  document.getElementById('dark-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    const icon = document.getElementById('dark-icon');
    icon.innerHTML = next === 'dark'
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    localStorage.setItem('theme', next);
  });

  // ── Hamburger (Mobile) ──
  document.getElementById('hamburger').addEventListener('click', () => {
    const mobile = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger');
    mobile.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // ── Mega Dropdown Hover Logic ──
  const groups = document.querySelectorAll('.nav-group');
  groups.forEach(group => {
    let timeout;
    const btn = group.querySelector('.nav-group-btn');
    const dropdown = group.querySelector('.mega-dropdown');

    // Desktop: hover to open
    group.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      // Close other dropdowns first
      groups.forEach(g => {
        if (g !== group) g.querySelector('.mega-dropdown').classList.remove('mega-open');
      });
      dropdown.classList.add('mega-open');
      btn.classList.add('nav-group-hover');
    });

    group.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        dropdown.classList.remove('mega-open');
        btn.classList.remove('nav-group-hover');
      }, 150);
    });

    // Also toggle on click for touch
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('mega-open');
      groups.forEach(g => {
        g.querySelector('.mega-dropdown').classList.remove('mega-open');
      });
      if (!isOpen) dropdown.classList.add('mega-open');
    });
  });

  // Close dropdowns on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) {
      groups.forEach(g => {
        g.querySelector('.mega-dropdown').classList.remove('mega-open');
        g.querySelector('.nav-group-btn').classList.remove('nav-group-hover');
      });
    }
  });
})();
