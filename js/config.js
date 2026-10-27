/* Datos públicos del sitio. No guardes contraseñas ni claves secretas aquí. */
export const CONTACT = {
  whatsapp: '', // Código de país + número, solo dígitos.
  whatsappMessage: 'Hola WebForge, quiero consultar sobre una página web.',
  email: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  formspreeEndpoint: '', // Endpoint de Formspree, si habilitas el formulario.
};

export function whatsappUrl(message = CONTACT.whatsappMessage) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}
