// ============================================
// ARTWORKS — Blue Morphic Grid & Interactions
// ============================================

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================
  // HAMBURGER NAV TOGGLE
  // =========================================
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('open');
    });
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================
  // MORPHIC GRID — blue theme variant
  // =========================================
  (function initMorphicGrid() {
    const canvas = document.getElementById('morphic-grid');
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    let w, h, cols, rows;
    const CELL = 40;
    const INFLUENCE = 180;
    const MAX_DISPLACE = 12;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
    }

    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let bx = c * CELL;
          let by = r * CELL;

          const dx = bx - mouse.x;
          const dy = by - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let offsetX = 0;
          let offsetY = 0;
          let alpha = 0.035;

          if (dist < INFLUENCE) {
            const factor = 1 - (dist / INFLUENCE);
            const ease = factor * factor;
            offsetX = (dx / dist) * ease * MAX_DISPLACE;
            offsetY = (dy / dist) * ease * MAX_DISPLACE;
            alpha = 0.035 + ease * 0.35;
          }

          const px = bx + offsetX;
          const py = by + offsetY;

          // Blue theme: blend blue → white → deep blue
          let red = 0, green = 168, blue = 255; // default blue
          if (dist < INFLUENCE) {
            const t = 1 - (dist / INFLUENCE);
            if (t > 0.6) {
              // Inner: bright white-blue
              red = 200; green = 220; blue = 255;
            } else if (t > 0.3) {
              // Mid: accent blue
              red = 51; green = 187; blue = 255;
            }
          }

          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
          ctx.fill();

          // Lines near mouse
          if (dist < INFLUENCE * 0.8) {
            const lineAlpha = (1 - dist / (INFLUENCE * 0.8)) * 0.1;
            ctx.strokeStyle = 'rgba(' + red + ',' + green + ',' + blue + ',' + lineAlpha + ')';
            ctx.lineWidth = 0.5;

            if (c < cols - 1) {
              const nx = (c + 1) * CELL;
              const ndx = nx - mouse.x;
              const ndy = by - mouse.y;
              const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
              let nox = 0, noy = 0;
              if (ndist < INFLUENCE) {
                const nf = 1 - (ndist / INFLUENCE);
                const ne = nf * nf;
                nox = (ndx / ndist) * ne * MAX_DISPLACE;
                noy = (ndy / ndist) * ne * MAX_DISPLACE;
              }
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(nx + nox, by + noy);
              ctx.stroke();
            }

            if (r < rows - 1) {
              const ny = (r + 1) * CELL;
              const ndx2 = bx - mouse.x;
              const ndy2 = ny - mouse.y;
              const ndist2 = Math.sqrt(ndx2 * ndx2 + ndy2 * ndy2);
              let nox2 = 0, noy2 = 0;
              if (ndist2 < INFLUENCE) {
                const nf2 = 1 - (ndist2 / INFLUENCE);
                const ne2 = nf2 * nf2;
                nox2 = (ndx2 / ndist2) * ne2 * MAX_DISPLACE;
                noy2 = (ndy2 / ndist2) * ne2 * MAX_DISPLACE;
              }
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(bx + nox2, ny + noy2);
              ctx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  })();

  // =========================================
  // INTERSECTION OBSERVER: Fade-in on scroll
  // =========================================
  const fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(function (el) {
    fadeObserver.observe(el);
  });

  // =========================================
  // GALLERY ITEMS: staggered reveal
  // =========================================
  document.querySelectorAll('.gallery-item.fade-in').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.06) + 's';
  });

  // =========================================
  // PARALLAX on ambient glow orbs
  // =========================================
  if (!reducedMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          var g1 = document.querySelector('.glow-1');
          var g2 = document.querySelector('.glow-2');
          var g3 = document.querySelector('.glow-3');
          if (g1) g1.style.transform = 'translateY(' + (scrollY * 0.06) + 'px)';
          if (g2) g2.style.transform = 'translateY(' + (scrollY * -0.04) + 'px)';
          if (g3) g3.style.transform = 'translateY(' + (scrollY * 0.03) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // =========================================
  // HEADER shrink on scroll
  // =========================================
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        header.style.padding = '0.5rem ' + getComputedStyle(document.documentElement).getPropertyValue('--spacing');
      } else {
        header.style.padding = '';
      }
    });
  }

})();
