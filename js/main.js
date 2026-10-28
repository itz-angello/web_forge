/* ==========================================================================
   WEBFORGE — ARRANQUE PRINCIPAL (MAIN ENTRY)
   ========================================================================== */

import { initMenu } from './menu.js';
import { initCompareSlider } from './compare-slider.js';
import { initWorksModal } from './works-modal.js';
import { initFaq } from './faq.js';
import { initContactForm } from './contact-form.js';
import { CONTACT, EMAIL, INSTAGRAM_URL, TIKTOK_URL, WHATSAPP, emailUrl, whatsappUrl } from './config.js';

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
  const hasWhatsApp = /^502\d{8}$/.test(WHATSAPP);
  document.querySelectorAll('[data-contact="whatsapp"]').forEach((link) => {
    link.href = hasWhatsApp ? whatsappUrl() : '#';
    link.hidden = !hasWhatsApp;
  });
  document.querySelectorAll('[data-contact-email]').forEach((link) => {
    link.href = emailUrl();
    link.hidden = false;
  });
  document.querySelectorAll('[data-contact-number]').forEach((label) => {
    if (hasWhatsApp) label.textContent = `WhatsApp: +${WHATSAPP}`;
  });
  document.querySelectorAll('[data-contact-email-label]').forEach((label) => { label.textContent = EMAIL; });
  document.querySelectorAll('[data-social]').forEach((link) => {
    const url = CONTACT[link.dataset.social];
    if (url) link.href = url; else link.hidden = true;
  });

  document.querySelectorAll('[data-whatsapp-primary]').forEach((link) => { link.hidden = !hasWhatsApp; });
  document.querySelectorAll('[data-email-primary]').forEach((link) => { link.hidden = hasWhatsApp; });
  document.querySelectorAll('[data-social="instagram"]').forEach((link) => { link.href = INSTAGRAM_URL; });
  document.querySelectorAll('[data-social="tiktok"]').forEach((link) => { link.href = TIKTOK_URL; });

});

