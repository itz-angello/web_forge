# WebForge

Sitio informativo estático en HTML, CSS y JavaScript nativo. No requiere servidor de aplicación, base de datos, dependencias ni claves secretas.

## Configuración

Los canales públicos se centralizan en `js/config.js`:

- `EMAIL`, `INSTAGRAM_URL`, `TIKTOK_URL`: canales de contacto y perfiles oficiales.
- `WHATSAPP`: número de Guatemala con formato `502XXXXXXXX`. Si queda vacío, los enlaces de WhatsApp se ocultan; al añadirlo se habilitan automáticamente.
- `formspreeEndpoint`: URL de endpoint de Formspree. Si queda vacío, el formulario informa que no está configurado y ofrece los canales directos disponibles.

Los valores de `js/config.js` son públicos. No pongas contraseñas ni claves secretas. Para habilitar el formulario, crea un formulario en Formspree y pega su endpoint.

## Publicación

Publica la carpeta raíz en Vercel como proyecto estático (preset **Other**), o en cualquier hosting estático. `vercel.json` define cabeceras de seguridad. El formulario requiere permitir `https://formspree.io` en CSP, como ya está configurado.

Las demos en `demos/` son páginas autónomas con contenido ficticio.
