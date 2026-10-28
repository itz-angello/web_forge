import { FORMSPREE_ENDPOINT, TURNSTILE_SITE_KEY, WHATSAPP, emailUrl, whatsappUrl } from './config.js';

function validFormspreeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'formspree.io' && /^\/f\/[A-Za-z0-9]+$/.test(url.pathname)
      && !url.search && !url.username && !url.password;
  } catch {
    return false;
  }
}

function contactMessage(values) {
  return [
    'Hola WebForge, quiero cotizar una página web.',
    '',
    `Nombre: ${String(values.name || '').trim()}`,
    `Negocio o proyecto: ${String(values.business || '').trim()}`,
    `WhatsApp: ${String(values.whatsapp || '').trim()}`,
    `Correo: ${String(values.email || '').trim() || 'No indicado'}`,
    `Proyecto: ${String(values.project_type || '').trim()}`,
    '',
    'Mensaje:',
    String(values.message || '').trim(),
  ].join('\n');
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-alert-success');
  const error = document.getElementById('form-alert-error');
  const button = document.getElementById('form-submit-btn');
  const fallback = document.getElementById('fallback-contact-btn');
  const startedAt = document.getElementById('form-started-at');
  const hasWhatsApp = /^502\d{8}$/.test(WHATSAPP);
  const endpointConfigured = validFormspreeUrl(FORMSPREE_ENDPOINT);
  let turnstileWidgetId = null;
  if (startedAt) startedAt.value = String(Date.now());

  form.querySelectorAll('[name]').forEach((field) => {
    field.required = !['email', 'website', 'started_at', 'cf-turnstile-response'].includes(field.name);
  });

  if (endpointConfigured && TURNSTILE_SITE_KEY) {
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
    success.classList.remove('is-visible');
    error.classList.remove('is-visible');
    fallback.hidden = true;

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

    const message = contactMessage(values);
    const fallbackUrl = hasWhatsApp ? whatsappUrl(message) : emailUrl('Cotización de página web', message);
    const openFallback = () => {
      window.location.href = fallbackUrl;
    };

    if (!endpointConfigured) {
      success.querySelector('strong').textContent = 'Preparamos tu mensaje para enviarlo.';
      success.querySelector('p').textContent = hasWhatsApp
        ? 'Se abrirá WhatsApp con los datos de tu consulta listos para enviar.'
        : 'Se abrirá tu correo con los datos de tu consulta listos para enviar.';
      success.classList.add('is-visible');
      openFallback();
      return;
    }

    button.disabled = true;
    const buttonLabel = button.querySelector('span');
    const originalLabel = buttonLabel?.textContent || '';
    if (buttonLabel) buttonLabel.textContent = 'Enviando solicitud…';
    try {
      const payload = new URLSearchParams();
      new FormData(form).forEach((value, key) => payload.append(key, String(value)));
      payload.set('formspree_endpoint', FORMSPREE_ENDPOINT);
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'No se pudo enviar mediante el formulario.');
      form.reset();
      success.querySelector('strong').textContent = 'Tu solicitud fue enviada.';
      success.querySelector('p').textContent = 'Gracias por escribir a WebForge. Revisaremos los datos que compartiste.';
      success.classList.add('is-visible');
      if (startedAt) startedAt.value = String(Date.now());
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {
      error.querySelector('strong').textContent = 'No se pudo completar el envío por Formspree.';
      error.querySelector('p').textContent = 'Puedes continuar por correo o WhatsApp con los datos del formulario preparados.';
      fallback.href = fallbackUrl;
      fallback.textContent = hasWhatsApp ? 'Continuar por WhatsApp' : 'Abrir correo con la consulta';
      fallback.classList.toggle('btn-whatsapp', hasWhatsApp);
      fallback.classList.toggle('btn-primary', !hasWhatsApp);
      fallback.hidden = false;
      error.classList.add('is-visible');
    } finally {
      button.disabled = false;
      if (buttonLabel) buttonLabel.textContent = originalLabel;
      if (startedAt) startedAt.value = String(Date.now());
      if (window.turnstile && turnstileWidgetId) window.turnstile.reset(turnstileWidgetId);
    }
  });

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => field.closest('.form-group')?.classList.remove('has-error'));
  });
}
