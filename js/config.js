/* Datos públicos del sitio. No guardes contraseñas ni claves secretas aquí. */
export const EMAIL = 'contacto.webforge@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/contacto.webforge/';
export const TIKTOK_URL = 'https://www.tiktok.com/@web.forge1';
export const WHATSAPP = '';
// URL pública de Formspree para el formulario. Déjala vacía para usar mailto/WhatsApp.
export const FORMSPREE_ENDPOINT = '';
// Clave pública. Déjala vacía para mantener Turnstile desactivado.
export const TURNSTILE_SITE_KEY = '';

export const CONTACT = {
  email: EMAIL,
  instagram: INSTAGRAM_URL,
  tiktok: TIKTOK_URL,
  whatsapp: WHATSAPP,
  whatsappMessage: 'Hola, quiero cotizar una página web para mi negocio.',
};

export function whatsappUrl(message = CONTACT.whatsappMessage) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function emailUrl(subject = 'Cotización de página web', body = '') {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${EMAIL}?${params.join('&')}`;
}
