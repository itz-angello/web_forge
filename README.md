# WebForge

Sitio informativo estático en HTML, CSS y JavaScript nativo. No requiere servidor de aplicación, base de datos, dependencias ni claves secretas.

## Configuración

Edita `js/config.js` antes de publicar:

- `whatsapp`: código de país y número, solo dígitos.
- `whatsappMessage`: mensaje inicial de WhatsApp.
- `email`: correo público de contacto.
- `instagram`, `facebook`, `linkedin`: URLs completas de tus perfiles; deja vacío el canal que no uses.
- `formspreeEndpoint`: URL de endpoint de Formspree. Si queda vacío, el formulario informa que no está configurado y ofrece WhatsApp como alternativa.

Los valores de `js/config.js` son públicos. No pongas contraseñas ni claves secretas. Para habilitar el formulario, crea un formulario en Formspree y pega su endpoint.

## Publicación

Publica la carpeta raíz en Vercel como proyecto estático (preset **Other**), o en cualquier hosting estático. `vercel.json` define cabeceras de seguridad. El formulario requiere permitir `https://formspree.io` en CSP, como ya está configurado.

Las demos en `demos/` son páginas autónomas con contenido ficticio.
