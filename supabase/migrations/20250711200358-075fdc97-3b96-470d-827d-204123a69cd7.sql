-- Create storage policies for technical-documents bucket
CREATE POLICY "Allow public uploads to technical-documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'technical-documents');

CREATE POLICY "Allow public downloads from technical-documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'technical-documents');

CREATE POLICY "Allow public updates to technical-documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'technical-documents');

CREATE POLICY "Allow public deletes from technical-documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'technical-documents');