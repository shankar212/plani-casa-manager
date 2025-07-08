-- Create material status enum
CREATE TYPE material_status AS ENUM ('requested', 'delivered', 'used');

-- Create unified materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  stage_id UUID REFERENCES public.project_stages(id),
  supplier_id UUID REFERENCES public.material_suppliers(id),
  material_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status material_status NOT NULL DEFAULT 'requested',
  
  -- Cost fields (used for both delivered and used materials)
  unit_cost NUMERIC,
  total_cost NUMERIC,
  
  -- Estimation fields (only for requested materials)
  estimated_unit_cost NUMERIC,
  estimated_total_cost NUMERIC,
  
  -- Date fields
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivery_date DATE,
  used_date DATE,
  
  -- Additional fields
  invoice_number TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" 
ON public.materials 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.materials 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.materials 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON public.materials 
FOR DELETE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop old tables
DROP TABLE IF EXISTS public.materials_requested CASCADE;
DROP TABLE IF EXISTS public.materials_delivered CASCADE;
DROP TABLE IF EXISTS public.materials_used CASCADE;