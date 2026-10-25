# WebForge — Agencia de Páginas Web para Negocios en Guatemala

Sitio web oficial de **WebForge**, agencia de diseño y desarrollo web para negocios locales en Guatemala (restaurantes, clínicas, tiendas, bufetes y profesionales). Construido con **HTML5 semántico, CSS3 modular y JavaScript moderno nativo (ES Modules, sin frameworks ni dependencias pesadas)**.

---

## 📁 Estructura del Proyecto

El código está organizado de forma modular, donde cada archivo cumple una función específica y se mantiene por debajo de las 250 líneas:

```text
web_forge/
├── index.html             # Estructura semántica completa del sitio
├── README.md              # Documentación y guía de despliegue
├── css/
│   ├── variables.css      # Colores (--ink, --steel, --bg, --accent, --spark), fuentes y radios
│   ├── base.css           # Reset CSS, accesibilidad y estilos base
│   ├── layout.css         # Contenedores, grillas y tipografía responsiva
│   ├── components.css     # Botones, modal, alertas, inputs y botón flotante
│   └── sections/
│       ├── header.css     # Barra de navegación fija y menú móvil
│       ├── hero.css       # Promesa principal y deslizador antes/después
│       ├── services.css   # Tarjetas de servicios con jerarquía asimétrica
│       ├── works.css      # 4 Demos ficticias en CSS/SVG
│       ├── process.css    # Proceso de 4 pasos con tiempos reales
│       ├── pricing.css    # 3 Planes de precios y tarjeta de garantía
│       ├── faq.css        # Acordeón de preguntas frecuentes
│       ├── contact.css    # Distribución del formulario y canales directos
│       └── footer.css     # Pie de página y enlaces
├── js/
│   ├── main.js            # Punto de entrada principal (ES Module)
│   ├── config.js          # Credenciales de Supabase y número de WhatsApp
│   ├── menu.js            # Lógica del menú hamburguesa y drawer móvil
│   ├── compare-slider.js  # Interactividad del deslizador antes/después
│   ├── works-modal.js     # Datos y apertura/cierre accesible del modal de demos
│   ├── faq.js             # Lógica del acordeón de preguntas
│   └── contact-form.js    # Validación y guardado en Supabase
├── img/
│   ├── logo.svg           # Logo oficial de WebForge (Header y Footer)
│   ├── icon.svg           # Isotipo oficial de WebForge (Favicon)
│   └── web_forge-removebg-preview.png
└── sql/
    └── leads.sql          # Script SQL para crear la tabla 'leads' y políticas RLS
```

---

## 🎨 Sistema de Colores y Diseño

- **Tinta (`--ink`)**: `#14181F` (Texto principal y fondos oscuros).
- **Acero (`--steel`)**: `#3D4A5C` (Texto de párrafos y bordes secundarios).
- **Fondo (`--bg`)**: `#F3F5F7` (Superficie general neutra).
- **Blanco (`--white`)**: `#FFFFFF` (Superficie de tarjetas y contrastes).
- **Acento Eléctrico (`--accent`)**: `#2F6BFF` (Botones primarios, enlaces activos y elementos clave).
- **Chispa Lima (`--spark`)**: `#C6F432` (Acentos sutiles, estados activos y microdetalles).

Todas las variables de color, tipografía y sombras se encuentran centralizadas en `css/variables.css`.

---

## 🚀 Guía de Configuración y Despliegue

### 1. Cambiar el número de WhatsApp

1. **En `js/config.js` (Línea 12):**
   ```javascript
   export const WHATSAPP_PHONE = '50255551234';
   ```
   Cambia `50255551234` por el código de país de Guatemala (`502`) más tus 8 dígitos.
2. **En `index.html`:**
   Busca y actualiza los enlaces `https://wa.me/50255551234` por tu número telefónico.

---

### 2. Conectar con Supabase (Captura de Leads)

#### Paso 2.1: Ejecutar el script SQL
Abre el archivo `sql/leads.sql` o copia el siguiente bloque en el **SQL Editor** de tu panel de [Supabase](https://supabase.com):

```sql
-- 1. Crear tabla de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  business TEXT,
  whatsapp TEXT NOT NULL,
  project_type TEXT,
  message TEXT
);

-- 2. Activar Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Permitir ÚNICAMENTE inserciones públicas desde el navegador web
CREATE POLICY "Permitir solo insertar leads desde la web"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

#### Paso 2.2: Conectar tus llaves en `js/config.js`
1. En Supabase, dirígete a **Project Settings > API**.
2. Copia la **Project URL** y la **`anon` `public` key**.
3. Pégalas en `js/config.js`:
   ```javascript
   export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
   export const SUPABASE_ANON_KEY = 'TU-ANON-KEY-AQUI';
   ```

*Nota:* Si aún no has vinculado Supabase, el formulario incluye un respaldo interactivo que permite al cliente enviar sus datos completos con un solo clic directamente a WhatsApp.

---

### 3. Subir el proyecto a GitHub

```bash
git add .
git commit -m "feat: arquitectura modular css/js y nuevos colores institucionales"
git push origin itz-angello
```

---

### 4. Desplegar en Vercel

1. Entra a [Vercel](https://vercel.com) e inicia sesión con GitHub.
2. Pulsa en **Add New... > Project** e importa el repositorio `web_forge`.
3. Deja el framework en **Other / None** y el Root Directory en `./`.
4. Haz clic en **Deploy**. El sitio se publicará en segundos con certificado SSL HTTPS gratis.
