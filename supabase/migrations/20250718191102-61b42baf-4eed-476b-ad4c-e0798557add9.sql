
-- Add user_id column to materials table
ALTER TABLE public.materials 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing materials to assign them to your user ID
UPDATE public.materials 
SET user_id = 'ebb8e404-2f24-4eb1-86df-7602fd4f3cb1'
WHERE user_id IS NULL;

-- Update RLS policies to allow materials access through either project ownership OR direct user ownership
DROP POLICY IF EXISTS "Users can view materials of their own projects" ON public.materials;
DROP POLICY IF EXISTS "Users can create materials for their own projects" ON public.materials;
DROP POLICY IF EXISTS "Users can update materials of their own projects" ON public.materials;
DROP POLICY IF EXISTS "Users can delete materials of their own projects" ON public.materials;

-- Create new RLS policies that check both project ownership and direct user ownership
CREATE POLICY "Users can view their own materials or materials of their projects" 
ON public.materials 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = materials.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own materials or materials for their projects" 
ON public.materials 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = materials.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own materials or materials of their projects" 
ON public.materials 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = materials.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own materials or materials of their projects" 
ON public.materials 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = materials.project_id 
    AND projects.user_id = auth.uid()
  )
);
