/* ==========================================================================
   WEBFORGE — MÓDULO: FORMULARIO DE CONTACTO & SUPABASE
   ========================================================================== */

import { getSupabaseClient, WHATSAPP_PHONE } from './config.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertSuccess = document.getElementById('form-alert-success');
  const alertError = document.getElementById('form-alert-error');
  const submitBtn = document.getElementById('form-submit-btn');
  const fallbackWaBtn = document.getElementById('fallback-wa-btn');

  if (!form) return;

  const validateField = (input, condition) => {
    const group = input.closest('.form-group');
    const isValid = condition();
    if (!isValid) {
      group.classList.add('has-error');
    } else {
      group.classList.remove('has-error');
    }
    return isValid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    alertSuccess.classList.remove('is-visible');
    alertError.classList.remove('is-visible');
    if (fallbackWaBtn) fallbackWaBtn.style.display = 'none';

    const nameInput = document.getElementById('form-name');
    const businessInput = document.getElementById('form-business');
    const whatsappInput = document.getElementById('form-whatsapp');
    const projectTypeInput = document.getElementById('form-project-type');
    const messageInput = document.getElementById('form-message');

    // Validaciones
    const isNameValid = validateField(nameInput, () => nameInput.value.trim().length >= 2);
    const isBusinessValid = validateField(businessInput, () => businessInput.value.trim().length >= 2);
    const isWhatsAppValid = validateField(whatsappInput, () => {
      const clean = whatsappInput.value.replace(/\D/g, '');
      return clean.length >= 8;
    });
    const isProjectValid = validateField(projectTypeInput, () => projectTypeInput.value !== '');
    const isMessageValid = validateField(messageInput, () => messageInput.value.trim().length >= 10);

    if (!isNameValid || !isBusinessValid || !isWhatsAppValid || !isProjectValid || !isMessageValid) {
      const firstError = form.querySelector('.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      business: businessInput.value.trim(),
      whatsapp: whatsappInput.value.trim(),
      project_type: projectTypeInput.value,
      message: messageInput.value.trim()
    };

    // Estado cargando en el botón
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <span>Enviando mensaje...</span>
    `;

    let saveSuccessful = false;
    const client = getSupabaseClient();

    if (client) {
      try {
        const { error } = await client.from('leads').insert([payload]);
        if (!error) {
          saveSuccessful = true;
        } else {
          console.warn('WebForge: Error al insertar lead en Supabase:', error.message);
        }
      } catch (err) {
        console.warn('WebForge: Excepción en llamada a Supabase:', err);
      }
    } else {
      // Modo local / plantilla sin llaves aún conectadas
      console.info('WebForge: Llaves de Supabase no configuradas. Mostrando respaldo directo a WhatsApp.');
      saveSuccessful = true;
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    if (saveSuccessful) {
      form.reset();
      alertSuccess.classList.add('is-visible');
      alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alertError.classList.add('is-visible');
      if (fallbackWaBtn) {
        fallbackWaBtn.style.display = 'inline-flex';
        const fallbackText = `Hola WebForge, soy ${payload.name} de ${payload.business}. Me interesa el plan "${payload.project_type}". Mi mensaje: ${payload.message}`;
        fallbackWaBtn.setAttribute('href', `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(fallbackText)}`);
      }
    }
  });

  // Limpiar errores en tiempo real
  form.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        group.classList.remove('has-error');
      }
    });
  });
}

