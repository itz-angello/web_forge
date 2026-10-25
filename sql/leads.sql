-- =========================================================================
-- TABLA Y POLÍTICA DE SEGURIDAD (RLS) PARA WEBFORGE EN SUPABASE
-- =========================================================================

-- 1. Crear tabla de leads (prospectos)
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

-- 3. Crear política para permitir SOLO inserción pública (rol 'anon')
-- Al no definir políticas para SELECT, UPDATE o DELETE, nadie desde el navegador
-- podrá consultar, modificar o eliminar los registros capturados.
DROP POLICY IF EXISTS "Permitir solo insertar leads desde la web" ON public.leads;

CREATE POLICY "Permitir solo insertar leads desde la web"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

