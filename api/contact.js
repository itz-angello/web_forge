const { createHmac, randomUUID } = require('node:crypto');
const { isIP } = require('node:net');

const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 3;
const MIN_COMPLETION_MS = 4000;
const MAX_BODY_BYTES = 16 * 1024;
const PROJECT_TYPES = new Set([
  'Diseño Web Básico ($899)',
  'Web Profesional ($1,899)',
  'Tienda en Línea ($2,999)',
  'SEO Local en Google',
  'Otro / Asesoría Personalizada',
]);

function send(res, status, message) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json({ message });
}

function parseFields(body) {
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) return body;
  const raw = Buffer.isBuffer(body) ? body.toString('utf8') : String(body || '');
  return Object.fromEntries(new URLSearchParams(raw));
}

function clean(value, maxLength, allowNewlines = false) {
  if (typeof value !== 'string') return null;
  const controls = allowNewlines ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  const normalized = value.replace(controls, '').trim();
  return normalized.length <= maxLength ? normalized : null;
}

function getClientIp(req) {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && isIP(realIp.trim())) return realIp.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const candidates = forwarded.split(',').map((value) => value.trim());
    const trustedProxyValue = candidates.at(-1);
    if (trustedProxyValue && isIP(trustedProxyValue)) return trustedProxyValue;
  }
  return null;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin !== 'string' || typeof host !== 'string') return false;
  try {
    const parsed = new URL(origin);
    const forwardedProto = req.headers['x-forwarded-proto'];
    const expectedProtocol = process.env.NODE_ENV === 'production' || forwardedProto === 'https' ? 'https:' : parsed.protocol;
    return parsed.origin === `${expectedProtocol}//${host}`;
  } catch {
    return false;
  }
}

async function allowSubmission(ip) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!base || !token) throw new Error('rate_limit_not_configured');

  const key = `webforge:contact:${createHmac('sha256', token).update(ip).digest('hex')}`;
  const now = Date.now();
  const script = "local k=KEYS[1]; local now=tonumber(ARGV[1]); local window=tonumber(ARGV[2]); local member=ARGV[3]; redis.call('ZREMRANGEBYSCORE',k,'-inf',now-window); local count=redis.call('ZCARD',k); if count >= 3 then redis.call('EXPIRE',k,3600); return 0 end; redis.call('ZADD',k,now,member); redis.call('EXPIRE',k,3600); return 1";
  const url = `${base.replace(/\/$/, '')}/eval/${encodeURIComponent(script)}/1/${encodeURIComponent(key)}/${now}/${WINDOW_MS}/${randomUUID()}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000), redirect: 'error' });
  if (!response.ok) throw new Error('rate_limit_unavailable');
  const result = await response.json();
  if (result.result !== 1) return false;
  return true;
}

async function verifyTurnstile(token, ip, host) {
  if (process.env.TURNSTILE_ENABLED !== 'true') return true;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  if (!token || typeof token !== 'string' || token.length > 2048) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(8000),
    redirect: 'error',
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true && result.hostname === host;
}

function getFormspreeUrl(value) {
  if (typeof value !== 'string' || value.length > 512 || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'formspree.io' || !/^\/f\/[A-Za-z0-9]+$/.test(url.pathname) || url.search || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, 'Método no permitido.');
  }
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) return send(res, 413, 'El formulario excede el tamaño permitido.');
  if (!/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(String(req.headers['content-type'] || ''))) {
    return send(res, 415, 'Formato de formulario no permitido.');
  }
  if (!sameOrigin(req)) return send(res, 403, 'No se pudo validar el origen de la solicitud.');

  let fields;
  try {
    fields = parseFields(req.body);
  } catch {
    return send(res, 400, 'No se pudo leer el formulario.');
  }
  if (Buffer.byteLength(JSON.stringify(fields)) > MAX_BODY_BYTES) {
    return send(res, 413, 'El formulario excede el tamaño permitido.');
  }

  // Los bots que llenan el honeypot reciben una respuesta neutra y no generan correo.
  if (fields.website !== undefined && typeof fields.website !== 'string') return send(res, 400, 'Formato de formulario no permitido.');
  if (typeof fields.website === 'string' && fields.website.trim()) return send(res, 200, 'Solicitud recibida.');

  const now = Date.now();
  const startedAt = Number(fields.started_at);
  if (!Number.isFinite(startedAt) || startedAt > now || now - startedAt < MIN_COMPLETION_MS || now - startedAt > 60 * 60 * 1000) {
    return send(res, 400, 'Espera un momento y vuelve a enviar el formulario.');
  }

  const name = clean(fields.name, 120);
  const business = clean(fields.business, 160);
  const whatsapp = clean(fields.whatsapp, 30);
  const emailProvided = fields.email !== undefined && fields.email !== '';
  const email = clean(emailProvided ? fields.email : '', 254);
  const projectType = clean(fields.project_type, 64);
  const message = clean(fields.message, 4000, true);
  const digits = whatsapp?.replace(/\D/g, '') || '';
  const validEmail = !emailProvided || Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (!name || name.length < 2 || !business || business.length < 2 || !whatsapp || !/^[+()\d\s.-]+$/.test(whatsapp) || digits.length < 8 || digits.length > 18 || !validEmail || !projectType || !PROJECT_TYPES.has(projectType) || !message || message.length < 10) {
    return send(res, 400, 'Revisa los datos del formulario e inténtalo de nuevo.');
  }

  const ip = getClientIp(req);
  if (!ip) return send(res, 503, 'El servicio de contacto no está disponible en este momento.');
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  try {
    if (!(await verifyTurnstile(fields['cf-turnstile-response'], ip, host))) {
      return send(res, 400, 'Completa la verificación anti-spam e inténtalo de nuevo.');
    }
  } catch {
    return send(res, 503, 'El servicio de verificación no está disponible.');
  }

  const endpoint = getFormspreeUrl(fields.formspree_endpoint);
  if (!endpoint) return send(res, 503, 'El servicio de contacto aún no está configurado.');
  try {
    if (!(await allowSubmission(ip))) return send(res, 429, 'Se alcanzó el límite de envíos. Inténtalo más tarde.');
  } catch {
    return send(res, 503, 'El servicio de contacto no está disponible en este momento.');
  }

  const payload = new URLSearchParams({ name, business, whatsapp, email, project_type: projectType, message });
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
      signal: AbortSignal.timeout(8000),
      redirect: 'manual',
    });
    if (!upstream.ok) return send(res, upstream.status === 429 ? 429 : 502, 'No se pudo enviar el formulario. Inténtalo más tarde.');
  } catch {
    return send(res, 502, 'No se pudo enviar el formulario. Inténtalo más tarde.');
  }
  return send(res, 200, 'Solicitud recibida.');
};
