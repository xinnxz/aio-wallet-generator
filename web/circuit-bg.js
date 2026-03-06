/**
 * circuit-bg.js — Fleek.sh-inspired Circuit Flow Animation
 * 
 * PENJELASAN:
 * Animasi background yang menampilkan pola sirkuit (seperti PCB / circuit board)
 * dengan titik-titik cahaya berwarna yang bergerak mengikuti jalur.
 * 
 * Cara kerja:
 * 1. SVG dibuat dengan kotak-kotak (blocks) dihubungkan garis-garis tipis
 * 2. Setiap garis punya "dot" — titik cahaya kecil yang bergerak bolak-balik
 * 3. Dot punya efek glow (blur + opacity) menggunakan CSS filter
 * 4. Warna dot: hijau (#22c55e), biru (#3b82f6), oranye (#f97316)
 * 5. Semua animasi pakai CSS @keyframes — SANGAT ringan
 * 
 * Kenapa SVG + CSS, bukan Canvas?
 * - Lebih ringan (tidak perlu requestAnimationFrame loop)
 * - Lebih tajam di semua resolusi (vector-based)
 * - Tidak makan CPU/GPU seperti Canvas/WebGL
 * - Browser sudah sangat optimize CSS animations
 */
(function() {
  const container = document.getElementById('circuit-bg');
  if (!container) return;

  const W = container.offsetWidth || 1400;
  const H = container.offsetHeight || 340;

  // ── Konfigurasi Blocks ──
  // Block = kotak-kotak sirkuit yang muncul di background
  // Posisi dihitung sebagai persentase supaya responsif
  const blocks = [
    { x: 8,  y: 10, w: 22, h: 28 },
    { x: 33, y: 5,  w: 24, h: 22 },
    { x: 62, y: 8,  w: 18, h: 30 },
    { x: 84, y: 12, w: 14, h: 25 },
    { x: 5,  y: 50, w: 18, h: 35 },
    { x: 26, y: 45, w: 28, h: 28 },
    { x: 58, y: 48, w: 22, h: 30 },
    { x: 83, y: 42, w: 15, h: 38 },
  ];

  // ── SVG namespace ──
  const NS = 'http://www.w3.org/2000/svg';

  function createSVG() {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;';

    // Defs for glow filter
    const defs = document.createElementNS(NS, 'defs');
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', 'glow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3');
    blur.setAttribute('result', 'glow');
    const merge = document.createElementNS(NS, 'feMerge');
    const n1 = document.createElementNS(NS, 'feMergeNode');
    n1.setAttribute('in', 'glow');
    const n2 = document.createElementNS(NS, 'feMergeNode');
    n2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(n1);
    merge.appendChild(n2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    return svg;
  }

  // ── Draw blocks (kotak sirkuit) ──
  function drawBlocks(svg) {
    blocks.forEach(b => {
      const rect = document.createElementNS(NS, 'rect');
      const px = (b.x / 100) * W;
      const py = (b.y / 100) * H;
      const pw = (b.w / 100) * W;
      const ph = (b.h / 100) * H;
      rect.setAttribute('x', px);
      rect.setAttribute('y', py);
      rect.setAttribute('width', pw);
      rect.setAttribute('height', ph);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', 'rgba(255,255,255,0.07)');
      rect.setAttribute('stroke-width', '1');

      // Corner dots (node titik di sudut kotak)
      const corners = [
        [px, py], [px + pw, py],
        [px, py + ph], [px + pw, py + ph]
      ];
      corners.forEach(([cx, cy]) => {
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', '2');
        dot.setAttribute('fill', 'rgba(255,255,255,0.12)');
        svg.appendChild(dot);
      });

      svg.appendChild(rect);
    });
  }

  // ── Draw connection lines between blocks ──
  function drawConnections(svg) {
    const paths = [];
    // Hubungkan block-block yang berdekatan dengan garis
    const connections = [
      [0, 1], [1, 2], [2, 3],
      [0, 4], [1, 5], [2, 6], [3, 7],
      [4, 5], [5, 6], [6, 7],
    ];

    connections.forEach(([a, b]) => {
      const ba = blocks[a];
      const bb = blocks[b];
      // Titik tengah sisi kanan block A → titik tengah sisi kiri block B
      const ax = ((ba.x + ba.w) / 100) * W;
      const ay = ((ba.y + ba.h / 2) / 100) * H;
      const bx = (bb.x / 100) * W;
      const by = ((bb.y + bb.h / 2) / 100) * H;

      // Buat path dengan L-shape (garis siku)
      const midX = (ax + bx) / 2;
      const d = `M ${ax} ${ay} L ${midX} ${ay} L ${midX} ${by} L ${bx} ${by}`;

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(255,255,255,0.06)');
      path.setAttribute('stroke-width', '1');
      svg.appendChild(path);
      paths.push({ el: path, d });
    });

    return paths;
  }

  // ── Create animated dots ──
  function createDots(paths) {
    const colors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#06b6d4'];
    // Pilih beberapa path secara random untuk dots
    const dotCount = Math.min(5, paths.length);
    const selectedPaths = paths.sort(() => Math.random() - 0.5).slice(0, dotCount);

    selectedPaths.forEach((p, i) => {
      const dot = document.createElement('div');
      dot.className = 'circuit-dot';
      const color = colors[i % colors.length];
      const duration = 6 + Math.random() * 8; // 6-14 detik per cycle
      const delay = Math.random() * -10; // mulai di posisi random

      dot.style.cssText = `
        --dot-color: ${color};
        offset-path: path("${p.d}");
        animation: circuitPathLoop ${duration}s linear ${delay}s infinite alternate;
      `;
      container.appendChild(dot);
    });
  }

  // ── Build everything ──
  const svg = createSVG();
  drawBlocks(svg);
  const paths = drawConnections(svg);
  container.appendChild(svg);
  createDots(paths);

  // ── Responsive: rebuild on resize ──
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Recalculate dimensions
      container.innerHTML = '';
      const newSvg = createSVG();
      drawBlocks(newSvg);
      const newPaths = drawConnections(newSvg);
      container.appendChild(newSvg);
      createDots(newPaths);
    }, 500);
  });
})();
