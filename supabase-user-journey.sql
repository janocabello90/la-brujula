-- =============================================
-- Las Rutas — user_journey table
-- =============================================
-- Tabla central que trackea el estado del usuario en Las Rutas.
-- Una fila por usuario. Se actualiza automáticamente con triggers
-- cuando completa hitos en las herramientas existentes.
--
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Create the user_journey table
create table if not exists public.user_journey (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,

  -- Estado general
  current_phase integer default 1 check (current_phase between 1 and 5),
  phase_started_at jsonb default '{"1": null}'::jsonb,
    -- {"1": "2026-04-01T10:00:00Z", "2": "2026-04-15T...", ...}

  -- Fase 1: Pirámide (Quién eres)
  piramide_completada boolean default false,
  piramide_niveles jsonb default '{}'::jsonb,
    -- {"bajo_tierra": true, "nivel_1": true, "nivel_2": false, "nivel_3": false}
  perfil_piramide jsonb default '{}'::jsonb,
    -- Datos extraídos de cada nivel completado
  profundidad_score integer default 0 check (profundidad_score between 0 and 100),

  -- Fase 2: Diagnóstico (Cómo te ve el mundo)
  arbol_completado boolean default false,
  diagnostico_coherencia jsonb default '{}'::jsonb,
    -- {score: 72, grietas: [...], fortalezas: [...]}
  perfil_diagnostico text check (perfil_diagnostico in ('A', 'B', 'C', 'D')),
    -- A: Cimientos débiles
    -- B: Raíces fuertes, ramas débiles (→ Ruta Visibilidad)
    -- C: Ramas grandes, raíces flojas (→ Ruta Reconstrucción)
    -- D: Alineado pero invisible (→ Ruta Difusión)

  -- Fase 3: Ruta (Tu camino)
  ruta_asignada text check (ruta_asignada in ('cimientos', 'visibilidad', 'reconstruccion', 'difusion')),
  ruta_modulos jsonb default '[]'::jsonb,
    -- [{id: "mod1", nombre: "...", completado: false, fecha: null}]
  ruta_iniciada boolean default false,

  -- Fase 4-5: Ejecución y evolución
  coherencia_historica jsonb default '[]'::jsonb,
    -- [{fecha: "2026-05-01", score: 65}, {fecha: "2026-06-01", score: 72}]
  piezas_count integer default 0,
  coherencia_media_piezas numeric(5,2) default 0,
  ultima_revision timestamptz,

  -- Coaching (panel de Jano)
  coaching_habilitado boolean default false,
  notas_coach jsonb default '[]'::jsonb,
    -- [{fecha: "...", nota: "...", fase: 2}]

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.user_journey enable row level security;

-- 3. RLS Policies

-- Users can view their own journey
create policy "Users can view own journey"
  on public.user_journey for select
  using (auth.uid() = user_id);

-- Users can insert their own journey
create policy "Users can insert own journey"
  on public.user_journey for insert
  with check (auth.uid() = user_id);

-- Users can update their own journey
create policy "Users can update own journey"
  on public.user_journey for update
  using (auth.uid() = user_id);

-- Admin (Jano) can view all journeys where coaching is enabled
create policy "Admin can view coaching journeys"
  on public.user_journey for select
  using (
    coaching_habilitado = true
    AND auth.jwt() ->> 'email' in ('janocabellom@gmail.com', 'jano.cmg@gmail.com')
  );

-- Admin can update coaching notes on enabled journeys
create policy "Admin can update coaching notes"
  on public.user_journey for update
  using (
    coaching_habilitado = true
    AND auth.jwt() ->> 'email' in ('janocabellom@gmail.com', 'jano.cmg@gmail.com')
  );

-- 4. Index for efficient queries
create index idx_user_journey_user on public.user_journey(user_id);
create index idx_user_journey_phase on public.user_journey(current_phase);

-- 5. Auto-update updated_at
create or replace function public.update_user_journey_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_journey_updated
  before update on public.user_journey
  for each row execute procedure public.update_user_journey_timestamp();

-- 6. Auto-create user_journey when profile is created
-- (This extends the existing handle_new_user trigger)
create or replace function public.handle_new_user_journey()
returns trigger as $$
begin
  insert into public.user_journey (user_id, current_phase, phase_started_at)
  values (new.id, 1, jsonb_build_object('1', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: when a new profile is created, auto-create user_journey
drop trigger if exists on_profile_created_journey on public.profiles;

create trigger on_profile_created_journey
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_journey();
