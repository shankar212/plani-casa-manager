-- Add archived columns to projects table
ALTER TABLE public.projects 
ADD COLUMN archived boolean DEFAULT false NOT NULL,
ADD COLUMN archived_at timestamp with time zone;

-- Drop existing project limit policy
DROP POLICY IF EXISTS "Authenticated users can create up to 3 projects" ON public.projects;

-- Create new policy that only counts non-archived projects
CREATE POLICY "Authenticated users can create up to 3 active projects"
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
    AND archived = false
  ) < 3
);

-- Create index for better performance when filtering archived projects
CREATE INDEX idx_projects_archived ON public.projects(user_id, archived) WHERE archived = false;