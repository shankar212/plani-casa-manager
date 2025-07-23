-- Add user_id to service_providers and material_suppliers for proper ownership
ALTER TABLE public.service_providers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.material_suppliers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing records to assign them to a specific user (replace with actual user ID as needed)
UPDATE public.service_providers 
SET user_id = 'ebb8e404-2f24-4eb1-86df-7602fd4f3cb1'
WHERE user_id IS NULL;

UPDATE public.material_suppliers 
SET user_id = 'ebb8e404-2f24-4eb1-86df-7602fd4f3cb1'
WHERE user_id IS NULL;

-- Update RLS policies for service_providers to include user ownership
DROP POLICY IF EXISTS "Users can view service providers of their own projects" ON public.service_providers;
DROP POLICY IF EXISTS "Users can create service providers for their own projects" ON public.service_providers;
DROP POLICY IF EXISTS "Users can update service providers of their own projects" ON public.service_providers;
DROP POLICY IF EXISTS "Users can delete service providers of their own projects" ON public.service_providers;

CREATE POLICY "Users can view their own service providers or providers of their projects" 
ON public.service_providers 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = service_providers.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own service providers or providers for their projects" 
ON public.service_providers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = service_providers.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own service providers or providers of their projects" 
ON public.service_providers 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = service_providers.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own service providers or providers of their projects" 
ON public.service_providers 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = service_providers.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Update RLS policies for material_suppliers to include user ownership
DROP POLICY IF EXISTS "Users can view material suppliers of their own projects" ON public.material_suppliers;
DROP POLICY IF EXISTS "Users can create material suppliers for their own projects" ON public.material_suppliers;
DROP POLICY IF EXISTS "Users can update material suppliers of their own projects" ON public.material_suppliers;
DROP POLICY IF EXISTS "Users can delete material suppliers of their own projects" ON public.material_suppliers;

CREATE POLICY "Users can view their own material suppliers or suppliers of their projects" 
ON public.material_suppliers 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = material_suppliers.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own material suppliers or suppliers for their projects" 
ON public.material_suppliers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = material_suppliers.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own material suppliers or suppliers of their projects" 
ON public.material_suppliers 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = material_suppliers.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own material suppliers or suppliers of their projects" 
ON public.material_suppliers 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = material_suppliers.project_id 
    AND projects.user_id = auth.uid()
  )
);