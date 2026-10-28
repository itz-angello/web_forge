/* Datos públicos del sitio. No guardes contraseñas ni claves secretas aquí. */
export const EMAIL = 'contacto.webforge@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/contacto.webforge/';
export const TIKTOK_URL = 'https://www.tiktok.com/@web.forge1';
export const WHATSAPP = '';
// Clave pública. Déjala vacía para mantener Turnstile desactivado.
export const TURNSTILE_SITE_KEY = '';
// Actívalo solo después de configurar Formspree y el límite KV en Vercel.
export const CONTACT_FORM_ENABLED = false;

export const CONTACT = {
  email: EMAIL,
  instagram: INSTAGRAM_URL,
  tiktok: TIKTOK_URL,
  whatsapp: WHATSAPP,
  whatsappMessage: 'Hola, quiero cotizar una página web para mi negocio.',
};

export function whatsappUrl() {
  return `https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20cotizar%20una%20p%C3%A1gina%20web%20para%20mi%20negocio.`;
}

export function emailUrl() {
  return `mailto:${EMAIL}?subject=${encodeURIComponent('Cotización de página web')}`;
}
