-- Drop the existing 'public' role policy and create a clean 'authenticated' role policy
DROP POLICY IF EXISTS "Logged-in users can create projects" ON public.projects;

CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);