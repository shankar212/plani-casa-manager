-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

-- Create new policy with project limit check
CREATE POLICY "Authenticated users can create up to 3 projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id IS NULL OR user_id = auth.uid())
  AND (
    SELECT COUNT(*) 
    FROM public.projects 
    WHERE user_id = auth.uid()
  ) < 3
);