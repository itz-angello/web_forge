# WebForge

Sitio público de WebForge en HTML, CSS y JavaScript nativo, con captura segura de leads mediante Vercel Functions, Supabase y Resend. El frontend no usa frameworks.

## Estructura principal

- `index.html`, `css/`, `js/`: sitio público. El formulario envía a `/api/lead`.
- `api/lead.js`: validación, límite anti-spam, guardado y aviso por correo.
- `sql/schema.sql`: tablas, RLS, índices y contador de envíos por hora.
- `admin/`: panel privado con Supabase Auth.
- `js/config.js`: URL de Supabase y anon key pública para el navegador. Nunca poner aquí la service role key.

## Puesta en marcha

### 1. Crear el proyecto de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/) y guarda la URL del proyecto, la anon/public key y la service_role key desde **Project Settings → API**.
2. En **SQL Editor**, ejecuta completo `sql/schema.sql`.
3. En **Authentication → Providers / Sign In**, desactiva el registro público (Allow new users to sign up). Deja habilitado el acceso por correo y contraseña.
4. En **Authentication → Users**, agrega tu usuario admin con tu correo y una contraseña segura. No hay formulario de registro en el panel.
5. En `js/config.js`, reemplaza `SUPABASE_URL` y `SUPABASE_ANON_KEY` por la URL y la anon key. Esta llave es pública y está limitada por las políticas RLS. No copies la service_role key al código del navegador.

RLS permite insertar leads anónimos únicamente. Leads, clientes y proyectos solo se pueden consultar o modificar con una sesión autenticada. El contador de límite por IP no es visible para clientes ni usuarios del panel.

### 2. Configurar correo con Resend

1. Crea una cuenta en [Resend](https://resend.com/) y genera una API key.
2. Para producción, verifica tu dominio remitente en Resend. Define el remitente, por ejemplo `WebForge <avisos@tudominio.com>`. Resend permite usar `onboarding@resend.dev` durante pruebas limitadas.

### 3. Variables en Vercel

En el proyecto de Vercel abre **Settings → Environment Variables** y agrega estas variables para Development, Preview y Production según necesites:

| Variable | Valor |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | anon/public key (el frontend estático usa la copia en `js/config.js`) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key de Supabase; secreta, solo backend |
| `RESEND_API_KEY` | API key de Resend; secreta, solo backend |
| `NOTIFY_EMAIL` | correo donde recibirás los avisos |
| `RESEND_FROM_EMAIL` | opcional; remitente verificado, por ejemplo `WebForge <avisos@tudominio.com>` |

`RESEND_FROM_EMAIL` es opcional y no está en `.env.example` como variable activa: sin ella el código usa el remitente de prueba de Resend. Las variables secretas también pueden copiarse localmente desde `.env.example` a `.env`; `.env` está excluido de Git.

Instala dependencias con `npm install`. En Vercel importa el repositorio, deja Framework Preset en **Other** y Root Directory en la raíz. Al guardar variables nuevas, vuelve a desplegar para que las funciones las reciban. Vercel detecta automáticamente `api/lead.js` como `/api/lead`.

### 4. Probar el flujo completo

1. Despliega el sitio y abre la sección Contacto. Envía un lead de prueba con nombre, negocio, WhatsApp, tipo de proyecto y mensaje de al menos 10 caracteres. El correo es opcional.
2. La página debe mostrar **Mensaje enviado**. Desde la cuarta solicitud de la misma IP dentro de la hora, la API responde con el límite alcanzado.
3. Revisa `NOTIFY_EMAIL` y confirma que el correo contiene los datos y el enlace directo a WhatsApp. En pruebas locales, revisa también los logs de `vercel dev` si algo falla.
4. Abre `https://TU-DOMINIO/admin/`, inicia sesión con el usuario creado en Supabase y busca el lead. Puedes cambiar estado, añadir notas, abrir WhatsApp y convertir el lead en cliente/proyecto.
5. En la pestaña Proyectos aparecerá el proyecto creado con estado, precio, anticipo y fecha de entrega.

## Desarrollo local

```bash
npm install
npx vercel dev
```

Configura las variables en `.env.local` (no la subas a Git) y visita `http://localhost:3000`. La función necesita que también hayas ejecutado `sql/schema.sql` en Supabase. No se necesita instalar ningún framework frontend.
