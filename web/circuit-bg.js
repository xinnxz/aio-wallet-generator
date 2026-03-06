/**
 * circuit-bg.js — Circuit Flow Animation (Simplified, Reliable)
 * 
 * Uses simple SVG circles with opacity (no complex filters).
 * All coordinates in viewBox space. Animation via requestAnimationFrame.
 */
(function() {
  const container = document.getElementById('circuit-bg');
  if (!container) return;

  const NS = 'http://www.w3.org/2000/svg';
  const VW = 1400, VH = 500;

  // Block positions
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

  const connections = [
    [0,1],[1,2],[2,3],
    [0,4],[1,5],[2,6],[3,7],
    [4,5],[5,6],[6,7],
  ];

  const dotCfg = [
    { color: '#22c55e', speed: 0.003 },
    { color: '#3b82f6', speed: 0.002 },
    { color: '#f97316', speed: 0.004 },
    { color: '#a855f7', speed: 0.0025 },
    { color: '#06b6d4', speed: 0.003 },
  ];

  // ── Create SVG ──
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible;';

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
    [[b.x, b.y],[b.x+b.w, b.y],[b.x, b.y+b.h],[b.x+b.w, b.y+b.h]].forEach(([cx,cy]) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', '2');
      c.setAttribute('fill', 'rgba(0,0,0,0.1)');
      svg.appendChild(c);
    });
  });

  // ── Draw connections & build waypoints ──
  const allWaypoints = [];
  connections.forEach(([a, b]) => {
    const ba = blocks[a], bb = blocks[b];
    const ax = ba.x + ba.w, ay = ba.y + ba.h/2;
    const bx = bb.x, by = bb.y + bb.h/2;
    const midX = (ax + bx) / 2;

    const d = `M${ax},${ay} L${midX},${ay} L${midX},${by} L${bx},${by}`;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(0,0,0,0.06)');
    path.setAttribute('stroke-width', '1');
    svg.appendChild(path);

    allWaypoints.push([{x:ax,y:ay},{x:midX,y:ay},{x:midX,y:by},{x:bx,y:by}]);
  });

  // ── Create dots — SIMPLE approach: circle + larger blurred circle behind ──
  const shuffled = [...allWaypoints].sort(() => Math.random() - 0.5);
  const dots = [];

  dotCfg.forEach((cfg, i) => {
    if (i >= shuffled.length) return;
    const wp = shuffled[i];
    const startPos = getPos(wp, Math.random());

    // Outer glow (larger, blurred, semi-transparent)
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', startPos.x);
    glow.setAttribute('cy', startPos.y);
    glow.setAttribute('r', '30');
    glow.setAttribute('fill', cfg.color);
    glow.setAttribute('opacity', '0.35');
    svg.appendChild(glow);

    // Inner bright dot
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', startPos.x);
    dot.setAttribute('cy', startPos.y);
    dot.setAttribute('r', '7');
    dot.setAttribute('fill', cfg.color);
    dot.setAttribute('opacity', '0.9');
    svg.appendChild(dot);

    dots.push({
      dot, glow, waypoints: wp,
      progress: Math.random(),
      speed: cfg.speed,
      direction: 1,
    });
  });

  container.appendChild(svg);

  // ── Waypoint interpolation ──
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

  // ── Animation loop ──
  function animate() {
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      d.progress += d.speed * d.direction;
      if (d.progress >= 1) { d.progress = 1; d.direction = -1; }
      else if (d.progress <= 0) { d.progress = 0; d.direction = 1; }

      const pos = getPos(d.waypoints, d.progress);
      d.dot.setAttribute('cx', pos.x);
      d.dot.setAttribute('cy', pos.y);
      d.glow.setAttribute('cx', pos.x);
      d.glow.setAttribute('cy', pos.y);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
