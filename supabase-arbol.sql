-- ===== EL ÁRBOL DE LA MARCA PERSONAL =====
-- Run this in your Supabase SQL Editor

-- Table
create table if not exists public.arbol_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  semilla jsonb default '{}'::jsonb,
  raices jsonb default '{}'::jsonb,
  tronco jsonb default '{}'::jsonb,
  ramas jsonb default '{}'::jsonb,
  copa jsonb default '{}'::jsonb,
  frutos jsonb default '{}'::jsonb,
  entorno jsonb default '{}'::jsonb,
  tiempo jsonb default '{}'::jsonb,
  producto jsonb default '{}'::jsonb,
  onboarding_step int default 0,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.arbol_data enable row level security;

-- Users can CRUD their own data
create policy "Users can view own arbol" on public.arbol_data
  for select using (auth.uid() = user_id);

create policy "Users can insert own arbol" on public.arbol_data
  for insert with check (auth.uid() = user_id);

create policy "Users can update own arbol" on public.arbol_data
  for update using (auth.uid() = user_id);

create policy "Users can delete own arbol" on public.arbol_data
  for delete using (auth.uid() = user_id);

-- Admin policies (same emails as other tables)
create policy "Admin can view all arbol" on public.arbol_data
  for select using (
    auth.jwt() ->> 'email' in ('janocabellom@gmail.com', 'jano.cmg@gmail.com')
  );
