-- =============================================
-- Trigger: When Árbol is completed, advance user_journey to Phase 2/3
-- =============================================
-- Run this in the Supabase SQL Editor AFTER creating user_journey table
-- This trigger fires when arbol_data.completed changes to true

-- Function: sync árbol completion to user_journey
create or replace function public.sync_arbol_to_journey()
returns trigger as $$
declare
  journey_exists boolean;
  current_journey record;
begin
  -- Only act when completed changes to true
  if new.completed = true and (old.completed is null or old.completed = false) then

    -- Check if journey exists
    select exists(
      select 1 from public.user_journey where user_id = new.user_id
    ) into journey_exists;

    if journey_exists then
      -- Get current journey
      select * into current_journey
      from public.user_journey
      where user_id = new.user_id;

      -- Update journey: mark árbol as completed
      update public.user_journey
      set
        arbol_completado = true,
        current_phase = case
          when current_journey.current_phase < 2 then 2
          else current_journey.current_phase
        end,
        phase_started_at = case
          when current_journey.current_phase < 2 then
            coalesce(current_journey.phase_started_at, '{}'::jsonb) ||
            jsonb_build_object('2', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
          else current_journey.phase_started_at
        end
      where user_id = new.user_id;
    else
      -- Create journey at phase 2
      insert into public.user_journey (
        user_id,
        current_phase,
        phase_started_at,
        arbol_completado
      ) values (
        new.user_id,
        2,
        jsonb_build_object(
          '1', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
          '2', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        ),
        true
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any
drop trigger if exists on_arbol_completed on public.arbol_data;

-- Create trigger
create trigger on_arbol_completed
  after update on public.arbol_data
  for each row execute procedure public.sync_arbol_to_journey();
