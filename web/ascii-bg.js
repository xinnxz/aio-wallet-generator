/**
 * ASCII Art Background Generator
 * Generates random ASCII pattern for the hero section (Hiro.so inspired)
 */
(function() {
  const chars = '/ : . · | / : * . / : . * : · / . : / * · : . / | : · * . / : . · | : * / . : · | / * . :';
  const el = document.getElementById('hero-ascii');
  if (!el) return;

  function generate() {
    const w = Math.ceil(window.innerWidth / 7.8);   // ~char width at 13px mono
    const h = Math.ceil(window.innerHeight / 18.2);  // ~line height at 13px * 1.4
    const lines = [];

    for (let y = 0; y < h; y++) {
      let line = '';
      for (let x = 0; x < w; x++) {
        // Sparse: ~40% chance of a character, rest spaces
        if (Math.random() < 0.38) {
          const pool = chars.split(' ');
          line += pool[Math.floor(Math.random() * pool.length)];
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    el.textContent = lines.join('\n');
  }

  generate();

  // Regenerate on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(generate, 300);
  });
})();
