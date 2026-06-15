gsap.registerPlugin(ScrollTrigger);

/* ===== Navbar shadow on scroll ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===== Hero entrance animation ===== */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .from('#hero-heading', {
    opacity: 0,
    y: 60,
    duration: 1.1,
    delay: 0.2,
  })
  .from('#hero-tagline', {
    opacity: 0,
    x: -50,
    duration: 1,
  }, '-=0.55')
  .from('#hero-desc', {
    opacity: 0,
    y: 24,
    duration: 0.85,
  }, '-=0.45');

/* ===== Scroll-triggered fade-up for .anim elements ===== */
gsap.utils.toArray('.anim').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 0.85,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
  });
});

/* ===== Staggered fade-up for service cols and logos ===== */
const staggerGroups = [
  { parent: '.services-row', children: '.anim-stagger' },
  { parent: '.logos-row',    children: '.anim-stagger' },
];

staggerGroups.forEach(({ parent, children }) => {
  const parentEl = document.querySelector(parent);
  if (!parentEl) return;
  gsap.from(parentEl.querySelectorAll(children), {
    opacity: 0,
    y: 36,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.15,
    scrollTrigger: {
      trigger: parentEl,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
});

/* ===== Smooth scroll for nav anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Close mobile menu if open
    document.getElementById('nav-menu').classList.remove('open');
  });
});

/* ===== Mobile menu toggle ===== */
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

