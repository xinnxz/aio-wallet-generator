/**
 * nav.js — AIO Chain Navigation
 *
 * DESAIN: Terinspirasi dari Linear, Stripe, dan Caldera Docs
 * - Text-only menu items, TANPA ikon dekoratif
 * - Mega dropdown dengan label + deskripsi saja
 * - Ikon hanya untuk fungsi: logo, GitHub, dark mode
 * - Natural, tidak kaku, tidak "AI generated"
 */
(function() {
  const path = location.pathname;
  const page = path.split('/').pop() || 'index.html';

  // ── Menu Structure ──
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
            { href: '/chains.html',   label: 'Chains',        desc: '30+ supported networks',   match: ['chains.html'] },
            { href: '/security.html', label: 'Security',      desc: 'Security model & audit',   match: ['security.html'] },
            { href: '/plugins.html',  label: 'Plugins',       desc: 'Extend with custom chains', match: ['plugins.html'] },
          ]
        }
      ]
    }
  };

  function isActive(matches) { return matches.includes(page); }

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
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) document.documentElement.setAttribute('data-theme', 'dark');

  // Build dropdown HTML — TEXT ONLY, no icons
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
                  <span class="mega-item-label">${item.label}</span>
                  <span class="mega-item-desc">${item.desc}</span>
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
      <a href="/" class="nav-brand">AIO Chain</a>

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
    document.getElementById('dark-icon').innerHTML = next === 'dark'
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    localStorage.setItem('theme', next);
  });

  // ── Hamburger ──
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
    document.getElementById('hamburger').classList.toggle('active');
  });

  // ── Mega Dropdown Logic ──
  const groups = document.querySelectorAll('.nav-group');
  groups.forEach(group => {
    let timeout;
    const btn = group.querySelector('.nav-group-btn');
    const dropdown = group.querySelector('.mega-dropdown');

    group.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      groups.forEach(g => { if (g !== group) g.querySelector('.mega-dropdown').classList.remove('mega-open'); });
      dropdown.classList.add('mega-open');
      btn.classList.add('nav-group-hover');
    });

    group.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        dropdown.classList.remove('mega-open');
        btn.classList.remove('nav-group-hover');
      }, 150);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('mega-open');
      groups.forEach(g => g.querySelector('.mega-dropdown').classList.remove('mega-open'));
      if (!isOpen) dropdown.classList.add('mega-open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) {
      groups.forEach(g => {
        g.querySelector('.mega-dropdown').classList.remove('mega-open');
        g.querySelector('.nav-group-btn').classList.remove('nav-group-hover');
      });
    }
  });
})();
