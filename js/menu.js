/* ==========================================================================
   WEBFORGE — MÓDULO: MENÚ HAMBURGUESA Y NAVEGACIÓN MÓVIL
   ========================================================================== */

export function initMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta a');

  if (!toggleBtn || !drawer) return;

  const toggleMenu = (open) => {
    const isCurrentlyOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;

    toggleBtn.setAttribute('aria-expanded', String(shouldOpen));
    toggleBtn.setAttribute('aria-label', shouldOpen ? 'Cerrar menú' : 'Abrir menú');
    drawer.classList.toggle('is-open', shouldOpen);
    drawer.setAttribute('aria-hidden', String(!shouldOpen));

    // Bloquear scroll de fondo al abrir el menú
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggleMenu());

  // Cerrar al pulsar cualquier enlace
  navLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Cerrar al pulsar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });
}

