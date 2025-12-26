// script.js

// Smooth scroll
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// Mouse follower
const cursor = document.getElementById('cursor');
if (cursor) {
  window.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
  });
}

// Fade‑in on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Simple image carousel
const images = ['art1.jpg', 'art2.jpg', 'art3.jpg'];
let current = 0;
const carouselImage = document.getElementById('carousel-image');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

if (prevBtn && carouselImage) {
  prevBtn.addEventListener('click', () => {
    current = (current - 1 + images.length) % images.length;
    carouselImage.src = images[current];
  });
}

if (nextBtn && carouselImage) {
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % images.length;
    carouselImage.src = images[current];
  });
}

// Scroll event to animate hiker
window.addEventListener('scroll', function() {
  const hiker = document.getElementById('hiker');
  if (!hiker) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPos = window.scrollY;
  const percent = docHeight > 0 ? scrollPos / docHeight : 0;
  const maxLeft = window.innerWidth - 80; // 80px is hiker width
  hiker.style.left = (percent * maxLeft) + 'px';

  // Move background image a little left/right as hiker moves
  const body = document.body;
  const minPos = 50; // percent (center)
  const maxShift = 10; // percent (max left shift)
  const bgPos = (minPos - percent * maxShift);
  body.style.backgroundPosition = `${bgPos}% center`;
});

/* -----------------------------
   New Year's Eve 2026: overlay + confetti
   ----------------------------- */
(function(){
  // Respect reduced motion
  if (typeof window === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function(){
    // Only run on the homepage — detect by presence of the #home section (works when served from a subpath)
    const isHome = !!document.getElementById('home');
    if (!isHome) return;

    // Respect reduced motion but still apply static theme
    const reduceMotion = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // Add NY class to body (static styles apply even when reduce-motion is set)
    document.body.classList.add('ny-2026');

    // Static NY CSS has been moved into assets/css/ny-2026.css (linked in index.html)

    // Banner
    const banner = document.createElement('div');
    banner.className = 'ny-banner';
    banner.innerHTML = '<span class="shimmer">Happy New Year 2026</span>';
    document.body.appendChild(banner);

    // Overlay with glitter (canvas added only if animations are allowed)
    const overlay = document.createElement('div');
    overlay.className = 'ny-overlay';
    overlay.innerHTML = '<div class="ny-glitter"></div>' + (reduceMotion ? '' : '<canvas id="ny-confetti"></canvas>');
    document.body.appendChild(overlay);

    // Add headline shimmer to h1s except the site title in #home or ones marked simple-title
    document.querySelectorAll('h1').forEach(el => {
      if (el.classList.contains('simple-title') || el.closest('#home')) return;
      el.classList.add('ny-headline');
    });

    // Initialize confetti canvas (skipped when reduced-motion is requested)
    const canvas = document.getElementById('ny-confetti');
    if (canvas && !reduceMotion) {
      const ctx = canvas.getContext('2d');
      function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      resize(); window.addEventListener('resize', resize);

      const pieces = [];
      const colors = ['#ffd700','#ff7aa2','#7ae7ff','#ffffff','#ffecb3'];

      function spawn(count=30){
        for (let i=0;i<count;i++){
          pieces.push({
            x: Math.random()*canvas.width,
            y: Math.random()*-canvas.height*0.5,
            vx: (Math.random()-0.5)*4,
            vy: Math.random()*3+2,
            r: Math.random()*6+3,
            color: colors[Math.floor(Math.random()*colors.length)],
            rot: Math.random()*360,
            vr: (Math.random()-0.5)*8
          });
        }
      }

      // start with a burst
      spawn(140);
      let last = performance.now();
      function frame(now){
        const dt = (now - last)/1000; last = now;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (let i = pieces.length - 1; i >= 0; i--) {
          const p = pieces[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 9.8 * dt * 0.6; // gravity
          p.rot += p.vr * dt;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
          ctx.restore();

          if (p.y > canvas.height + 50) pieces.splice(i, 1);
        }

        // keep a steady stream briefly
        if (pieces.length < 80) spawn(28);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    // Remove decorations after 20 seconds to avoid persistent effects
    setTimeout(() => {
      banner.classList.add('fade-out');
      overlay.classList.add('fade-out');
      // remove from DOM after fade
      banner.addEventListener('transitionend', () => banner.remove());
      overlay.addEventListener('transitionend', () => overlay.remove());
    }, 20000);
  });
})();
