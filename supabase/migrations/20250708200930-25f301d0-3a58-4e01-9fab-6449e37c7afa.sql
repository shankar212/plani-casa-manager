-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

-- Create table to store photo metadata
CREATE TABLE public.project_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  etapa_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for photo access
CREATE POLICY "Photos are publicly viewable" 
ON public.project_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can upload photos" 
ON public.project_photos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete photos" 
ON public.project_photos 
FOR DELETE 
USING (true);

-- Create storage policies
CREATE POLICY "Project photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-photos');

CREATE POLICY "Anyone can upload project photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "Anyone can delete project photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-photos');