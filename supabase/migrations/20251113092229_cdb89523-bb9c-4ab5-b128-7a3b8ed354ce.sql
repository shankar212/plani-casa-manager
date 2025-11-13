-- Fix project creation RLS by ensuring owner is set automatically and policy checks owner
-- 1) Ensure trigger sets user_id = auth.uid() on insert
DROP TRIGGER IF EXISTS set_project_owner_trigger ON public.projects;
CREATE TRIGGER set_project_owner_trigger
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_project_owner();

-- 2) Ensure INSERT policy allows authenticated users when they are the owner
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
