// script.js

// Smooth scroll
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// Mouse follower
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
});

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

document.getElementById('prev').addEventListener('click', () => {
  current = (current - 1 + images.length) % images.length;
  carouselImage.src = images[current];
});

document.getElementById('next').addEventListener('click', () => {
  current = (current + 1) % images.length;
  carouselImage.src = images[current];
});

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
