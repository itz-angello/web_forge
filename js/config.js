/* ==========================================================================
   WEBFORGE — CONFIGURACIÓN GLOBAL
   (Supabase y WhatsApp)
   ========================================================================== */

// 1. Configuración de Supabase
// Reemplaza estos dos valores con los de tu panel de Supabase (Settings > API):
export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'TU-ANON-KEY-AQUI';

// 2. Número de WhatsApp para recibir contactos (Guatemala: 502 + 8 dígitos)
export const WHATSAPP_PHONE = '50255551234';

// 3. Inicializador del cliente Supabase
export function getSupabaseClient() {
  if (typeof window.supabase !== 'undefined' && !SUPABASE_URL.includes('TU-PROYECTO')) {
    try {
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.warn('WebForge: No se pudo conectar con Supabase:', err);
    }
  }
  return null;
}

