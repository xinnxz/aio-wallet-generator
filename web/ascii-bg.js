/**
 * ASCII Art Background — Hiro.so-inspired
 * 
 * PENJELASAN:
 * Ini membuat background ASCII art di hero section yang mirip hiro.so.
 * 
 * Cara kerjanya:
 * 1. Bagian ATAS hero = karakter jarang, simple (titik, titik dua)
 * 2. Bagian BAWAH hero = karakter padat, kompleks (#, *, B, |/|)
 * 3. Ada animasi "typing" — karakter muncul satu per satu dari atas ke bawah
 * 4. Warna: biru accent (opacity rendah supaya tidak mengganggu teks)
 */
(function() {
  const el = document.getElementById('hero-ascii');
  if (!el) return;

  // Character pools by complexity level (0 = simplest, 4 = densest)
  const pools = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', '·'],           // Level 0: very sparse
    [' ', ' ', ' ', '.', '·', ':', ' ', '.', ' '],            // Level 1: sparse dots
    [' ', '.', ':', '·', '|', '/', ':', '.', '*', ' '],       // Level 2: mixed
    [':', '|', '/', '.', '·', ':', '/', '|', '*', ':', '·'],  // Level 3: dense
    [':', '|', '/', '#', '*', '|', '/', ':', '#', '|', '*', '"', '/', '|', '#', '#'] // Level 4: very dense
  ];

  function generate() {
    const charW = 7.6;   // approx char width in 13px monospace
    const lineH = 18.2;  // approx line height at 13px * 1.4
    const cols = Math.ceil(window.innerWidth / charW);
    const rows = Math.ceil(el.parentElement.offsetHeight / lineH);
    const lines = [];

    for (let y = 0; y < rows; y++) {
      let line = '';
      // Progress 0..1 from top to bottom
      const progress = y / Math.max(rows - 1, 1);
      
      // Level increases with progress: top=0, bottom=4
      const level = Math.min(4, Math.floor(progress * 5));
      const pool = pools[level];
      
      // Density also increases: top ~15%, bottom ~85%
      const density = 0.12 + progress * 0.7;

      for (let x = 0; x < cols; x++) {
        if (Math.random() < density) {
          line += pool[Math.floor(Math.random() * pool.length)];
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    return lines;
  }

  // Animate: type in rows progressively
  function animateIn() {
    const lines = generate();
    el.textContent = '';
    
    // Reveal rows with staggered timing
    let currentRow = 0;
    const totalRows = lines.length;
    
    function revealRow() {
      if (currentRow >= totalRows) return;
      
      // Add 3-5 rows per frame for speed
      const batchSize = Math.max(2, Math.floor(totalRows / 30));
      const endRow = Math.min(currentRow + batchSize, totalRows);
      
      el.textContent = lines.slice(0, endRow).join('\n');
      currentRow = endRow;
      
      if (currentRow < totalRows) {
        requestAnimationFrame(revealRow);
      }
    }
    
    // Start animation after a short delay
    setTimeout(() => requestAnimationFrame(revealRow), 400);
  }

  animateIn();

  // Regenerate on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(animateIn, 300);
  });
})();
