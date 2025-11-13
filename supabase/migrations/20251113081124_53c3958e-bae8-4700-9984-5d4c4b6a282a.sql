-- Simplify INSERT to a single permissive policy applicable to any logged-in user
DROP POLICY IF EXISTS "Customers can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

CREATE POLICY "Logged-in users can create projects"
ON public.projects
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure the before-insert trigger exists (idempotent)
CREATE OR REPLACE FUNCTION public.set_project_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_project_owner'
  ) THEN
    DROP TRIGGER trg_set_project_owner ON public.projects;
  END IF;
END $$;

CREATE TRIGGER trg_set_project_owner
BEFORE INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_project_owner();