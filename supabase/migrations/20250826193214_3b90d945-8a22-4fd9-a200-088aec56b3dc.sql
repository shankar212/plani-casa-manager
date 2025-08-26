-- Secure project_photos RLS: restrict to project owners via stage -> project

-- Ensure RLS is enabled
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can delete photos" ON public.project_photos;
DROP POLICY IF EXISTS "Anyone can upload photos" ON public.project_photos;
DROP POLICY IF EXISTS "Photos are publicly viewable" ON public.project_photos;

-- Allow viewing photos only if the current user owns the project of the stage
CREATE POLICY "Users can view photos of their own projects"
ON public.project_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id::text = project_photos.etapa_id
      AND p.user_id = auth.uid()
  )
);

-- Allow inserting photos only if the current user owns the project of the stage
CREATE POLICY "Users can upload photos for their own projects"
ON public.project_photos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id::text = project_photos.etapa_id
      AND p.user_id = auth.uid()
  )
);

-- Allow deleting photos only if the current user owns the project of the stage
CREATE POLICY "Users can delete photos of their own projects"
ON public.project_photos
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id::text = project_photos.etapa_id
      AND p.user_id = auth.uid()
  )
);
