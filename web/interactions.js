/**
 * interactions.js — AIO Chain Creative Engine
 * 
 * PENJELASAN:
 * File ini menangani SEMUA efek interaktif di seluruh website.
 * Diload di setiap halaman untuk memberikan "feel" yang konsisten dan hidup.
 * 
 * Fitur:
 * 1. Scroll Reveal — elemen muncul dengan animasi saat di-scroll
 * 2. Custom Cursor — dot + ring yang mengikuti mouse
 * 3. Text Reveal — judul hero pecah per karakter, animasi wave
 * 4. Tilt Cards — kartu tilt mengikuti posisi mouse
 * 5. Floating Particles — canvas partikel di hero
 * 6. Magnetic Buttons — tombol "tertarik" ke cursor
 * 7. Smooth Counter — angka count-up untuk stats
 */

(function() {
  'use strict';

  // ─────────────────────────────────────────────
  // 1. SCROLL REVEAL
  // Elemen dengan [data-reveal] akan fade-in + slide-up
  // saat masuk viewport. Stagger delay via data-reveal-delay.
  // ─────────────────────────────────────────────
  function initScrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, +delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(el => observer.observe(el));
  }

  // ─────────────────────────────────────────────
  // 2. CUSTOM CURSOR
  // Dot kecil + ring besar yang follow mouse.
  // Berubah saat hover link/button (scale up ring).
  // Otomatis hidden di mobile/touch device.
  // ─────────────────────────────────────────────
  function initCustomCursor() {
    // Skip di touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    // Ring follows with easing (lag effect)
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effects on interactive elements
    const hoverTargets = 'a, button, [role="button"], input, select, textarea, .tilt-card, .bento-card, .trust-pill, .ptype-card, .bp-card, .ext-feat, .nav-tool';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        dot.classList.add('cursor-hover');
        ring.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        dot.classList.remove('cursor-hover');
        ring.classList.remove('cursor-hover');
      }
    });

    // Hide on mouse leave window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }

  // ─────────────────────────────────────────────
  // 3. TEXT REVEAL (disabled — replaced by hero-blur-reveal CSS)
  // ─────────────────────────────────────────────
  function initTextReveal() {
    // No-op: replaced by CSS-only hero-blur-reveal animation
  }

  // ─────────────────────────────────────────────
  // 4. TILT CARDS
  // Elemen dengan .tilt-card bergerak 3D mengikuti mouse.
  // Ada efek glossy highlight yang juga ikut.
  // ─────────────────────────────────────────────
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    cards.forEach(card => {
      // Add gloss overlay
      const gloss = document.createElement('div');
      gloss.className = 'tilt-gloss';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(gloss);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        gloss.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 60%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        gloss.style.background = 'transparent';
      });
    });
  }

  // ─────────────────────────────────────────────
  // 5. FLOATING PARTICLES
  // Canvas partikel yang float di hero section.
  // Partikel bereaksi ke mouse — menjauh dari cursor.
  // ─────────────────────────────────────────────
  function initParticles() {
    const hero = document.querySelector('[data-particles]');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    let mouseX = -999, mouseY = -999;

    function resize() {
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const count = Math.min(60, Math.floor(w * h / 15000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      });
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      mouseX = -999;
      mouseY = -999;
    });

    // Get accent color
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const particleColor = isDark ? '255,255,255' : '59,130,246';

    function draw() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particleColor}, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ─────────────────────────────────────────────
  // 6. MAGNETIC BUTTONS
  // Tombol yang "tertarik" ke cursor saat mouse dekat.
  // ─────────────────────────────────────────────
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.magnetic');
    if (!btns.length) return;
    if ('ontouchstart' in window) return;

    btns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ─────────────────────────────────────────────
  // 7. SMOOTH COUNTER (disabled)
  // ─────────────────────────────────────────────
  function initSmoothCounters() {
    // No-op: counter animation removed per user request
  }

  // ─────────────────────────────────────────────
  // 8. PARALLAX SCROLL
  // Elemen dengan [data-parallax] bergerak lebih lambat
  // dari scroll → menciptakan depth effect.
  // ─────────────────────────────────────────────
  function initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;

    function update() {
      const scrollY = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY) * speed;
        el.style.transform = `translateY(${scrollY * speed - offset}px)`;
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ─────────────────────────────────────────────
  // 9. NAV SCROLL EFFECT
  // Nav becomes more solid on scroll, slight shadow.
  // ─────────────────────────────────────────────
  function initNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }, { passive: true });
  }

  // ─────────────────────────────────────────────
  // 10. STAGGERED CHILDREN
  // Container dengan [data-stagger] akan add delay
  // ke setiap child yang punya [data-reveal].
  // ─────────────────────────────────────────────
  function initStagger() {
    const containers = document.querySelectorAll('[data-stagger]');
    containers.forEach(container => {
      const delay = parseInt(container.dataset.stagger) || 80;
      const children = container.querySelectorAll('[data-reveal]');
      children.forEach((child, i) => {
        child.dataset.revealDelay = i * delay;
      });
    });
  }

  // ─────────────────────────────────────────────
  // AUTO-APPLY
  // Otomatis menemukan elemen di halaman dan menambahkan
  // class/attribute yang diperlukan tanpa edit HTML.
  // ─────────────────────────────────────────────
  function autoApply() {
    // Auto data-reveal on common section elements
    const revealSelectors = [
      '.docs-section-new',
      '.bento-card',
      '.trust-pill',
      '.ptype-card',
      '.bp-card',
      '.ext-feat',
      '.cmd-block',
      '.tool-grid > *',
      '.chain-badge-group',
      '.crypto-stack-table',
      '.audit-grid > *',
      '.hero-sidebar',
      '.sidebar-card',
      'section > h2',
      'section > p',
      '.hero-content',
      'table',
      '.feature-item',
      '.feature-list',
      // Tool pages
      '.card',
      '.panel',
      '.form-group',
      '.result-area',
      '.output-area'
    ];

    revealSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', '');
        }
      });
    });

    // Auto tilt-card on card-like elements
    const tiltSelectors = [
      '.bento-card',
      '.trust-pill',
      '.ptype-card',
      '.bp-card',
      '.ext-feat',
      '.sidebar-card',
      '.feature-item'
    ];

    tiltSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.classList.contains('tilt-card')) {
          el.classList.add('tilt-card');
        }
      });
    });

    // Auto data-particles on hero sections (skip if hero has ASCII art)
    const hero = document.querySelector('.hero, .docs-hero, .sec-hero, .plug-hero, [class*="hero"]');
    if (hero && !hero.hasAttribute('data-particles') && !hero.querySelector('#hero-ascii')) {
      hero.setAttribute('data-particles', '');
    }

    // Auto hero-blur-reveal on hero-content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !heroContent.classList.contains('hero-blur-reveal')) {
      heroContent.classList.add('hero-blur-reveal');
    }

    // Auto stagger on grids
    const staggerSelectors = [
      '.bento-grid',
      '.tool-grid',
      '.audit-grid',
      '.ptype-grid',
      '.feature-list'
    ];

    staggerSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.hasAttribute('data-stagger')) {
          el.setAttribute('data-stagger', '100');
        }
      });
    });

    // Auto magnetic on primary buttons & CTA
    document.querySelectorAll('.btn-primary, .cta-btn, .generate-btn').forEach(btn => {
      if (!btn.classList.contains('magnetic')) {
        btn.classList.add('magnetic');
      }
    });
  }

  // ─────────────────────────────────────────────
  // INIT ALL
  // ─────────────────────────────────────────────
  function init() {
    autoApply();        // Must run first — tags elements
    initStagger();      // Must run before scroll reveal
    initScrollReveal();
    initCustomCursor();
    initTextReveal();
    initTiltCards();
    initParticles();
    initMagneticButtons();
    initSmoothCounters();
    initParallax();
    initNavScroll();
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
