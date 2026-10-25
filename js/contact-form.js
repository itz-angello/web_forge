/* Envío del formulario público a la función segura de Vercel. */
export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-alert-success');
  const error = document.getElementById('form-alert-error');
  const button = document.getElementById('form-submit-btn');
  const fallback = document.getElementById('fallback-wa-btn');
  const original = button.innerHTML;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.classList.remove('is-visible');
    error.classList.remove('is-visible');
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
    const firstInvalid = checks.find(([, valid]) => !valid);
    if (firstInvalid) { document.getElementById(firstInvalid[0]).focus(); return; }

    button.disabled = true;
    button.textContent = 'Enviando solicitud…';
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo enviar. Inténtalo de nuevo.');
      form.reset();
      success.classList.add('is-visible');
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      error.querySelector('strong').textContent = err.message || 'Ocurrió un error al enviar tu solicitud.';
      error.classList.add('is-visible');
      fallback.style.display = 'inline-flex';
      const message = `Hola WebForge, soy ${values.name} de ${values.business}. Me interesa ${values.project_type}. ${values.message}`;
      fallback.href = `https://wa.me/50255551234?text=${encodeURIComponent(message)}`;
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });

  form.querySelectorAll('input, select, textarea').forEach((input) => input.addEventListener('input', () => input.closest('.form-group')?.classList.remove('has-error')));
}
