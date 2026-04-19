// ── Sticky nav on scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile hamburger menu ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let delay = 0;
      siblings.forEach((el, idx) => {
        if (el === entry.target) delay = idx * 80;
      });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Smooth active nav highlight ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── NYC time + status dot ──
function updateNYCTime() {
  const el = document.getElementById('footer-time');
  if (!el) return;

  const nyTimeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

  const nyHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  ) || 0;

  const dotColor =
    nyHour >= 9 && nyHour < 18   ? '#22c55e'   // work hours — green
    : nyHour >= 18 && nyHour < 23 ? '#f59e0b'  // evening — amber
    :                               '#5a4f3a';  // night — dim

  const dotGlow =
    nyHour >= 9 && nyHour < 18   ? '0 0 6px rgba(34,197,94,0.6)'
    : nyHour >= 18 && nyHour < 23 ? '0 0 6px rgba(245,158,11,0.5)'
    :                               'none';

  el.innerHTML =
    `<span class="time-dot" style="background:${dotColor};box-shadow:${dotGlow};"></span>` +
    `NYC · ${nyTimeStr}`;
}

updateNYCTime();
setInterval(updateNYCTime, 60_000);
