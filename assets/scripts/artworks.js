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
  // GALLERY DATA: Auto titles from filenames
  // =========================================
  const artworkFiles = [
    'PXL_20221101_112943836.jpg',
    'PXL_20230124_234403665.jpg',
    'PXL_20230127_003327099.jpg',
    'PXL_20230201_003729781.jpg',
    'PXL_20230214_235113515.MP.jpg',
    'PXL_20230328_214737045.jpg',
    'PXL_20230404_233541011.jpg',
    'PXL_20251028_055339225.jpg',
    'PXL_20251215_213331443.jpg',
    'PXL_20251218_173433744.MP.jpg',
    'PXL_20251218_201050019.jpg',
    'PXL_20260211_034856974.RAW-01.jpg',
    'PXL_20260327_192647205.jpg',
    'PXL_20260327_213407150.jpg',
    'PXL_20260328_081716985.jpg',
    'PXL_20260328_194247534.jpg'
  ];

  function getTimestampFromName(fileName) {
    const match = fileName.match(/(\d{8})_(\d{6})/);
    if (!match) return Number.MIN_SAFE_INTEGER;

    const datePart = match[1];
    const timePart = match[2];
    const year = Number(datePart.slice(0, 4));
    const month = Number(datePart.slice(4, 6)) - 1;
    const day = Number(datePart.slice(6, 8));
    const hours = Number(timePart.slice(0, 2));
    const minutes = Number(timePart.slice(2, 4));
    const seconds = Number(timePart.slice(4, 6));

    return new Date(year, month, day, hours, minutes, seconds).getTime();
  }

  function formatPhotoTitle(fileName, fallbackIndex) {
    const ts = getTimestampFromName(fileName);
    if (!Number.isFinite(ts) || ts <= 0) {
      return 'Artwork ' + String(fallbackIndex + 1).padStart(2, '0');
    }

    const date = new Date(ts);
    const dateText = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeText = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return 'Artwork • ' + dateText + ' • ' + timeText;
  }

  function initGalleryLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');

    lightbox.innerHTML = [
      '<button class="lightbox-close" type="button" aria-label="Close image"><span aria-hidden="true">X</span></button>',
      '<img class="lightbox-image" alt="Expanded artwork" />',
      '<div class="lightbox-caption"></div>'
    ].join('');

    document.body.appendChild(lightbox);

    const closeButton = lightbox.querySelector('.lightbox-close');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxImage.removeAttribute('src');
      lightboxCaption.textContent = '';
    }

    function openLightbox(imageSrc, imageAlt, caption) {
      lightboxImage.src = imageSrc;
      lightboxImage.alt = imageAlt;
      lightboxCaption.textContent = caption || '';

      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    }

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });

    return { openLightbox: openLightbox };
  }

  function getColumnSpanFromAspect(aspectRatio, totalCols) {
    // On 2-column grids (mobile) every item takes exactly 1 column → 2 per row
    if (totalCols <= 2) return 1;
    // Keep all images within 1-2 columns so no single photo dominates
    if (aspectRatio >= 1.2) return 2;
    return 1;
  }

  function layoutGalleryTiles(grid) {
    const style = getComputedStyle(grid);
    const rowUnit = parseFloat(style.getPropertyValue('--tile-row')) || 8;
    const gap = parseFloat(style.gap) || 8;
    // Detect actual column count from the computed grid
    const totalCols = style.gridTemplateColumns.trim().split(/\s+/).length || 5;

    // On mobile (2 cols), CSS handles layout — clear any inline spans and bail
    if (totalCols <= 2) {
      grid.querySelectorAll('.gallery-item').forEach(function (item) {
        item.style.gridColumnEnd = '';
        item.style.gridRowEnd = '';
      });
      return;
    }

    grid.querySelectorAll('.gallery-item').forEach(function (item) {
      const image = item.querySelector('.gallery-image');
      if (!image || !image.naturalWidth || !image.naturalHeight) return;

      // Use rendered offsetHeight/offsetWidth when available so EXIF-rotated
      // portrait photos are measured correctly rather than as landscape.
      var aspect;
      if (image.offsetWidth > 0 && image.offsetHeight > 0) {
        aspect = image.offsetWidth / image.offsetHeight;
      } else {
        aspect = image.naturalWidth / image.naturalHeight;
      }

      const colSpan = getColumnSpanFromAspect(aspect, totalCols);
      item.style.gridColumnEnd = 'span ' + colSpan;

      const itemWidth = item.getBoundingClientRect().width;
      if (!itemWidth) return;

      const itemHeight = itemWidth / aspect;
      const rowSpan = Math.max(1, Math.ceil((itemHeight + gap) / (rowUnit + gap)));
      item.style.gridRowEnd = 'span ' + rowSpan;
    });
  }

  function renderGallery() {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    const lightboxController = initGalleryLightbox();

    const sorted = artworkFiles.slice().sort(function (a, b) {
      const ta = getTimestampFromName(a);
      const tb = getTimestampFromName(b);
      return tb - ta;
    });

    grid.innerHTML = '';

    sorted.forEach(function (fileName, index) {
      const item = document.createElement('div');
      item.className = 'gallery-item fade-in';
      item.setAttribute('data-index', String(index + 1).padStart(3, '0'));

      const title = formatPhotoTitle(fileName, index);
      const imagePath = 'assets/img/artworks/' + fileName;

      const image = document.createElement('img');
      image.src = imagePath;
      image.alt = title;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.className = 'gallery-image is-loading';

      image.addEventListener('load', function () {
        image.classList.remove('is-loading');
        image.classList.add('is-loaded');
        layoutGalleryTiles(grid);
      });

      image.addEventListener('error', function () {
        image.classList.remove('is-loading');
        image.classList.add('is-error');
      });

      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      const titleEl = document.createElement('div');
      titleEl.className = 'gallery-title';
      titleEl.textContent = title;

      const metaEl = document.createElement('div');
      metaEl.className = 'gallery-meta';
      metaEl.textContent = fileName;

      overlay.appendChild(titleEl);
      overlay.appendChild(metaEl);
      item.appendChild(image);
      item.appendChild(overlay);

      item.addEventListener('click', function () {
        lightboxController.openLightbox(imagePath, title, fileName);
      });

      item.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          lightboxController.openLightbox(imagePath, title, fileName);
        }
      });

      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'Open ' + title + ' fullscreen');

      grid.appendChild(item);
    });

    layoutGalleryTiles(grid);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        layoutGalleryTiles(grid);
      }, 100);
    }, { passive: true });
  }

  renderGallery();

  // =========================================
  // MORPHIC GRID — blue theme variant
  // =========================================
  (function initMorphicGrid() {
    const canvas = document.getElementById('morphic-grid');
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    let w, h, cols, rows;
    let cell = window.innerWidth < 900 ? 52 : 40;
    const INFLUENCE = 180;
    const INFLUENCE_SQ = INFLUENCE * INFLUENCE;
    const LINE_INFLUENCE_SQ = (INFLUENCE * 0.8) * (INFLUENCE * 0.8);
    const MAX_DISPLACE = 12;
    const mouse = { x: -9999, y: -9999 };
    let dpr = 1;
    let isVisible = true;
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 36;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      cell = window.innerWidth < 900 ? 52 : 40;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    document.addEventListener('visibilitychange', function () {
      isVisible = !document.hidden;
      if (isVisible) {
        requestAnimationFrame(draw);
      }
    });

    function draw(now) {
      if (!isVisible) return;

      if (now - lastFrameTime < FRAME_INTERVAL) {
        requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = now;

      ctx.clearRect(0, 0, w, h);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let bx = c * cell;
          let by = r * cell;

          const dx = bx - mouse.x;
          const dy = by - mouse.y;
          const distSq = dx * dx + dy * dy;

          let offsetX = 0;
          let offsetY = 0;
          let alpha = 0.035;
          let dist = 0;

          if (distSq < INFLUENCE_SQ && distSq > 0.01) {
            dist = Math.sqrt(distSq);
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
          if (distSq < INFLUENCE_SQ) {
            if (dist === 0) dist = Math.sqrt(distSq);
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
          if (distSq < LINE_INFLUENCE_SQ) {
            if (dist === 0) dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / (INFLUENCE * 0.8)) * 0.1;
            ctx.strokeStyle = 'rgba(' + red + ',' + green + ',' + blue + ',' + lineAlpha + ')';
            ctx.lineWidth = 0.5;

            if (c < cols - 1) {
              const nx = (c + 1) * cell;
              const ndx = nx - mouse.x;
              const ndy = by - mouse.y;
              const ndistSq = ndx * ndx + ndy * ndy;
              let nox = 0, noy = 0;
              if (ndistSq < INFLUENCE_SQ && ndistSq > 0.01) {
                const ndist = Math.sqrt(ndistSq);
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
              const ny = (r + 1) * cell;
              const ndx2 = bx - mouse.x;
              const ndy2 = ny - mouse.y;
              const ndist2Sq = ndx2 * ndx2 + ndy2 * ndy2;
              let nox2 = 0, noy2 = 0;
              if (ndist2Sq < INFLUENCE_SQ && ndist2Sq > 0.01) {
                const ndist2 = Math.sqrt(ndist2Sq);
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
    var g1 = document.querySelector('.glow-1');
    var g2 = document.querySelector('.glow-2');
    var g3 = document.querySelector('.glow-3');
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          if (g1) g1.style.transform = 'translateY(' + (scrollY * 0.06) + 'px)';
          if (g2) g2.style.transform = 'translateY(' + (scrollY * -0.04) + 'px)';
          if (g3) g3.style.transform = 'translateY(' + (scrollY * 0.03) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // =========================================
  // HEADER shrink on scroll
  // =========================================
  var header = document.querySelector('.site-header');
  if (header) {
    var headerCompact = false;
    var headerTicking = false;
    var rootSpacing = getComputedStyle(document.documentElement).getPropertyValue('--spacing');

    window.addEventListener('resize', function () {
      rootSpacing = getComputedStyle(document.documentElement).getPropertyValue('--spacing');
    }, { passive: true });

    window.addEventListener('scroll', function () {
      if (headerTicking) return;
      headerTicking = true;

      requestAnimationFrame(function () {
        var shouldCompact = window.scrollY > 60;
        if (shouldCompact !== headerCompact) {
          if (shouldCompact) {
            header.style.padding = '0.5rem ' + rootSpacing;
          } else {
            header.style.padding = '';
          }
          headerCompact = shouldCompact;
        }
        headerTicking = false;
      });
    }, { passive: true });
  }

})();
