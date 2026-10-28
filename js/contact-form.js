import { CONTACT, WHATSAPP, whatsappUrl } from './config.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-alert-success');
  const error = document.getElementById('form-alert-error');
  const button = document.getElementById('form-submit-btn');
  const fallback = document.getElementById('fallback-wa-btn');
  const endpoint = CONTACT.formspreeEndpoint.trim();
  const hasWhatsApp = /^502\d{8}$/.test(WHATSAPP);
  fallback.hidden = !hasWhatsApp;
  if (!endpoint) {
    button.disabled = true;
    button.title = 'Configura Formspree en js/config.js para activar el formulario.';
    error.querySelector('strong').textContent = 'El formulario aún no está configurado.';
    error.querySelector('p').textContent = hasWhatsApp
      ? 'Puedes escribirnos por WhatsApp o correo. Para habilitar este formulario, añade tu URL de Formspree en js/config.js.'
      : 'Escríbenos por correo o redes sociales. Para habilitar este formulario, añade tu URL de Formspree en js/config.js.';
    error.classList.add('is-visible');
    fallback.hidden = !hasWhatsApp;
    if (hasWhatsApp) { fallback.hidden = false; fallback.href = whatsappUrl(); }
    return;
  }
  form.action = endpoint;
  form.querySelectorAll('[name]').forEach((field) => field.required = !['email', 'website'].includes(field.name));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.classList.remove('is-visible'); error.classList.remove('is-visible');
    fallback.style.display = 'none';
    const values = Object.fromEntries(new FormData(form).entries());
    const checks = [
      ['form-name', String(values.name || '').trim().length >= 2],
      ['form-business', String(values.business || '').trim().length >= 2],
      ['form-whatsapp', (String(values.whatsapp || '').match(/\d/g) || []).length >= 8],
      ['form-project-type', Boolean(values.project_type)],
      ['form-message', String(values.message || '').trim().length >= 10],
    ];
    checks.forEach(([id, valid]) => document.getElementById(id).closest('.form-group').classList.toggle('has-error', !valid));
    const email = document.getElementById('form-email');
    email.closest('.form-group').classList.toggle('has-error', Boolean(email.value) && !email.validity.valid);
    const invalid = checks.find(([, valid]) => !valid);
    if (invalid || (email.value && !email.validity.valid)) {
      document.getElementById(invalid?.[0] || 'form-email').focus();
      error.querySelector('strong').textContent = 'Revisa los campos marcados antes de enviar.';
      error.classList.add('is-visible');
      return;
    }
    if (values.website) return;
    button.disabled = true;
    const original = button.innerHTML;
    button.textContent = 'Enviando solicitud…';
    try {
      const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(response.status === 429 ? 'Se alcanzó el límite de envíos. Inténtalo más tarde.' : `No se pudo enviar el formulario. Inténtalo de nuevo o contáctanos por ${hasWhatsApp ? 'WhatsApp' : 'correo'}.`);
      form.reset(); success.classList.add('is-visible');
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      error.querySelector('strong').textContent = err.message || `Falló la conexión. Revisa tu internet o escríbenos por ${hasWhatsApp ? 'WhatsApp' : 'correo'}.`;
      error.querySelector('p').textContent = hasWhatsApp
        ? 'Puedes enviarnos tus datos directamente por WhatsApp pulsando el botón de abajo:'
        : 'Elige correo o una de nuestras redes sociales para contactarnos.';
      error.classList.add('is-visible');
      if (hasWhatsApp) { fallback.hidden = false; fallback.href = whatsappUrl(); }
    } finally { button.disabled = false; button.innerHTML = original; }
  });
  form.querySelectorAll('input, select, textarea').forEach((field) => field.addEventListener('input', () => field.closest('.form-group')?.classList.remove('has-error')));
}
