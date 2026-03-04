/**
 * i18n.js — Multi-language Translation Engine
 * 
 * Cara kerja:
 * 1. Load file bahasa dari /lang/{code}.json
 * 2. Simpan pilihan di localStorage('lang')
 * 3. Apply translations ke elemen dengan data-i18n="key.path"
 * 4. Expose t('key.path') untuk JS dynamic content
 * 
 * Supported languages: EN (English), ID (Bahasa Indonesia)
 * 
 * Usage di HTML:
 *   <h1 data-i18n="hero.title">Web3 Wallet Generator</h1>
 *   <p data-i18n="hero.subtitle">...</p>
 * 
 * Usage di JS:
 *   const label = t('common.copy'); // "Copy" or "Salin"
 */

const I18N = {
  langs: {
    en: { label: 'EN', flag: '🇺🇸' },
    id: { label: 'ID', flag: '🇮🇩' },
  },
  current: 'en',
  data: {},
};

/**
 * Inisialisasi i18n:
 * - Cek localStorage untuk bahasa terakhir
 * - Load translation file
 * - Apply ke semua data-i18n elements
 */
async function initI18n() {
  const saved = localStorage.getItem('lang');
  I18N.current = saved && I18N.langs[saved] ? saved : 'en';
  await loadLang(I18N.current);
  applyTranslations();
}

/**
 * Load translation JSON file
 */
async function loadLang(code) {
  try {
    const resp = await fetch(`/lang/${code}.json`);
    I18N.data = await resp.json();
    I18N.current = code;
  } catch {
    // Fallback to English if load fails
    if (code !== 'en') {
      const resp = await fetch('/lang/en.json');
      I18N.data = await resp.json();
      I18N.current = 'en';
    }
  }
}

/**
 * Apply translations ke semua elemen yang punya data-i18n
 * 
 * Contoh: <h1 data-i18n="hero.title"> 
 * → ambil I18N.data.hero.title → set textContent
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getNestedValue(I18N.data, key);
    if (val) {
      // Check if it's a placeholder attribute
      if (el.hasAttribute('data-i18n-attr')) {
        el.setAttribute(el.getAttribute('data-i18n-attr'), val);
      } else {
        el.textContent = val;
      }
    }
  });
  
  // Update lang switcher active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === I18N.current);
  });
}

/**
 * t('key.path') — Get translation value for JS usage
 * Returns the string, or the key itself if not found
 */
function t(key) {
  return getNestedValue(I18N.data, key) || key;
}

/**
 * Switch language and reload translations
 */
async function switchLang(code) {
  if (!I18N.langs[code]) return;
  localStorage.setItem('lang', code);
  await loadLang(code);
  applyTranslations();
}

/**
 * Helper: get nested value from object by dot path
 * e.g. getNestedValue({a: {b: 'hello'}}, 'a.b') → 'hello'
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

// Auto-init when script loads
initI18n();
