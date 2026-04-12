// ============================================
// FOUNDRY THEME — Animations & Interactions
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
    // Close nav when a link is tapped
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================
  // MORPHIC GRID — mouse-reactive background
  // =========================================
  (function initMorphicGrid() {
    const canvas = document.getElementById('morphic-grid');
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    let w, h, cols, rows;
    const CELL = 36;           // grid cell size in px
    const INFLUENCE = 220;     // mouse influence radius
    const MAX_DISPLACE = 16;   // max displacement px
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
    }

    resize();
    window.addEventListener('resize', resize);

    // Track mouse (throttled via rAF)
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Leave area → reset
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

          // Distance from mouse
          const dx = bx - mouse.x;
          const dy = by - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let offsetX = 0;
          let offsetY = 0;
          let alpha = 0.04;  // base dot opacity

          if (dist < INFLUENCE) {
            const factor = 1 - (dist / INFLUENCE);
            const ease = factor * factor; // quadratic ease
            offsetX = (dx / dist) * ease * MAX_DISPLACE;
            offsetY = (dy / dist) * ease * MAX_DISPLACE;
            alpha = 0.04 + ease * 0.35;
          }

          const px = bx + offsetX;
          const py = by + offsetY;

          // Color: blend red → green → blue based on distance
          let red = 224, green = 32, blue = 32; // default red
          if (dist < INFLUENCE) {
            const t = 1 - (dist / INFLUENCE);
            if (t > 0.6) {
              // Inner ring: neon green
              red = 57; green = 255; blue = 20;
            } else if (t > 0.3) {
              // Mid ring: neon blue
              red = 0; green = 212; blue = 255;
            }
            // Outer ring stays red
          }

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
          ctx.fill();

          // Draw connecting lines to neighbors near the mouse
          if (dist < INFLUENCE * 0.85) {
            const lineAlpha = (1 - dist / (INFLUENCE * 0.85)) * 0.15;
            ctx.strokeStyle = 'rgba(' + red + ',' + green + ',' + blue + ',' + lineAlpha + ')';
            ctx.lineWidth = 0.5;

            // Right neighbor
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

            // Bottom neighbor
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
  // STAT COUNTER ANIMATION
  // =========================================
  function animateCounters() {
    document.querySelectorAll('.stat-value[data-target]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      var current = 0;
      var step = Math.max(1, Math.floor(target / 50));
      var interval = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current;
      }, 30);
    });
  }

  var statGrid = document.querySelector('.stat-grid');
  if (statGrid) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    statObserver.observe(statGrid);
  }

  // =========================================
  // SMOOTH SCROLL
  // =========================================
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =========================================
  // GLITCH: random full glitch bursts (~7/12/16s)
  // with occasional shutoff variant
  // =========================================
  var glitchEl = document.querySelector('.glitch');
  if (glitchEl && !reducedMotion) {
    var intervals = [7000, 12000, 16000];
    var shutoffChance = 0.2; // 20% chance of shutoff variant

    function triggerGlitchBurst() {
      var isShutoff = Math.random() < shutoffChance;
      var cls = isShutoff ? 'shutoff' : 'glitching';
      var duration = isShutoff ? 600 + Math.random() * 400 : 800 + Math.random() * 400;

      glitchEl.classList.add(cls);
      // Also add a slight positional shake
      glitchEl.style.transform = 'translate(' + ((Math.random() - 0.5) * 3) + 'px,' + ((Math.random() - 0.5) * 2) + 'px)';

      setTimeout(function () {
        glitchEl.classList.remove(cls);
        glitchEl.style.transform = '';
        glitchEl.style.opacity = '';
      }, duration);
    }

    function scheduleGlitch() {
      var delay = intervals[Math.floor(Math.random() * intervals.length)] + (Math.random() - 0.5) * 2000;
      setTimeout(function () {
        triggerGlitchBurst();
        scheduleGlitch();
      }, Math.max(delay, 4000));
    }
    scheduleGlitch();
  }

  // =========================================
  // PROJECT ENTRY: staggered reveal
  // =========================================
  document.querySelectorAll('.project-entry.fade-in').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.07) + 's';
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
          var glowRed = document.querySelector('.glow-red');
          var glowGreen = document.querySelector('.glow-green');
          var glowBlue = document.querySelector('.glow-blue');
          if (glowRed) glowRed.style.transform = 'translateY(' + (scrollY * 0.08) + 'px)';
          if (glowGreen) glowGreen.style.transform = 'translateY(' + (scrollY * -0.05) + 'px)';
          if (glowBlue) glowBlue.style.transform = 'translateY(' + (scrollY * 0.04) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // =========================================
  // SLATE TEXTURE CANVASES — procedural stone/grid
  // =========================================
  document.querySelectorAll('.slate-divider canvas').forEach(function (canvas) {
    if (reducedMotion) return;
    var ctx = canvas.getContext('2d');
    var w, h;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
      drawSlate();
    }

    // Seeded pseudo-random for consistent texture
    var seed = Math.random() * 999;
    function seededRand(i) {
      var x = Math.sin(seed + i) * 43758.5453;
      return x - Math.floor(x);
    }

    function drawSlate() {
      // Dark slate base
      ctx.fillStyle = '#0C0C10';
      ctx.fillRect(0, 0, w, h);

      // Stone grain texture — subtle horizontal streaks
      for (var i = 0; i < h; i += 2) {
        var grainAlpha = 0.02 + seededRand(i) * 0.04;
        ctx.fillStyle = 'rgba(180,180,175,' + grainAlpha + ')';
        ctx.fillRect(0, i, w, 1);
      }

      // Vertical rock fissures
      for (var f = 0; f < 8; f++) {
        var fx = seededRand(f * 7) * w;
        ctx.strokeStyle = 'rgba(40,40,48,' + (0.3 + seededRand(f * 3) * 0.4) + ')';
        ctx.lineWidth = 0.5 + seededRand(f * 11) * 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, 0);
        for (var fy = 0; fy < h; fy += 6) {
          fx += (seededRand(f * 100 + fy) - 0.5) * 4;
          ctx.lineTo(fx, fy);
        }
        ctx.stroke();
      }

      // Grid overlay — thin lines
      var gridSize = 28;
      ctx.strokeStyle = 'rgba(224,32,32,0.06)';
      ctx.lineWidth = 0.5;
      for (var gx = 0; gx < w; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (var gy = 0; gy < h; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Grid intersection dots
      for (var ix = 0; ix < w; ix += gridSize) {
        for (var iy = 0; iy < h; iy += gridSize) {
          var dotAlpha = 0.08 + seededRand(ix * 31 + iy * 17) * 0.12;
          var colors = ['224,32,32', '57,255,20', '0,212,255'];
          var ci = Math.floor(seededRand(ix * 13 + iy * 29) * 3);
          ctx.fillStyle = 'rgba(' + colors[ci] + ',' + dotAlpha + ')';
          ctx.beginPath();
          ctx.arc(ix, iy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    resize();
    window.addEventListener('resize', resize);

    // Subtle scan-line animation
    var scanY = 0;
    function animateScan() {
      drawSlate();

      // Moving scan line
      var grad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      grad.addColorStop(0, 'rgba(224,32,32,0)');
      grad.addColorStop(0.5, 'rgba(224,32,32,0.12)');
      grad.addColorStop(1, 'rgba(224,32,32,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 2, w, 4);

      scanY += 0.4;
      if (scanY > h + 4) scanY = -4;

      requestAnimationFrame(animateScan);
    }
    animateScan();
  });

  // =========================================
  // SKILL TAGS: scale on hover
  // =========================================
  document.querySelectorAll('.skill-tag').forEach(function (tag) {
    tag.addEventListener('mouseenter', function () {
      tag.style.transition = 'all 0.15s ease';
      tag.style.transform = 'scale(1.05)';
    });
    tag.addEventListener('mouseleave', function () {
      tag.style.transition = 'all 0.3s ease';
      tag.style.transform = 'scale(1)';
    });
  });

  // =========================================
  // HEADER: compact on scroll
  // =========================================
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        header.style.padding = '0.5rem ' + getComputedStyle(document.documentElement).getPropertyValue('--spacing');
      } else {
        header.style.padding = '0.75rem ' + getComputedStyle(document.documentElement).getPropertyValue('--spacing');
      }
    });
  }

  // =========================================
  // LOADING BAR: auto-hide
  // =========================================
  var loadingBar = document.querySelector('.loading-bar');
  if (loadingBar) {
    setTimeout(function () {
      loadingBar.style.transition = 'opacity 1s ease';
      loadingBar.style.opacity = '0';
      setTimeout(function () {
        loadingBar.style.display = 'none';
      }, 1000);
    }, 3000);
  }

})();