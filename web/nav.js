/**
 * nav.js — Shared navigation component
 * Injected into all pages via <script src="nav.js">
 */
(function() {
  const path = location.pathname;
  const page = path.split('/').pop() || 'index.html';

  const links = [
    { href: '/',              label: 'GENERATE',   icon: 'hgi-play',                match: ['', 'index.html'] },
    { href: '/validator.html', label: 'VALIDATE',  icon: 'hgi-checkmark-circle-02', match: ['validator.html'] },
    { href: '/converter.html', label: 'CONVERT',   icon: 'hgi-exchange-01',         match: ['converter.html'] },
    { href: '/encrypt.html',   label: 'ENCRYPT',   icon: 'hgi-lock-key',            match: ['encrypt.html'] },
    { href: '/qrcode.html',    label: 'QR CODE',   icon: 'hgi-qr-code',             match: ['qrcode.html'] },
    { href: '/hdwallet.html',  label: 'HD WALLET', icon: 'hgi-tree-06',             match: ['hdwallet.html'] },
    { href: '/bulktools.html', label: 'BULK',      icon: 'hgi-layers-01',           match: ['bulktools.html'] },
    { href: '/paperwallet.html',label:'PAPER',     icon: 'hgi-printer',             match: ['paperwallet.html'] },
    { href: '/chains.html',    label: 'CHAINS',    icon: 'hgi-blockchain-06',       match: ['chains.html'] },
  ];

  const nav = document.getElementById('main-nav');
  if (!nav) return;

  // Detect dark mode
  const isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) document.documentElement.setAttribute('data-theme', 'dark');

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/" class="nav-brand">
        <i class="hgi-stroke hgi-wallet-03"></i>
        <span>AIO Wallet Generator</span>
      </a>
      <div class="nav-menu">
        ${links.map(l => {
          const active = l.match.includes(page) ? ' active' : '';
          return `<a href="${l.href}" class="nav-tool${active}"><i class="hgi-stroke ${l.icon}"></i>${l.label}</a>`;
        }).join('')}
      </div>
      <div class="nav-right">
        <button class="nav-toggle" id="dark-toggle" title="Toggle dark mode">
          <i class="hgi-stroke ${isDark ? 'hgi-sun-03' : 'hgi-moon-02'}" id="dark-icon"></i>
        </button>
        <button class="nav-hamburger" id="hamburger" title="Menu">
          <i class="hgi-stroke hgi-menu-02"></i>
        </button>
      </div>
    </div>
    <div class="nav-mobile" id="mobile-menu">
      ${links.map(l => {
        const active = l.match.includes(page) ? ' active' : '';
        return `<a href="${l.href}" class="nav-mobile-link${active}"><i class="hgi-stroke ${l.icon}"></i>${l.label}</a>`;
      }).join('')}
    </div>
  `;

  // Dark mode toggle
  document.getElementById('dark-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.getElementById('dark-icon').className = `hgi-stroke ${next === 'dark' ? 'hgi-sun-03' : 'hgi-moon-02'}`;
    localStorage.setItem('theme', next);
  });

  // Mobile hamburger
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
  });
})();
