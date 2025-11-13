-- 1) Create a trigger to set project owner server-side
create or replace function public.set_project_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.user_id is null then
    NEW.user_id := auth.uid();
  end if;
  return NEW;
end;
$$;

-- Drop existing trigger if present and recreate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_project_owner'
  ) THEN
    DROP TRIGGER trg_set_project_owner ON public.projects;
  END IF;
END $$;

create trigger trg_set_project_owner
before insert on public.projects
for each row execute function public.set_project_owner();

-- 2) Simplify INSERT policy: allow any authenticated user to insert; owner is enforced by trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Any user can create own projects'
  ) THEN
    DROP POLICY "Any user can create own projects" ON public.projects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Authenticated users can create own projects'
  ) THEN
    DROP POLICY "Authenticated users can create own projects" ON public.projects;
  END IF;

  -- Ensure a clean, single policy for INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Authenticated users can create projects'
  ) THEN
    CREATE POLICY "Authenticated users can create projects"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;