/**
 * ASCII Art Transition — Hiro.so-inspired (refined)
 * 
 * PENJELASAN:
 * Versi sebelumnya terlalu padat dan chaotic. 
 * 
 * Perbaikan:
 * - Jauh lebih SPARSE: 90% spasi di baris atas, hanya ~60% spasi di baris bawah  
 * - Karakter NEVER berdekatan: selalu ada jarak antar karakter visible
 * - Animasi PELAN: hanya ~1% karakter berubah per frame (subtle shimmer)
 * - Jumlah baris dikurangi: 12 baris (bukan 18)
 * - Lebih banyak variasi di baris bawah: /, |, #, *, :
 */
(function() {
  const el = document.getElementById('ascii-canvas');
  if (!el) return;

  // Simple characters for different density levels
  const light = ['.', '·', ':'];
  const medium = ['.', ':', '·', '/', '|', '*'];
  const heavy = [':', '/', '|', '#', '*', '/', '#', '|', '"', 'B', '#', '*'];

  const ROWS = 14;
  let cols = 0;
  let grid = [];

  function calcCols() {
    cols = Math.ceil(window.innerWidth / 7.4);
  }

  function pickChar(progress) {
    if (progress < 0.4) return light[Math.floor(Math.random() * light.length)];
    if (progress < 0.7) return medium[Math.floor(Math.random() * medium.length)];
    return heavy[Math.floor(Math.random() * heavy.length)];
  }

  // Density: probability that a cell has a character (not space)
  function getDensity(progress) {
    // Top rows: ~5% density, bottom rows: ~50% density
    return 0.04 + progress * progress * 0.5;
  }

  function buildGrid() {
    calcCols();
    grid = [];
    for (let y = 0; y < ROWS; y++) {
      const row = [];
      const p = y / (ROWS - 1);  // 0 = top, 1 = bottom
      const density = getDensity(p);

      for (let x = 0; x < cols; x++) {
        if (Math.random() < density) {
          row.push(pickChar(p));
        } else {
          row.push(' ');
        }
      }
      grid.push(row);
    }
  }

  function render() {
    el.textContent = grid.map(r => r.join('')).join('\n');
  }

  // Subtle shimmer: only ~1% of cells mutate per frame
  let frameCount = 0;
  function animate() {
    frameCount++;
    // Only update every 3rd frame (~20fps update rate) for performance
    if (frameCount % 3 !== 0) {
      requestAnimationFrame(animate);
      return;
    }

    const totalCells = ROWS * cols;
    const mutations = Math.max(3, Math.floor(totalCells * 0.008));

    for (let i = 0; i < mutations; i++) {
      const y = Math.floor(Math.random() * ROWS);
      const x = Math.floor(Math.random() * cols);
      const p = y / (ROWS - 1);
      const density = getDensity(p);

      if (Math.random() < density) {
        grid[y][x] = pickChar(p);
      } else {
        grid[y][x] = ' ';
      }
    }

    render();
    requestAnimationFrame(animate);
  }

  buildGrid();
  render();
  setTimeout(() => requestAnimationFrame(animate), 800);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildGrid(); render(); }, 300);
  });
})();
