/* ==========================================================================
   WEBFORGE — ARRANQUE PRINCIPAL (MAIN ENTRY)
   ========================================================================== */

import { initMenu } from './menu.js';
import { initCompareSlider } from './compare-slider.js';
import { initWorksModal } from './works-modal.js';
import { initFaq } from './faq.js';
import { initContactForm } from './contact-form.js';
import { CONTACT, whatsappUrl } from './config.js';

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
  document.querySelectorAll('[data-contact="whatsapp"]').forEach((link) => { link.href = CONTACT.whatsapp ? whatsappUrl() : '#'; });
  document.querySelectorAll('[data-contact-email]').forEach((link) => {
    if (CONTACT.email) link.href = `mailto:${CONTACT.email}`; else link.hidden = true;
  });
  document.querySelectorAll('[data-contact-number]').forEach((label) => {
    if (CONTACT.whatsapp) label.textContent = `WhatsApp: +${CONTACT.whatsapp}`;
  });
  document.querySelectorAll('[data-contact-email-label]').forEach((label) => { label.textContent = CONTACT.email; });
  document.querySelectorAll('[data-social]').forEach((link) => {
    const url = CONTACT[link.dataset.social];
    if (url) link.href = url; else link.hidden = true;
  });
});

