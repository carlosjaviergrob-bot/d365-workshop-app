-- D365FO Workshop Tool — Schema v2
-- Ejecutar en: app.supabase.com → tu proyecto → SQL Editor → New query
-- IMPORTANTE: Ejecutar DESPUÉS del schema v1 (supabase-schema.sql)

-- ── 1. Tabla de consultores (maestro) ────────────────────────────────────────
create table if not exists consultants (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  full_name   text not null,
  role        text not null default 'consultant' check (role in ('admin', 'lead', 'consultant')),
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- ── 2. Tabla de miembros de proyecto ─────────────────────────────────────────
create table if not exists project_members (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  consultant_id uuid references consultants(id) on delete cascade,
  area          text,   -- área asignada: Finanzas, Operaciones, etc.
  added_by      text,
  added_at      timestamptz default now(),
  unique (project_id, consultant_id)
);

-- ── 3. Agregar columna owner a projects ──────────────────────────────────────
alter table projects add column if not exists owner_email text;

-- ── 4. RLS — consultants ─────────────────────────────────────────────────────
alter table consultants enable row level security;

-- Todos los autenticados pueden ver el maestro de consultores
create policy "Authenticated users can view consultants"
  on consultants for select to authenticated using (true);

-- Solo admin y lead pueden insertar/editar/eliminar consultores
create policy "Admin and lead can manage consultants"
  on consultants for all to authenticated
  using (
    exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  )
  with check (
    exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  );

-- ── 5. RLS — projects ────────────────────────────────────────────────────────
-- Eliminar política anterior
drop policy if exists "Authenticated users full access on projects" on projects;

-- Solo ve proyectos donde está asignado (o es admin/lead)
create policy "Members can view their projects"
  on projects for select to authenticated
  using (
    exists (
      select 1 from project_members pm
      join consultants c on c.id = pm.consultant_id
      where pm.project_id = projects.id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  );

-- Solo admin y lead pueden crear proyectos
create policy "Admin and lead can create projects"
  on projects for insert to authenticated
  with check (
    exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  );

-- Admin, lead, o miembros del proyecto pueden editar
create policy "Admin lead and members can update projects"
  on projects for update to authenticated
  using (
    exists (
      select 1 from project_members pm
      join consultants c on c.id = pm.consultant_id
      where pm.project_id = projects.id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
    )
  );

-- Solo admin y lead pueden eliminar proyectos
create policy "Admin and lead can delete projects"
  on projects for delete to authenticated
  using (
    exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  );

-- ── 6. RLS — responses ───────────────────────────────────────────────────────
drop policy if exists "Authenticated users full access on responses" on responses;

create policy "Members can access responses of their projects"
  on responses for all to authenticated
  using (
    exists (
      select 1 from project_members pm
      join consultants c on c.id = pm.consultant_id
      where pm.project_id = responses.project_id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
    )
  )
  with check (
    exists (
      select 1 from project_members pm
      join consultants c on c.id = pm.consultant_id
      where pm.project_id = responses.project_id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
    )
  );

-- ── 7. RLS — notes ───────────────────────────────────────────────────────────
drop policy if exists "Authenticated users full access on notes" on notes;

create policy "Members can access notes of their projects"
  on notes for all to authenticated
  using (
    exists (
      select 1 from project_members pm
      join consultants c on c.id = pm.consultant_id
      where pm.project_id = notes.project_id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
    )
  )
  with check (
    exists (
      select 1 from project_members pm
      join consultants c on c.id = pm.consultant_id
      where pm.project_id = notes.project_id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
    )
  );

-- ── 8. RLS — project_members ─────────────────────────────────────────────────
alter table project_members enable row level security;

create policy "Members and leads can view project members"
  on project_members for select to authenticated
  using (
    exists (
      select 1 from project_members pm2
      join consultants c on c.id = pm2.consultant_id
      where pm2.project_id = project_members.project_id
      and c.email = auth.jwt() ->> 'email'
    )
    or exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
    )
  );

create policy "Admin and lead can manage project members"
  on project_members for all to authenticated
  using (
    exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  )
  with check (
    exists (
      select 1 from consultants c
      where c.email = auth.jwt() ->> 'email'
      and c.role in ('admin', 'lead')
      and c.active = true
    )
  );

-- ── 9. Insertar el primer admin ───────────────────────────────────────────────
-- IMPORTANTE: reemplazar con el email del admin real antes de ejecutar
insert into consultants (email, full_name, role)
values ('TU_EMAIL@empresa.com', 'Administrador', 'admin')
on conflict (email) do nothing;
