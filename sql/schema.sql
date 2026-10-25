-- Esquema de WebForge. Ejecutar completo en Supabase SQL Editor.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('nuevo', 'contactado', 'cotizado', 'ganado', 'perdido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('en_diseno', 'en_revision', 'entregado', 'mantenimiento');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL, business text NOT NULL, whatsapp text NOT NULL, email text,
  project_type text NOT NULL, message text NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'nuevo', notes text,
  source text NOT NULL DEFAULT 'sitio_web'
);
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  name text NOT NULL, business text NOT NULL, whatsapp text NOT NULL, email text
);
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL, price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  deposit_paid numeric(12,2) NOT NULL DEFAULT 0 CHECK (deposit_paid >= 0),
  status public.project_status NOT NULL DEFAULT 'en_diseno', due_date date, live_url text
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON public.clients(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon puede crear leads" ON public.leads;
CREATE POLICY "Anon puede crear leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Usuarios autenticados administran leads" ON public.leads;
CREATE POLICY "Usuarios autenticados administran leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Usuarios autenticados administran clientes" ON public.clients;
CREATE POLICY "Usuarios autenticados administran clientes" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Usuarios autenticados administran proyectos" ON public.projects;
CREATE POLICY "Usuarios autenticados administran proyectos" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads, public.clients, public.projects TO authenticated;
REVOKE ALL ON public.clients, public.projects FROM anon;

-- Contador persistente por IP y hora para que el límite funcione con serverless.
CREATE TABLE IF NOT EXISTS public.lead_rate_limits (
  ip_hash text NOT NULL, hour_start timestamptz NOT NULL, attempts integer NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, hour_start)
);
ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_rate_limits FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.consume_lead_attempt(p_ip_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE current_attempts integer;
DECLARE bucket timestamptz := date_trunc('hour', now());
BEGIN
  INSERT INTO public.lead_rate_limits(ip_hash, hour_start, attempts) VALUES (p_ip_hash, bucket, 1)
  ON CONFLICT (ip_hash, hour_start) DO UPDATE SET attempts = public.lead_rate_limits.attempts + 1
  RETURNING attempts INTO current_attempts;
  RETURN current_attempts <= 3;
END; $$;
REVOKE ALL ON FUNCTION public.consume_lead_attempt(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_lead_attempt(text) TO service_role;
