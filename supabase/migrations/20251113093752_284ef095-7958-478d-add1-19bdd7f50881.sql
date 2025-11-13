-- Fix project creation policy security issue
-- Add DEFAULT auth.uid() to user_id for defense in depth
ALTER TABLE projects 
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Add check constraint to ensure user_id is never null
ALTER TABLE projects 
  ADD CONSTRAINT check_project_owner 
  CHECK (user_id IS NOT NULL);

-- Update INSERT policy to be more explicit and defensive
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (user_id IS NULL OR user_id = auth.uid())
);