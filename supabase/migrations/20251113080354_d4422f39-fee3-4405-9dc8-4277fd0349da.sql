-- Ensure INSERT policies on public.projects are permissive and allow authenticated users

-- 1) Drop and recreate a clean permissive policy for any authenticated user to insert
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects"
ON public.projects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2) Recreate the customers/admins specific policy as PERMISSIVE (no longer restrictive)
DROP POLICY IF EXISTS "Customers can create projects" ON public.projects;
CREATE POLICY "Customers can create projects"
ON public.projects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id)
  AND (
    has_role(auth.uid(), 'customer'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 3) Keep the trigger to auto-set owner (created previously). If it doesn't exist for any reason, (re)create it safely
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
