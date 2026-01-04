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
function updateHiker(){
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
}
window.addEventListener('scroll', updateHiker);
window.addEventListener('load', updateHiker);
window.addEventListener('resize', updateHiker);

/* NY confetti/overlay removed — theme simplified to woods & hiking */

/* -------------------
   Gliding background symbols: boots, kayak, bald eagle, tent, pine, pack, compass, campfire
   - Decorative only (aria-hidden)
   - Respects prefers-reduced-motion
   - Limits concurrent elements for performance
   ------------------- */
(function(){
  if (typeof window === 'undefined') return;
  const prefersReduce = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Larger emoji-based icon set (decorative only)
  const EMOJIS = ['🥾','🛶','🦅','🏕️','🌲','🎒','🧭','🔥','🗺️','⛰️','🌄','🪵','🐾','🥤','🥪','🌿','🚩','⛺','🪶','🪓','🪨','🧦','🌳','🧺','🫗'];

  // container
  let container = document.querySelector('.glider-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'glider-container';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
  }

  if (prefersReduce) return; // do not spawn if user reduces motion

  let active = 0;
  const MAX_ACTIVE = 5;
  const MIN_INTERVAL = 1500; // ms (about 2x more frequent)
  const MAX_INTERVAL = 4500;

  function rand(min, max){ return Math.random()*(max-min)+min }

  function spawnOne(){
    if (active >= MAX_ACTIVE) return scheduleNext();
    active++;

    const emoji = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    const el = document.createElement('div');
    el.className = 'glider';

    // choose direction
    const dir = Math.random() > 0.5 ? 'right' : 'left';
    el.classList.add(dir === 'right' ? 'glide-right' : 'glide-left');

    // random vertical position (use CSS variable for smoothness)
    const topPct = rand(8, 70); // avoid top nav/very bottom
    el.style.top = topPct + 'vh';
    el.style.setProperty('--start-y', (topPct + 'vh'));

    // subtle vertical drift
    const drift = (Math.random()-0.5)*24; // px
    el.style.setProperty('--drift', drift + 'px');

    // random duration
    const duration = Math.round(rand(10, 18)) + 's';
    el.style.setProperty('--duration', duration);

    // insert emoji
    el.textContent = emoji;
    el.classList.add('glider-emoji');
    // random size to introduce subtle variety
    el.style.setProperty('--size', Math.round(rand(36, 88)) + 'px');

    // append and remove after animation
    container.appendChild(el);

    function cleanup(){
      el.removeEventListener('animationend', cleanup);
      if (el.parentNode) el.parentNode.removeChild(el);
      active = Math.max(0, active-1);
    }
    el.addEventListener('animationend', cleanup);

    scheduleNext();
  }

  function scheduleNext(){
    const delay = Math.round(rand(MIN_INTERVAL, MAX_INTERVAL));
    setTimeout(spawnOne, delay);
  }

  // start a small initial burst (faster)
  setTimeout(spawnOne, Math.round(rand(400, 1200)));
  // maintain periodic spawns
  scheduleNext();

  // cleanup when page hidden
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) {
      // remove existing gliders
      document.querySelectorAll('.glider').forEach(n => n.remove());
      active = 0;
    }
  });

  // Mountains parallax (small, subtle) — disabled when reduced motion is requested
  (function(){
    const prefersReduce = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const mountains = document.querySelector('.mountain-bg');
    if (!mountains || prefersReduce) return;

    function updateMountains(){
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPos = window.scrollY;
      const percent = docHeight > 0 ? scrollPos / docHeight : 0;
      // move mountains up slightly as user scrolls down (max 20px)
      const maxShift = 20; // px
      const shift = -percent * maxShift;
      mountains.style.transform = `translateY(${shift}px)`;
    }

    window.addEventListener('scroll', updateMountains);
    window.addEventListener('load', updateMountains);
    window.addEventListener('resize', updateMountains);
  })();
})();
