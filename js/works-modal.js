/* ==========================================================================
   WEBFORGE — MÓDULO: MODAL DE TRABAJOS (DEMOS)
   ========================================================================== */

import { WHATSAPP, emailUrl, whatsappUrl } from './config.js';

export const DEMOS_DATA = {
  restaurante: {
    tipo: 'Restaurante & Cafetería',
    nombre: 'Restaurante de demostración',
    ubicacion: 'Zona 10, Ciudad de Guatemala',
    objetivo: 'Facilitar que los clientes consulten el menú y hagan pedidos directos por WhatsApp.',
    solucion: [
      'Menú digital interactivo con fotos y platillos del día.',
      'Botón flotante "Pedir por WhatsApp" que envía el pedido desglosado.',
      'Integración directa con Waze y Google Maps para clientes que van al local.',
      'Diseño adaptable para consultar el menú desde el celular.'
    ],
    tiempoDesarrollo: 'Plazo estimado: 7 días',
    mensajeWa: 'Hola WebForge, vi la demo de Restaurante (Restaurante de demostración) y me gustaría una página web similar para mi negocio gastronómico.'
  },
  clinica: {
    tipo: 'Clínica Dental & Salud',
    nombre: 'Clínica de demostración',
    ubicacion: 'Antigua Guatemala, Sacatepéquez',
    objetivo: 'Transmitir confianza médica inmediata a pacientes nuevos y facilitar la reserva de citas sin fricción.',
    solucion: [
      'Presentación clara de especialidades (Ortodoncia, Implantes, Estética).',
      'Botón para consultar disponibilidad y solicitar una cita por WhatsApp.',
      'Perfil profesional con información autorizada por la clínica.',
      'Preguntas frecuentes y mapa interactivo con estacionamientos cercanos.'
    ],
    tiempoDesarrollo: 'Plazo estimado: 7 días',
    mensajeWa: 'Hola WebForge, vi la demo de Clínica Dental y me interesa una web profesional para mi consultorio médico.'
  },
  tienda: {
    tipo: 'Comercio Local / Tienda',
    nombre: 'Tienda de demostración',
    ubicacion: 'Quetzaltenango (Xela), Guatemala',
    objetivo: 'Centralizar su catálogo para envíos a toda Guatemala sin depender solo de mensajes sueltos de Instagram.',
    solucion: [
      'Catálogo visual clasificado por categorías (calzado, cinturones, bolsos).',
      'Carrito de compras simplificado con checkout directo a WhatsApp.',
      'Información sobre opciones de envío y cobertura.',
      'Panel sencillo para actualizar fotos y detalles de productos.'
    ],
    tiempoDesarrollo: 'Plazo estimado: 7 días',
    mensajeWa: 'Hola WebForge, me interesó la demo de Tienda (Mundo Cuero). Quisiera montar mi catálogo en línea para vender por WhatsApp a toda Guatemala.'
  },
  abogado: {
    tipo: 'Bufete Jurídico & Consultoría',
    nombre: 'Bufete de demostración',
    ubicacion: 'Zona 14, Ciudad de Guatemala',
    objetivo: 'Proyectar autoridad y captar consultas de empresas y particulares que buscan asesoría legal urgente en internet.',
    solucion: [
      'Estructura limpia enfocada en Derecho Corporativo, Notarial y Litigios.',
      'Botón de contacto directo con el abogado de turno para emergencias.',
      'Formulario de contacto para consultas legales.',
      'Información sobre dominio y correo institucional según el alcance.'
    ],
    tiempoDesarrollo: 'Plazo estimado: 7 días',
    mensajeWa: 'Hola WebForge, vi la demo de Bufete Jurídico y quiero una web formal y seria para mi despacho profesional.'
  }
};

export function initWorksModal() {
  const workCards = document.querySelectorAll('.work-card');
  const modalBackdrop = document.getElementById('work-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalTypePill = document.getElementById('modal-type-pill');
  const modalLocation = document.getElementById('modal-location');
  const modalObjective = document.getElementById('modal-objective');
  const modalFeatures = document.getElementById('modal-features');
  const modalTime = document.getElementById('modal-time');
  const modalWaLink = document.getElementById('modal-wa-link');
  const modalEmailLink = document.getElementById('modal-email-link');

  if (!modalBackdrop || !modalCloseBtn) return;

  let lastActiveElement = null;

  const openModal = (demoKey) => {
    const data = DEMOS_DATA[demoKey];
    if (!data) return;

    lastActiveElement = document.activeElement;

    if (modalTitle) modalTitle.textContent = data.nombre;
    if (modalTypePill) modalTypePill.textContent = data.tipo;
    if (modalLocation) modalLocation.textContent = data.ubicacion;
    if (modalObjective) modalObjective.textContent = data.objetivo;
    if (modalTime) modalTime.textContent = data.tiempoDesarrollo;

    if (modalFeatures) {
      const items = data.solucion.map((item) => {
        const listItem = document.createElement('li');
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 20 20');
        icon.setAttribute('fill', 'currentColor');
        icon.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill-rule', 'evenodd');
        path.setAttribute('d', 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z');
        path.setAttribute('clip-rule', 'evenodd');
        icon.append(path);
        const text = document.createElement('span');
        text.textContent = item;
        listItem.append(icon, text);
        return listItem;
      });
      modalFeatures.replaceChildren(...items);
    }

    const hasWhatsApp = /^502\d{8}$/.test(WHATSAPP);
    if (modalWaLink) {
      if (hasWhatsApp) {
        modalWaLink.href = whatsappUrl(data.mensajeWa);
        modalWaLink.hidden = false;
      } else {
        modalWaLink.removeAttribute('href');
        modalWaLink.hidden = true;
      }
    }
    if (modalEmailLink) {
      modalEmailLink.href = emailUrl('Consulta por una página web', `Hola WebForge, me interesa una página como la demo ${data.nombre}.`);
      modalEmailLink.hidden = hasWhatsApp;
    }

    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => modalCloseBtn.focus(), 50);
  };

  const closeModal = () => {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastActiveElement) lastActiveElement.focus();
  };

  workCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      const demoKey = card.getAttribute('data-demo');
      openModal(demoKey);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const demoKey = card.getAttribute('data-demo');
        openModal(demoKey);
      }
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeModal();
    }
  });
}

