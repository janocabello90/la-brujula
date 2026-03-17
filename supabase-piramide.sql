-- =============================================
-- La Pirámide de la Marca Personal — piramide_data table
-- =============================================
-- Almacena las respuestas del usuario a los ejercicios de reflexión
-- de La Pirámide, organizados por nivel (prólogo, bajo_tierra, nivel_1-4).
-- Cada nivel contiene ejercicios con respuestas en JSONB.
--
-- Run this in the Supabase SQL Editor

-- 1. Create the piramide_data table
create table if not exists public.piramide_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,

  -- Progreso
  current_step text default 'prologo',
    -- 'prologo', 'mentalidad', 'buena_vida', 'bajo_tierra', 'nivel_1', 'nivel_2', 'nivel_3', 'nivel_4', 'completada'
  steps_completed text[] default '{}',
    -- Array de steps completados: ['prologo', 'mentalidad', ...]

  -- Prólogo: Tu historia (ejercicio de escritura libre)
  prologo jsonb default '{}'::jsonb,
    -- {
    --   el_comienzo: "...",
    --   los_nudos: "...",
    --   las_semillas: "...",
    --   la_proyeccion: "..."
    -- }

  -- Cap II: Mentalidad — Diseña tu escaparate
  mentalidad jsonb default '{}'::jsonb,
    -- {
    --   que_sienta: "...",          (qué quieres que sienta la gente)
    --   elementos_centro: "...",    (talentos, habilidades visibles)
    --   valores_ambiente: "...",    (valores que se respiran)
    --   que_recuerden: "..."        (qué quieres que recuerden)
    -- }

  -- Cap III: Éxito y Buena Vida (7 secciones)
  buena_vida jsonb default '{}'::jsonb,
    -- {
    --   definiendo_buena_vida: "...",
    --   espacios_resonancia: "...",
    --   relacion_trabajo: "...",
    --   definicion_exito: "...",
    --   principios_guia: "...",
    --   brujula_emocional: "...",
    --   recordatorio_personal: "..."
    -- }

  -- Bajo Tierra: Historia, experiencias, genética y creencias
  bajo_tierra jsonb default '{}'::jsonb,
    -- {
    --   historia_experiencias: "...",
    --   creencias_limitantes: "...",
    --   creencias_potenciadoras: "...",
    --   que_te_hace_unico: "..."
    -- }

  -- Nivel 1: Valores, propósito, visión, banderas rojas, identidad
  nivel_1 jsonb default '{}'::jsonb,
    -- {
    --   valores: "...",
    --   proposito: "...",
    --   vision: "...",
    --   banderas_rojas: "...",
    --   identidad: "..."
    -- }

  -- Nivel 2: Mercado, propuesta de valor y objetivos
  nivel_2 jsonb default '{}'::jsonb,
    -- {
    --   mercado_audiencia: "...",
    --   propuesta_valor: "...",
    --   objetivos: "..."
    -- }

  -- Nivel 3: Estrategia, guías y embudos de confianza
  nivel_3 jsonb default '{}'::jsonb,
    -- {
    --   canales_estrategia: "...",
    --   tipo_contenido: "...",
    --   embudo_confianza: "..."
    -- }

  -- Nivel 4: Resultados
  nivel_4 jsonb default '{}'::jsonb,
    -- {
    --   metricas_exito: "...",
    --   indicadores_buena_vida: "...",
    --   ajustes_necesarios: "..."
    -- }

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.piramide_data enable row level security;

-- 3. RLS Policies
create policy "Users can view own piramide"
  on public.piramide_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own piramide"
  on public.piramide_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own piramide"
  on public.piramide_data for update
  using (auth.uid() = user_id);

create policy "Users can delete own piramide"
  on public.piramide_data for delete
  using (auth.uid() = user_id);

-- Admin can view all (for coaching)
create policy "Admin can view all piramide"
  on public.piramide_data for select
  using (
    auth.jwt() ->> 'email' in ('janocabellom@gmail.com', 'jano.cmg@gmail.com')
  );

-- 4. Auto-update updated_at
create or replace function public.update_piramide_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger piramide_data_updated
  before update on public.piramide_data
  for each row execute procedure public.update_piramide_timestamp();

-- 5. Trigger: update user_journey when piramide advances
-- When the user completes up to nivel_2, mark piramide as complete in user_journey
create or replace function public.sync_piramide_to_journey()
returns trigger as $$
declare
  steps_count integer;
  has_nivel_2 boolean;
begin
  -- Count completed steps
  steps_count := array_length(new.steps_completed, 1);
  IF steps_count IS NULL THEN steps_count := 0; END IF;

  -- Check if nivel_2 is in completed steps (minimum for Phase 2 unlock)
  has_nivel_2 := 'nivel_2' = ANY(new.steps_completed);

  -- Update user_journey
  UPDATE public.user_journey
  SET
    piramide_niveles = jsonb_build_object(
      'prologo', 'prologo' = ANY(new.steps_completed),
      'mentalidad', 'mentalidad' = ANY(new.steps_completed),
      'buena_vida', 'buena_vida' = ANY(new.steps_completed),
      'bajo_tierra', 'bajo_tierra' = ANY(new.steps_completed),
      'nivel_1', 'nivel_1' = ANY(new.steps_completed),
      'nivel_2', 'nivel_2' = ANY(new.steps_completed),
      'nivel_3', 'nivel_3' = ANY(new.steps_completed),
      'nivel_4', 'nivel_4' = ANY(new.steps_completed)
    ),
    piramide_completada = has_nivel_2,
    perfil_piramide = jsonb_build_object(
      'prologo', new.prologo,
      'bajo_tierra', new.bajo_tierra,
      'nivel_1', new.nivel_1,
      'nivel_2', new.nivel_2
    ),
    profundidad_score = LEAST(100, steps_count * 12),
    -- Unlock Phase 2 when piramide is completed
    current_phase = CASE
      WHEN has_nivel_2 AND (SELECT current_phase FROM public.user_journey WHERE user_id = new.user_id) < 2
      THEN 2
      ELSE (SELECT current_phase FROM public.user_journey WHERE user_id = new.user_id)
    END,
    phase_started_at = CASE
      WHEN has_nivel_2 AND (SELECT current_phase FROM public.user_journey WHERE user_id = new.user_id) < 2
      THEN (SELECT phase_started_at FROM public.user_journey WHERE user_id = new.user_id)
           || jsonb_build_object('2', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
      ELSE (SELECT phase_started_at FROM public.user_journey WHERE user_id = new.user_id)
    END,
    updated_at = now()
  WHERE user_id = new.user_id;

  RETURN new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_piramide_update on public.piramide_data;

create trigger on_piramide_update
  after update on public.piramide_data
  for each row execute procedure public.sync_piramide_to_journey();

-- Also trigger on insert
drop trigger if exists on_piramide_insert on public.piramide_data;

create trigger on_piramide_insert
  after insert on public.piramide_data
  for each row execute procedure public.sync_piramide_to_journey();
