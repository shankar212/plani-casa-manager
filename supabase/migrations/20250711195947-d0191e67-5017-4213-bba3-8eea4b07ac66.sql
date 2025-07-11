-- Create technical_documents table for storing technical project documents
CREATE TABLE public.technical_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- 'estrutural', 'hidrossanitario', 'eletrico', 'arquitetonico'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.technical_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for technical documents
CREATE POLICY "Enable read access for all users" 
ON public.technical_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.technical_documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.technical_documents 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON public.technical_documents 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_technical_documents_updated_at
BEFORE UPDATE ON public.technical_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for technical documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('technical-documents', 'technical-documents', true)
ON CONFLICT (id) DO NOTHING;