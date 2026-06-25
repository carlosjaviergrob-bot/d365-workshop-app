-- D365FO Workshop Tool — Schema para Supabase
-- Ejecutar en: app.supabase.com → tu proyecto → SQL Editor → New query

-- Habilitar RLS (Row Level Security) — cada usuario ve todos los proyectos del equipo
-- En un equipo de consultores, todos comparten la misma vista

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text not null,
  area        text not null default 'Finanzas',
  status      text not null default 'En curso',
  created_by  text,
  created_at  timestamptz default now()
);

create table if not exists responses (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade,
  scenario_id  text not null,
  answer       text check (answer in ('si', 'no', 'dif')),
  note         text default '',
  consultant   text,
  updated_at   timestamptz default now(),
  unique (project_id, scenario_id)
);

create table if not exists notes (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade,
  scenario_id  text not null,
  text         text not null,
  author       text,
  created_at   timestamptz default now()
);

-- Row Level Security: cualquier usuario autenticado puede leer y escribir todo
-- (apropiado para un equipo interno de consultores)
alter table projects  enable row level security;
alter table responses enable row level security;
alter table notes     enable row level security;

create policy "Authenticated users full access on projects"
  on projects for all to authenticated using (true) with check (true);

create policy "Authenticated users full access on responses"
  on responses for all to authenticated using (true) with check (true);

create policy "Authenticated users full access on notes"
  on notes for all to authenticated using (true) with check (true);
