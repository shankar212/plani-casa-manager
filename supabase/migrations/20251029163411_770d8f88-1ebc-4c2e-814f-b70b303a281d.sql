-- Fix 1: Make storage buckets private
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('project-photos', 'legal-documents', 'technical-documents');

-- Fix 2: Remove permissive notification creation policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Fix 3: Add service role only policy for notifications
CREATE POLICY "Service role can create notifications" 
ON public.notifications 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Add storage RLS policies for project-photos bucket
CREATE POLICY "Users can view photos of their own projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-photos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload photos to their own projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete photos from their own projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND auth.uid() IS NOT NULL
);

-- Add storage RLS policies for legal-documents bucket
CREATE POLICY "Users can view legal documents of their own projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'legal-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload legal documents to their own projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'legal-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete legal documents from their own projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'legal-documents'
  AND auth.uid() IS NOT NULL
);

-- Add storage RLS policies for technical-documents bucket
CREATE POLICY "Users can view technical documents of their own projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'technical-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload technical documents to their own projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'technical-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete technical documents from their own projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'technical-documents'
  AND auth.uid() IS NOT NULL
);