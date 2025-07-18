
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies - users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Add user_id column to projects table
ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update projects RLS policies to be user-specific
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.projects;

CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

-- Update project_stages RLS policies to be user-specific through projects
DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_stages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.project_stages;
DROP POLICY IF EXISTS "Enable update for all users" ON public.project_stages;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.project_stages;

CREATE POLICY "Users can view stages of their own projects" 
ON public.project_stages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_stages.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create stages for their own projects" 
ON public.project_stages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_stages.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update stages of their own projects" 
ON public.project_stages FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_stages.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete stages of their own projects" 
ON public.project_stages FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = project_stages.project_id 
  AND projects.user_id = auth.uid()
));

-- Update project_tasks RLS policies to be user-specific through project_stages and projects
DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.project_tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON public.project_tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.project_tasks;

CREATE POLICY "Users can view tasks of their own projects" 
ON public.project_tasks FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.project_stages ps
  JOIN public.projects p ON p.id = ps.project_id
  WHERE ps.id = project_tasks.stage_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can create tasks for their own projects" 
ON public.project_tasks FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.project_stages ps
  JOIN public.projects p ON p.id = ps.project_id
  WHERE ps.id = project_tasks.stage_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can update tasks of their own projects" 
ON public.project_tasks FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.project_stages ps
  JOIN public.projects p ON p.id = ps.project_id
  WHERE ps.id = project_tasks.stage_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can delete tasks of their own projects" 
ON public.project_tasks FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.project_stages ps
  JOIN public.projects p ON p.id = ps.project_id
  WHERE ps.id = project_tasks.stage_id 
  AND p.user_id = auth.uid()
));

-- Update other related tables to be user-specific through projects
-- Legal documents
DROP POLICY IF EXISTS "Enable read access for all users" ON public.legal_documents;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.legal_documents;
DROP POLICY IF EXISTS "Enable update for all users" ON public.legal_documents;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.legal_documents;

CREATE POLICY "Users can view legal documents of their own projects" 
ON public.legal_documents FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = legal_documents.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create legal documents for their own projects" 
ON public.legal_documents FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = legal_documents.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update legal documents of their own projects" 
ON public.legal_documents FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = legal_documents.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete legal documents of their own projects" 
ON public.legal_documents FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = legal_documents.project_id 
  AND projects.user_id = auth.uid()
));

-- Materials
DROP POLICY IF EXISTS "Enable read access for all users" ON public.materials;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.materials;
DROP POLICY IF EXISTS "Enable update for all users" ON public.materials;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.materials;

CREATE POLICY "Users can view materials of their own projects" 
ON public.materials FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = materials.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create materials for their own projects" 
ON public.materials FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = materials.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update materials of their own projects" 
ON public.materials FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = materials.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete materials of their own projects" 
ON public.materials FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = materials.project_id 
  AND projects.user_id = auth.uid()
));

-- Service providers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.service_providers;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.service_providers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.service_providers;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.service_providers;

CREATE POLICY "Users can view service providers of their own projects" 
ON public.service_providers FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = service_providers.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create service providers for their own projects" 
ON public.service_providers FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = service_providers.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update service providers of their own projects" 
ON public.service_providers FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = service_providers.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete service providers of their own projects" 
ON public.service_providers FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = service_providers.project_id 
  AND projects.user_id = auth.uid()
));

-- Material suppliers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.material_suppliers;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.material_suppliers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.material_suppliers;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.material_suppliers;

CREATE POLICY "Users can view material suppliers of their own projects" 
ON public.material_suppliers FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = material_suppliers.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create material suppliers for their own projects" 
ON public.material_suppliers FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = material_suppliers.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update material suppliers of their own projects" 
ON public.material_suppliers FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = material_suppliers.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete material suppliers of their own projects" 
ON public.material_suppliers FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = material_suppliers.project_id 
  AND projects.user_id = auth.uid()
));

-- Notifications
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.notifications;
DROP POLICY IF EXISTS "Enable update for all users" ON public.notifications;

CREATE POLICY "Users can view notifications of their own projects" 
ON public.notifications FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = notifications.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "System can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update notifications of their own projects" 
ON public.notifications FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = notifications.project_id 
  AND projects.user_id = auth.uid()
));

-- Technical documents
DROP POLICY IF EXISTS "Enable read access for all users" ON public.technical_documents;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.technical_documents;
DROP POLICY IF EXISTS "Enable update for all users" ON public.technical_documents;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.technical_documents;

CREATE POLICY "Users can view technical documents of their own projects" 
ON public.technical_documents FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = technical_documents.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create technical documents for their own projects" 
ON public.technical_documents FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = technical_documents.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update technical documents of their own projects" 
ON public.technical_documents FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = technical_documents.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete technical documents of their own projects" 
ON public.technical_documents FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = technical_documents.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
