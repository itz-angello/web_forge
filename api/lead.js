import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createHash } from 'node:crypto';

const limits = { name: 100, business: 120, whatsapp: 24, email: 254, project_type: 100, message: 2000 };
const fieldNames = { name: 'nombre', business: 'negocio', whatsapp: 'WhatsApp', email: 'correo', project_type: 'tipo de proyecto', message: 'mensaje' };
const fail = (res, status, error) => res.status(status).json({ ok: false, error });

function validate(body) {
  const required = ['name', 'business', 'whatsapp', 'project_type', 'message'];
  for (const key of required) {
    if (typeof body[key] !== 'string' || !body[key].trim()) return `El campo ${fieldNames[key]} es obligatorio.`;
  }
  for (const [key, max] of Object.entries(limits)) {
    if (body[key] != null && (typeof body[key] !== 'string' || body[key].length > max)) return `El campo ${fieldNames[key]} supera el largo permitido (${max} caracteres).`;
  }
  if (body.name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (body.business.trim().length < 2) return 'El negocio debe tener al menos 2 caracteres.';
  if ((body.whatsapp.match(/\d/g) || []).length < 8 || !/^\+?[\d\s().-]+$/.test(body.whatsapp)) return 'Ingresa un número de WhatsApp válido (mínimo 8 dígitos).';
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Ingresa un correo electrónico válido.';
  if (body.message.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Método no permitido.');
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (body.website != null && String(body.website).trim()) return fail(res, 400, 'No se pudo procesar la solicitud.');
  const validationError = validate(body);
  if (validationError) return fail(res, 400, validationError);

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida').toString().split(',')[0].trim();
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const ipHash = createHash('sha256').update(ip).digest('hex');
    const { data: allowed, error: rateError } = await supabase.rpc('consume_lead_attempt', { p_ip_hash: ipHash });
    if (rateError) throw rateError;
    if (!allowed) return fail(res, 429, 'Has alcanzado el límite de 3 solicitudes por hora. Inténtalo más tarde.');

    const lead = {
      name: body.name.trim(), business: body.business.trim(), whatsapp: body.whatsapp.trim(),
      email: body.email?.trim() || null, project_type: body.project_type.trim(), message: body.message.trim(),
      source: 'sitio_web',
    };
    const { data, error: insertError } = await supabase.from('leads').insert(lead).select('id').single();
    if (insertError) throw insertError;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const digits = lead.whatsapp.replace(/\D/g, '');
    const whatsappNumber = digits.length === 8 ? `502${digits}` : digits;
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    const html = `<h2>Nuevo lead de WebForge</h2><p><b>Nombre:</b> ${escapeHtml(lead.name)}</p><p><b>Negocio:</b> ${escapeHtml(lead.business)}</p><p><b>WhatsApp:</b> <a href="${whatsappUrl}">${escapeHtml(lead.whatsapp)}</a></p><p><b>Correo:</b> ${escapeHtml(lead.email || 'No indicó')}</p><p><b>Proyecto:</b> ${escapeHtml(lead.project_type)}</p><p><b>Mensaje:</b><br>${escapeHtml(lead.message).replace(/\n/g, '<br>')}</p><p><b>ID:</b> ${data.id}</p>`;
    const { error: mailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WebForge <onboarding@resend.dev>',
      to: process.env.NOTIFY_EMAIL, subject: `Nuevo lead: ${lead.name} — ${lead.business}`,
      html,
    });
    if (mailError) {
      console.error('Resend no pudo enviar la notificación:', mailError);
      return res.status(201).json({ ok: true, aviso: 'Lead guardado; no se pudo enviar el correo de aviso.' });
    }
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error al recibir lead:', error);
    return fail(res, 500, 'No pudimos guardar tu solicitud. Inténtalo de nuevo en unos minutos.');
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
