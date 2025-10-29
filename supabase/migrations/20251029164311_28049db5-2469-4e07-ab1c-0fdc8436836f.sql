-- Fix storage RLS policies to validate project ownership
-- Currently, policies only check if user is logged in, not if they own the project

-- ============================================================================
-- TECHNICAL DOCUMENTS BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Users can view technical documents of their own projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload technical documents to their own projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete technical documents from their own projects" ON storage.objects;

-- SELECT: Verify ownership through technical_documents table
CREATE POLICY "Users can view technical documents of their own projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'technical-documents'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.technical_documents td
    JOIN public.projects p ON p.id = td.project_id
    WHERE td.file_path = storage.objects.name
  )
);

-- INSERT: Verify ownership by checking project_id in path
CREATE POLICY "Users can upload technical documents to their own projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'technical-documents'
  AND auth.uid() IN (
    SELECT user_id 
    FROM public.projects
    WHERE id::text = split_part(storage.objects.name, '/', 1)
  )
);

-- DELETE: Verify ownership through technical_documents table
CREATE POLICY "Users can delete technical documents from their own projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'technical-documents'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.technical_documents td
    JOIN public.projects p ON p.id = td.project_id
    WHERE td.file_path = storage.objects.name
  )
);

-- ============================================================================
-- LEGAL DOCUMENTS BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Users can view legal documents of their own projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload legal documents to their own projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete legal documents from their own projects" ON storage.objects;

-- SELECT: Verify ownership through legal_documents table
CREATE POLICY "Users can view legal documents of their own projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'legal-documents'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.legal_documents ld
    JOIN public.projects p ON p.id = ld.project_id
    WHERE ld.file_path = storage.objects.name
  )
);

-- INSERT: Verify ownership by checking project_id in path
CREATE POLICY "Users can upload legal documents to their own projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'legal-documents'
  AND auth.uid() IN (
    SELECT user_id 
    FROM public.projects
    WHERE id::text = split_part(storage.objects.name, '/', 1)
  )
);

-- DELETE: Verify ownership through legal_documents table
CREATE POLICY "Users can delete legal documents from their own projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'legal-documents'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.legal_documents ld
    JOIN public.projects p ON p.id = ld.project_id
    WHERE ld.file_path = storage.objects.name
  )
);

-- ============================================================================
-- PROJECT PHOTOS BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Users can view photos of their own projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos to their own projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete photos from their own projects" ON storage.objects;

-- SELECT: Verify ownership through project_photos -> project_stages -> projects
CREATE POLICY "Users can view photos of their own projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-photos'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.project_photos pp
    JOIN public.project_stages ps ON ps.id::text = pp.etapa_id
    JOIN public.projects p ON p.id = ps.project_id
    WHERE pp.file_path = storage.objects.name
  )
);

-- INSERT: Verify ownership by checking stage_id in path and joining to project
CREATE POLICY "Users can upload photos to their own projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id::text = split_part(storage.objects.name, '/', 1)
  )
);

-- DELETE: Verify ownership through project_photos -> project_stages -> projects
CREATE POLICY "Users can delete photos from their own projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM public.project_photos pp
    JOIN public.project_stages ps ON ps.id::text = pp.etapa_id
    JOIN public.projects p ON p.id = ps.project_id
    WHERE pp.file_path = storage.objects.name
  )
);