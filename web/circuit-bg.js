/**
 * circuit-bg.js — Circuit Flow Animation (SVG-only approach)
 * 
 * SEMUA elemen (blocks, lines, dots) ada di dalam SVG yang sama.
 * Ini menghindari masalah coordinate mismatch antara HTML divs dan SVG viewBox.
 * 
 * Dots dianimasikan via requestAnimationFrame mengubah cx/cy attributes.
 */
(function() {
  const container = document.getElementById('circuit-bg');
  if (!container) return;

  const NS = 'http://www.w3.org/2000/svg';

  // Ukuran viewBox (fixed, lalu SVG di-stretch ke container)
  const VW = 1400;
  const VH = 500;

  // ── Block positions (dalam viewBox units) ──
  const blocks = [
    { x: 40,  y: 30,  w: 320, h: 160 },
    { x: 400, y: 15,  w: 360, h: 130 },
    { x: 820, y: 25,  w: 280, h: 170 },
    { x: 1150,y: 50,  w: 210, h: 140 },
    { x: 25,  y: 250, w: 280, h: 190 },
    { x: 340, y: 220, w: 400, h: 150 },
    { x: 790, y: 240, w: 320, h: 170 },
    { x: 1160,y: 210, w: 220, h: 200 },
  ];

  // ── Connections between blocks ──
  const connections = [
    [0,1], [1,2], [2,3],
    [0,4], [1,5], [2,6], [3,7],
    [4,5], [5,6], [6,7],
  ];

  // ── Dot configs ──
  const dotColors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#06b6d4'];
  const dotSpeeds = [0.0012, 0.0009, 0.0015, 0.0008, 0.0011];

  // Create SVG
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

  // ── Defs: glow filter ──
  const defs = document.createElementNS(NS, 'defs');
  dotColors.forEach((color, i) => {
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', `glow${i}`);
    filter.setAttribute('x', '-200%');
    filter.setAttribute('y', '-200%');
    filter.setAttribute('width', '500%');
    filter.setAttribute('height', '500%');

    const flood = document.createElementNS(NS, 'feFlood');
    flood.setAttribute('flood-color', color);
    flood.setAttribute('flood-opacity', '0.8');
    flood.setAttribute('result', 'flood');

    const composite = document.createElementNS(NS, 'feComposite');
    composite.setAttribute('in', 'flood');
    composite.setAttribute('in2', 'SourceGraphic');
    composite.setAttribute('operator', 'in');
    composite.setAttribute('result', 'mask');

    const blur1 = document.createElementNS(NS, 'feGaussianBlur');
    blur1.setAttribute('in', 'mask');
    blur1.setAttribute('stdDeviation', '6');
    blur1.setAttribute('result', 'glow1');

    const blur2 = document.createElementNS(NS, 'feGaussianBlur');
    blur2.setAttribute('in', 'mask');
    blur2.setAttribute('stdDeviation', '14');
    blur2.setAttribute('result', 'glow2');

    const merge = document.createElementNS(NS, 'feMerge');
    ['glow2', 'glow1', 'SourceGraphic'].forEach(inp => {
      const node = document.createElementNS(NS, 'feMergeNode');
      node.setAttribute('in', inp);
      merge.appendChild(node);
    });

    filter.appendChild(flood);
    filter.appendChild(composite);
    filter.appendChild(blur1);
    filter.appendChild(blur2);
    filter.appendChild(merge);
    defs.appendChild(filter);
  });
  svg.appendChild(defs);

  // ── Draw blocks ──
  blocks.forEach(b => {
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', b.x);
    rect.setAttribute('y', b.y);
    rect.setAttribute('width', b.w);
    rect.setAttribute('height', b.h);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'rgba(0,0,0,0.08)');
    rect.setAttribute('stroke-width', '1');
    svg.appendChild(rect);

    // Corner nodes
    [[b.x, b.y], [b.x+b.w, b.y], [b.x, b.y+b.h], [b.x+b.w, b.y+b.h]].forEach(([cx, cy]) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', '2.5');
      c.setAttribute('fill', 'rgba(0,0,0,0.1)');
      svg.appendChild(c);
    });
  });

  // ── Draw connections & build waypoints ──
  const allWaypoints = [];
  connections.forEach(([a, b]) => {
    const ba = blocks[a], bb = blocks[b];
    const ax = ba.x + ba.w;
    const ay = ba.y + ba.h / 2;
    const bx = bb.x;
    const by = bb.y + bb.h / 2;
    const midX = (ax + bx) / 2;

    const d = `M ${ax} ${ay} L ${midX} ${ay} L ${midX} ${by} L ${bx} ${by}`;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(0,0,0,0.06)');
    path.setAttribute('stroke-width', '1');
    svg.appendChild(path);

    allWaypoints.push([
      { x: ax, y: ay },
      { x: midX, y: ay },
      { x: midX, y: by },
      { x: bx, y: by },
    ]);
  });

  // ── Create dot circles (INSIDE SVG) ──
  const shuffled = [...allWaypoints].sort(() => Math.random() - 0.5);
  const dots = [];

  dotColors.forEach((color, i) => {
    if (i >= shuffled.length) return;
    const waypoints = shuffled[i];

    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', color);
    circle.setAttribute('filter', `url(#glow${i})`);
    svg.appendChild(circle);

    dots.push({
      el: circle,
      waypoints,
      progress: Math.random(),
      speed: dotSpeeds[i],
      direction: 1,
    });
  });

  container.appendChild(svg);

  // ── Position along waypoints ──
  function getPos(wp, t) {
    let totalLen = 0;
    const segLens = [];
    for (let i = 1; i < wp.length; i++) {
      const dx = wp[i].x - wp[i-1].x;
      const dy = wp[i].y - wp[i-1].y;
      segLens.push(Math.sqrt(dx*dx + dy*dy));
      totalLen += segLens[segLens.length - 1];
    }
    let target = t * totalLen;
    for (let i = 0; i < segLens.length; i++) {
      if (target <= segLens[i]) {
        const r = target / segLens[i];
        return {
          x: wp[i].x + (wp[i+1].x - wp[i].x) * r,
          y: wp[i].y + (wp[i+1].y - wp[i].y) * r,
        };
      }
      target -= segLens[i];
    }
    return wp[wp.length - 1];
  }

  // ── Animate ──
  function animate() {
    dots.forEach(d => {
      d.progress += d.speed * d.direction;
      if (d.progress >= 1) { d.progress = 1; d.direction = -1; }
      else if (d.progress <= 0) { d.progress = 0; d.direction = 1; }

      const pos = getPos(d.waypoints, d.progress);
      d.el.setAttribute('cx', pos.x);
      d.el.setAttribute('cy', pos.y);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();
