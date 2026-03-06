/**
 * circuit-bg.js — Fleek.sh-inspired Circuit Flow Animation
 * 
 * PENJELASAN:
 * Animasi background sirkuit dengan titik cahaya bergerak.
 * Versi ini pakai requestAnimationFrame (bukan CSS offset-path)
 * untuk kompatibilitas browser yang lebih baik.
 * 
 * Cara kerja:
 * 1. SVG menggambar kotak-kotak (blocks) dan garis penghubung
 * 2. Titik cahaya (dots) dipindahkan secara manual via JS
 *    di sepanjang waypoints dari path
 * 3. Setiap dot punya warna dan kecepatan berbeda
 */
(function() {
  const container = document.getElementById('circuit-bg');
  if (!container) return;

  const NS = 'http://www.w3.org/2000/svg';

  // ── Blocks: kotak-kotak sirkuit (persentase) ──
  const blocks = [
    { x: 3,  y: 8,  w: 25, h: 32 },
    { x: 30, y: 3,  w: 28, h: 26 },
    { x: 61, y: 6,  w: 20, h: 34 },
    { x: 84, y: 10, w: 14, h: 28 },
    { x: 2,  y: 50, w: 20, h: 38 },
    { x: 24, y: 44, w: 30, h: 30 },
    { x: 57, y: 48, w: 24, h: 34 },
    { x: 83, y: 42, w: 16, h: 40 },
  ];

  // ── Connections: hubungan antar block ──
  const connections = [
    [0,1], [1,2], [2,3],
    [0,4], [1,5], [2,6], [3,7],
    [4,5], [5,6], [6,7],
  ];

  // ── Dot configs ──
  const dotConfigs = [
    { color: '#22c55e', speed: 0.15 },   // hijau
    { color: '#3b82f6', speed: 0.12 },   // biru
    { color: '#f97316', speed: 0.18 },   // oranye
    { color: '#a855f7', speed: 0.10 },   // ungu
    { color: '#06b6d4', speed: 0.14 },   // cyan
  ];

  function build() {
    container.innerHTML = '';
    const W = container.offsetWidth || 1400;
    const H = container.offsetHeight || 400;

    // ── Create SVG ──
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    container.appendChild(svg);

    // ── Draw blocks ──
    blocks.forEach(b => {
      const px = (b.x / 100) * W;
      const py = (b.y / 100) * H;
      const pw = (b.w / 100) * W;
      const ph = (b.h / 100) * H;

      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', px);
      rect.setAttribute('y', py);
      rect.setAttribute('width', pw);
      rect.setAttribute('height', ph);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', 'rgba(0,0,0,0.09)');
      rect.setAttribute('stroke-width', '1');
      svg.appendChild(rect);

      // Corner nodes
      [[px,py],[px+pw,py],[px,py+ph],[px+pw,py+ph]].forEach(([cx,cy]) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', cx);
        c.setAttribute('cy', cy);
        c.setAttribute('r', '2');
        c.setAttribute('fill', 'rgba(0,0,0,0.12)');
        svg.appendChild(c);
      });
    });

    // ── Draw connections & gather waypoints ──
    const allPaths = [];
    connections.forEach(([a, b]) => {
      const ba = blocks[a], bb = blocks[b];
      const ax = ((ba.x + ba.w) / 100) * W;
      const ay = ((ba.y + ba.h / 2) / 100) * H;
      const bx = (bb.x / 100) * W;
      const by = ((bb.y + bb.h / 2) / 100) * H;
      const midX = (ax + bx) / 2;

      // Draw L-shape path
      const d = `M ${ax} ${ay} L ${midX} ${ay} L ${midX} ${by} L ${bx} ${by}`;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(0,0,0,0.07)');
      path.setAttribute('stroke-width', '1');
      svg.appendChild(path);

      // Waypoints for animation
      allPaths.push([
        { x: ax, y: ay },
        { x: midX, y: ay },
        { x: midX, y: by },
        { x: bx, y: by },
      ]);
    });

    // ── Create animated dots ──
    const dots = [];
    const shuffled = allPaths.sort(() => Math.random() - 0.5);

    dotConfigs.forEach((cfg, i) => {
      if (i >= shuffled.length) return;
      const waypoints = shuffled[i];

      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${cfg.color};
        box-shadow: 0 0 8px 3px ${cfg.color}, 0 0 20px 8px ${cfg.color}99, 0 0 40px 14px ${cfg.color}44;
        pointer-events: none;
        z-index: 2;
        transform: translate(-50%, -50%);
      `;
      container.appendChild(el);

      dots.push({
        el,
        waypoints,
        progress: Math.random(),     // mulai di posisi random
        speed: cfg.speed / 100,       // kecepatan per frame
        direction: 1,                 // 1 = maju, -1 = mundur
      });
    });

    return dots;
  }

  // ── Hitung posisi di sepanjang waypoints ──
  function getPosition(waypoints, t) {
    // Hitung total panjang path
    let totalLen = 0;
    const segLens = [];
    for (let i = 1; i < waypoints.length; i++) {
      const dx = waypoints[i].x - waypoints[i-1].x;
      const dy = waypoints[i].y - waypoints[i-1].y;
      const len = Math.sqrt(dx*dx + dy*dy);
      segLens.push(len);
      totalLen += len;
    }

    // Cari posisi pada t (0-1)
    let target = t * totalLen;
    for (let i = 0; i < segLens.length; i++) {
      if (target <= segLens[i]) {
        const ratio = target / segLens[i];
        return {
          x: waypoints[i].x + (waypoints[i+1].x - waypoints[i].x) * ratio,
          y: waypoints[i].y + (waypoints[i+1].y - waypoints[i].y) * ratio,
        };
      }
      target -= segLens[i];
    }
    return waypoints[waypoints.length - 1];
  }

  // ── Animation loop ──
  let dots = build();

  function animate() {
    dots.forEach(d => {
      d.progress += d.speed * d.direction;

      // Balik arah jika sudah sampai ujung
      if (d.progress >= 1) {
        d.progress = 1;
        d.direction = -1;
      } else if (d.progress <= 0) {
        d.progress = 0;
        d.direction = 1;
      }

      const pos = getPosition(d.waypoints, d.progress);
      d.el.style.left = pos.x + 'px';
      d.el.style.top = pos.y + 'px';
    });
    requestAnimationFrame(animate);
  }
  animate();

  // ── Responsive rebuild ──
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { dots = build(); }, 500);
  });
})();
