/* ==========================================================================
   WEBFORGE — ARRANQUE PRINCIPAL (MAIN ENTRY)
   ========================================================================== */

import { initMenu } from './menu.js';
import { initCompareSlider } from './compare-slider.js';
import { initWorksModal } from './works-modal.js';
import { initFaq } from './faq.js';
import { initContactForm } from './contact-form.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Año actual dinámico en el footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Sombra en el header al hacer scroll
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 3. Inicializar módulos interactivos
  initMenu();
  initCompareSlider();
  initWorksModal();
  initFaq();
  initContactForm();
});

