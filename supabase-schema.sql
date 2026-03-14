-- =============================================
-- La Brújula de Contenido — Supabase Schema
-- =============================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  api_key text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can only see/edit their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Brujula data table
create table if not exists public.brujula_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  briefing jsonb default '{}'::jsonb,
  buyer jsonb default '{}'::jsonb,
  empathy jsonb default '{}'::jsonb,
  insight jsonb default '{}'::jsonb,
  tree jsonb default '{"pilares":[]}'::jsonb,
  channels jsonb default '{"canales":[],"objetivosPrincipales":[]}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.brujula_data enable row level security;

create policy "Users can view own brujula data"
  on public.brujula_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own brujula data"
  on public.brujula_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own brujula data"
  on public.brujula_data for update
  using (auth.uid() = user_id);

create policy "Users can delete own brujula data"
  on public.brujula_data for delete
  using (auth.uid() = user_id);

-- 3. Suggestion history table
create table if not exists public.suggestion_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  suggestion jsonb not null,
  variables jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.suggestion_history enable row level security;

create policy "Users can view own history"
  on public.suggestion_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own history"
  on public.suggestion_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own history"
  on public.suggestion_history for delete
  using (auth.uid() = user_id);

-- 4. Planner items table
create table if not exists public.planner_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scheduled_date date,
  scheduled_time time,
  title text not null,
  pilar text,
  formato text,
  tono text,
  canal text,
  sugerencia text,
  estrategia text,
  status text default 'draft' check (status in ('draft','scheduled','published')),
  gcal_synced boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.planner_items enable row level security;

create policy "Users can view own planner items"
  on public.planner_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own planner items"
  on public.planner_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own planner items"
  on public.planner_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own planner items"
  on public.planner_items for delete
  using (auth.uid() = user_id);

-- Index for efficient weekly queries
create index idx_planner_items_user_date on public.planner_items(user_id, scheduled_date);

-- 5. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, onboarding_completed)
  values (new.id, new.email, false);
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
