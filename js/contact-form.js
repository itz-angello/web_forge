import { CONTACT_FORM_ENABLED, TURNSTILE_SITE_KEY, WHATSAPP, whatsappUrl } from './config.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-alert-success');
  const error = document.getElementById('form-alert-error');
  const button = document.getElementById('form-submit-btn');
  const fallback = document.getElementById('fallback-wa-btn');
  const startedAt = document.getElementById('form-started-at');
  const hasWhatsApp = /^502\d{8}$/.test(WHATSAPP);
  fallback.hidden = !hasWhatsApp;
  if (startedAt) startedAt.value = String(Date.now());
  if (!CONTACT_FORM_ENABLED) {
    button.disabled = true;
    button.title = 'Configura el servicio de contacto en Vercel para activar el formulario.';
    error.querySelector('strong').textContent = 'El formulario aún no está configurado.';
    error.querySelector('p').textContent = hasWhatsApp
      ? 'Puedes escribirnos por WhatsApp o correo. Para habilitar este formulario, configura el servicio de contacto en Vercel.'
      : 'Escríbenos por correo o redes sociales. Para habilitar este formulario, configura el servicio de contacto en Vercel.';
    error.classList.add('is-visible');
    fallback.hidden = !hasWhatsApp;
    if (hasWhatsApp) { fallback.hidden = false; fallback.href = whatsappUrl(); }
    return;
  }
  form.querySelectorAll('[name]').forEach((field) => field.required = !['email', 'website', 'started_at', 'cf-turnstile-response'].includes(field.name));

  let turnstileWidgetId = null;
  if (TURNSTILE_SITE_KEY) {
    const widget = document.getElementById('turnstile-widget');
    widget.hidden = false;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.turnstile) return;
      turnstileWidgetId = window.turnstile.render(widget, { sitekey: TURNSTILE_SITE_KEY, theme: 'auto', 'refresh-expired': 'auto' });
    };
    document.head.append(script);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    success.classList.remove('is-visible'); error.classList.remove('is-visible');
    fallback.style.display = 'none';
    if (!startedAt || Date.now() - Number(startedAt.value) < 4000) {
      error.querySelector('strong').textContent = 'Espera un momento antes de enviar el formulario.';
      error.classList.add('is-visible');
      return;
    }
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
    const buttonLabel = button.querySelector('span');
    const originalLabel = buttonLabel?.textContent || '';
    if (buttonLabel) buttonLabel.textContent = 'Enviando solicitud…';
    try {
      const payload = new URLSearchParams();
      new FormData(form).forEach((value, key) => payload.append(key, String(value)));
      const response = await fetch('/api/contact', { method: 'POST', body: payload, headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || (response.status === 429 ? 'Se alcanzó el límite de envíos. Inténtalo más tarde.' : `No se pudo enviar el formulario. Inténtalo de nuevo o contáctanos por ${hasWhatsApp ? 'WhatsApp' : 'correo'}.`));
      form.reset(); success.classList.add('is-visible');
      if (startedAt) startedAt.value = String(Date.now());
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      error.querySelector('strong').textContent = err.message || `Falló la conexión. Revisa tu internet o escríbenos por ${hasWhatsApp ? 'WhatsApp' : 'correo'}.`;
      error.querySelector('p').textContent = hasWhatsApp
        ? 'Puedes enviarnos tus datos directamente por WhatsApp pulsando el botón de abajo:'
        : 'Elige correo o una de nuestras redes sociales para contactarnos.';
      error.classList.add('is-visible');
      if (hasWhatsApp) { fallback.hidden = false; fallback.href = whatsappUrl(); }
    } finally {
      button.disabled = false;
      if (buttonLabel) buttonLabel.textContent = originalLabel;
      if (startedAt) startedAt.value = String(Date.now());
      if (window.turnstile && turnstileWidgetId) window.turnstile.reset(turnstileWidgetId);
    }
  });
  form.querySelectorAll('input, select, textarea').forEach((field) => field.addEventListener('input', () => field.closest('.form-group')?.classList.remove('has-error')));
}
