-- Ensure projects.user_id has a safe default to the current auth user
ALTER TABLE public.projects
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Create or replace a function to set the project owner on insert when not provided
CREATE OR REPLACE FUNCTION public.set_project_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the BEFORE INSERT trigger to apply the owner automatically
DROP TRIGGER IF EXISTS set_project_owner_trigger ON public.projects;
CREATE TRIGGER set_project_owner_trigger
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_project_owner();

-- Replace INSERT RLS policy for projects to allow authenticated users to create records
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
WITH CHECK ((auth.uid() IS NOT NULL) AND ((user_id IS NULL) OR (user_id = auth.uid())));