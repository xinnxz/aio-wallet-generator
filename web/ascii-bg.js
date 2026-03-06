/**
 * ASCII Art Transition — Hiro.so-inspired
 * 
 * PENJELASAN:
 * Membuat band ASCII art antara section form dan trust section.
 * 
 * Cara kerja:
 * 1. Band terdiri dari ~15-20 baris karakter
 * 2. Baris atas = jarang (titik, spasi) → baris bawah = padat (#, *, |, /, B)
 * 3. Ada animasi CONTINUOUS — karakter berganti secara random (seperti matrix/typing)
 * 4. Warna biru accent, opacity rendah
 * 
 * Ini disebut "density gradient" — visual density meningkat dari atas ke bawah,
 * membuat efek transisi halus dari konten terang ke section gelap (trust).
 */
(function() {
  const el = document.getElementById('ascii-canvas');
  if (!el) return;

  // Character pools by density level
  const pools = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', '·', ' ', ' ', '.'],
    [' ', ' ', ' ', ' ', '.', '·', ':', ' ', '.', ':', ' '],
    [' ', ' ', '.', '·', ':', '|', '/', '.', ':', '*', ' '],
    [' ', '.', ':', '|', '/', '*', '·', ':', '/', '|', '.', ':'],
    ['.', ':', '|', '/', '*', ':', '·', ':', '/', '·', '|', '*'],
    [':', '|', '/', '#', '*', '|', '/', ':', '#', '·', '*', ':', '|'],
    [':', '|', '/', '#', '*', '|', '/', ':', '#', '|', '*', '"', 'B', '|', '#', '/', '*'],
    ['#', '|', '/', '#', '*', '/', '#', '|', '*', '"', 'B', '#', '|', '/', '#', '*', '/', '#']
  ];

  const ROWS = 18;
  let cols = 0;
  let grid = [];  // 2D array of characters

  function calcCols() {
    cols = Math.ceil(window.innerWidth / 7.2);
  }

  // Generate initial grid
  function buildGrid() {
    calcCols();
    grid = [];
    for (let y = 0; y < ROWS; y++) {
      const row = [];
      const progress = y / (ROWS - 1);  // 0 top .. 1 bottom
      const levelIdx = Math.min(pools.length - 1, Math.floor(progress * pools.length));
      const pool = pools[levelIdx];

      for (let x = 0; x < cols; x++) {
        row.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      grid.push(row);
    }
  }

  // Render grid to element
  function render() {
    el.textContent = grid.map(row => row.join('')).join('\n');
  }

  // Animate: randomly mutate characters continuously
  function animate() {
    // Each frame, mutate ~3-5% of all characters
    const totalCells = ROWS * cols;
    const mutations = Math.max(10, Math.floor(totalCells * 0.04));

    for (let i = 0; i < mutations; i++) {
      const y = Math.floor(Math.random() * ROWS);
      const x = Math.floor(Math.random() * cols);
      const progress = y / (ROWS - 1);
      const levelIdx = Math.min(pools.length - 1, Math.floor(progress * pools.length));
      const pool = pools[levelIdx];
      grid[y][x] = pool[Math.floor(Math.random() * pool.length)];
    }

    render();
    requestAnimationFrame(animate);
  }

  // Init
  buildGrid();
  render();

  // Start continuous animation after brief delay
  setTimeout(() => requestAnimationFrame(animate), 500);

  // Rebuild on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildGrid();
      render();
    }, 300);
  });
})();
