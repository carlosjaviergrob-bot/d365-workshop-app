-- D365FO Workshop Tool — Schema v4
-- Tabla para guardar qué escenarios están activos para workshops

CREATE TABLE IF NOT EXISTS scenario_selection (
  id           uuid primary key default gen_random_uuid(),
  scenario_id  text not null unique,
  area         text not null,
  title        text not null,
  module       text,
  menu         text,
  description  text,
  fit          text default 'fit',
  active       boolean not null default false,
  updated_by   text,
  updated_at   timestamptz default now()
);

ALTER TABLE scenario_selection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access on scenario_selection"
  ON scenario_selection FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Índice para búsqueda rápida por área
CREATE INDEX IF NOT EXISTS idx_scenario_selection_area ON scenario_selection(area);
CREATE INDEX IF NOT EXISTS idx_scenario_selection_active ON scenario_selection(active);
