// ==========================================================================
// WebForge — Navegación, interactividad y animaciones
// ==========================================================================
const navbar = document.querySelector('.navbar');
const NAVBAR_HEIGHT = navbar ? navbar.offsetHeight : 80;

const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

// --- Scroll suave al hacer clic en los enlaces del menú ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const targetPosition = href === '#home' 
      ? 0 
      : target.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    if (this.classList.contains('nav-link')) {
      setActiveLink(this);
    }
  });
});

// --- Marca visualmente el link activo del menú ---
function setActiveLink(linkEl) {
  navLinks.forEach(link => link.classList.remove('nav-link--active'));
  linkEl.classList.add('nav-link--active');
}

// --- Scroll-spy: resalta el enlace activo según la sección visible ---
const sections = Array.from(navLinks)
  .map(link => {
    const href = link.getAttribute('href');
    if (!href) return null;
    return document.querySelector(href);
  })
  .filter(Boolean);

if (sections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          const matchingLink = document.querySelector(`.nav-link[href="${id}"]`);
          if (matchingLink) setActiveLink(matchingLink);
        }
      });
    },
    {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }
  );

  sections.forEach(section => spyObserver.observe(section));
}

// --- Animación de aparición gradual (Scroll Reveal) ---
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealElements.forEach(el => revealObserver.observe(el));