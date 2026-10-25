/* ==========================================================================
   WEBFORGE — MÓDULO: PREGUNTAS FRECUENTES (ACORDEÓN)
   ========================================================================== */

export function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');
    if (!summary) return;

    summary.addEventListener('click', () => {
      // Si el elemento se va a abrir, cerramos los demás para mantener orden
      if (!item.hasAttribute('open')) {
        faqItems.forEach((other) => {
          if (other !== item && other.hasAttribute('open')) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });
}

