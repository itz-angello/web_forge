# WebForge

Sitio en HTML, CSS y JavaScript nativo, con una función serverless opcional para el formulario. No usa base de datos propia ni dependencias de npm.

## Configuración

Los canales públicos se centralizan en `js/config.js`:

- `EMAIL`, `INSTAGRAM_URL`, `TIKTOK_URL`: canales de contacto y perfiles oficiales.
- `WHATSAPP`: número de Guatemala con formato `502XXXXXXXX`. Si queda vacío, los enlaces de WhatsApp se ocultan; al añadirlo se habilitan automáticamente.
- `TURNSTILE_SITE_KEY`: clave pública de Cloudflare Turnstile. Déjala vacía para mantener el CAPTCHA desactivado.
- `CONTACT_FORM_ENABLED`: permanece en `false` hasta que completes las variables del servidor y publiques la función.

Los valores de `js/config.js` son públicos. No pongas contraseñas ni claves secretas. Para habilitar el formulario, configura en Vercel las variables de `.env.example`: `FORMSPREE_ENDPOINT`, `KV_REST_API_URL` y `KV_REST_API_TOKEN`. La función valida el endpoint y solo permite destinos HTTPS de `formspree.io`. Después cambia `CONTACT_FORM_ENABLED` a `true`.

Para activar Turnstile, añade la clave pública a `TURNSTILE_SITE_KEY`, guarda `TURNSTILE_SECRET_KEY` solo en Vercel y establece `TURNSTILE_ENABLED=true`. Sin la bandera y la clave secreta, la verificación queda desactivada; si la bandera está activa pero falta la clave secreta, el envío falla de forma segura.

## Publicación

Publica la carpeta raíz en Vercel como proyecto estático (preset **Other**) para que `api/contact.js` se ejecute como función serverless. En otro hosting, configura una función equivalente para `/api/contact`. `vercel.json` define cabeceras de seguridad.

Las demos en `demos/` son páginas autónomas con contenido ficticio.
