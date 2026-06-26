-- D365FO Workshop Tool — Schema v3
-- Ejecutar en: app.supabase.com → tu proyecto → SQL Editor → New query
-- Agregar campo specialty a la tabla consultants

ALTER TABLE consultants 
ADD COLUMN IF NOT EXISTS specialty text DEFAULT 'ambas' 
CHECK (specialty IN ('finanzas', 'operaciones', 'ambas'));
