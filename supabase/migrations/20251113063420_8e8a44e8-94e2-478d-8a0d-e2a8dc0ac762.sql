-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'collaborator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create project_shares table for project-level access
CREATE TABLE public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (project_id, shared_with_user_id)
);

-- Enable RLS on project_shares
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Users can view shares where they are involved
CREATE POLICY "Users can view their project shares"
ON public.project_shares
FOR SELECT
USING (
  auth.uid() = shared_with_user_id 
  OR auth.uid() = shared_by_user_id
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_shares.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Project owners can create shares
CREATE POLICY "Project owners can create shares"
ON public.project_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND projects.user_id = auth.uid()
  )
);

-- Project owners can delete shares
CREATE POLICY "Project owners can delete shares"
ON public.project_shares
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND projects.user_id = auth.uid()
  )
);

-- Project owners can update shares
CREATE POLICY "Project owners can update shares"
ON public.project_shares
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND projects.user_id = auth.uid()
  )
);

-- Create account_shares table for account-level access
CREATE TABLE public.account_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  granted_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (owner_user_id, shared_with_user_id)
);

-- Enable RLS on account_shares
ALTER TABLE public.account_shares ENABLE ROW LEVEL SECURITY;

-- Users can view their account shares
CREATE POLICY "Users can view their account shares"
ON public.account_shares
FOR SELECT
USING (
  auth.uid() = shared_with_user_id 
  OR auth.uid() = owner_user_id
  OR auth.uid() = granted_by_user_id
);

-- Account owners can create shares
CREATE POLICY "Account owners can create shares"
ON public.account_shares
FOR INSERT
WITH CHECK (
  auth.uid() = owner_user_id
);

-- Account owners can delete shares
CREATE POLICY "Account owners can delete shares"
ON public.account_shares
FOR DELETE
USING (
  auth.uid() = owner_user_id
);

-- Account owners can update shares
CREATE POLICY "Account owners can update shares"
ON public.account_shares
FOR UPDATE
USING (
  auth.uid() = owner_user_id
);

-- Helper function to check if user has project access
CREATE OR REPLACE FUNCTION public.has_project_access(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Own project
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    -- Direct project share
    SELECT 1 FROM public.project_shares
    WHERE project_id = _project_id AND shared_with_user_id = _user_id
  ) OR EXISTS (
    -- Account-level access
    SELECT 1 FROM public.account_shares
    JOIN public.projects ON projects.user_id = account_shares.owner_user_id
    WHERE projects.id = _project_id AND account_shares.shared_with_user_id = _user_id
  ) OR (
    -- Admin access
    public.has_role(_user_id, 'admin')
  )
$$;

-- Drop and recreate projects RLS policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view accessible projects"
ON public.projects
FOR SELECT
USING (public.has_project_access(auth.uid(), id));

CREATE POLICY "Customers can create projects"
ON public.projects
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    public.has_role(auth.uid(), 'customer') OR
    public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Project owners can update their projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Project owners can delete their projects"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Update project_stages RLS policies
DROP POLICY IF EXISTS "Users can view stages of their own projects" ON public.project_stages;
DROP POLICY IF EXISTS "Users can create stages for their own projects" ON public.project_stages;
DROP POLICY IF EXISTS "Users can update stages of their own projects" ON public.project_stages;
DROP POLICY IF EXISTS "Users can delete stages of their own projects" ON public.project_stages;

CREATE POLICY "Users can view stages of accessible projects"
ON public.project_stages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_stages.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can create stages for accessible projects"
ON public.project_stages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can update stages of accessible projects"
ON public.project_stages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_stages.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can delete stages of accessible projects"
ON public.project_stages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_stages.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

-- Update project_tasks RLS policies
DROP POLICY IF EXISTS "Users can view tasks of their own projects" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can create tasks for their own projects" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can update tasks of their own projects" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can delete tasks of their own projects" ON public.project_tasks;

CREATE POLICY "Users can view tasks of accessible projects"
ON public.project_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id = project_tasks.stage_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

CREATE POLICY "Users can create tasks for accessible projects"
ON public.project_tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id = stage_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

CREATE POLICY "Users can update tasks of accessible projects"
ON public.project_tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id = project_tasks.stage_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

CREATE POLICY "Users can delete tasks of accessible projects"
ON public.project_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id = project_tasks.stage_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

-- Update materials RLS policies
DROP POLICY IF EXISTS "Users can view their own materials or materials of their projects" ON public.materials;
DROP POLICY IF EXISTS "Users can create their own materials or materials for their projects" ON public.materials;
DROP POLICY IF EXISTS "Users can update their own materials or materials of their projects" ON public.materials;
DROP POLICY IF EXISTS "Users can delete their own materials or materials of their projects" ON public.materials;

CREATE POLICY "Users can view materials of accessible projects"
ON public.materials
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = materials.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can create materials for accessible projects"
ON public.materials
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can update materials of accessible projects"
ON public.materials
FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = materials.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can delete materials of accessible projects"
ON public.materials
FOR DELETE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = materials.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

-- Update other related tables similarly
DROP POLICY IF EXISTS "Users can view follow-up notes of their own projects" ON public.follow_up_notes;
DROP POLICY IF EXISTS "Users can create follow-up notes for their own projects" ON public.follow_up_notes;
DROP POLICY IF EXISTS "Users can update follow-up notes of their own projects" ON public.follow_up_notes;
DROP POLICY IF EXISTS "Users can delete follow-up notes of their own projects" ON public.follow_up_notes;

CREATE POLICY "Users can view follow-up notes of accessible projects"
ON public.follow_up_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = follow_up_notes.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can create follow-up notes for accessible projects"
ON public.follow_up_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can update follow-up notes of accessible projects"
ON public.follow_up_notes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = follow_up_notes.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can delete follow-up notes of accessible projects"
ON public.follow_up_notes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = follow_up_notes.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

-- Legal documents
DROP POLICY IF EXISTS "Users can view legal documents of their own projects" ON public.legal_documents;
DROP POLICY IF EXISTS "Users can create legal documents for their own projects" ON public.legal_documents;
DROP POLICY IF EXISTS "Users can update legal documents of their own projects" ON public.legal_documents;
DROP POLICY IF EXISTS "Users can delete legal documents of their own projects" ON public.legal_documents;

CREATE POLICY "Users can view legal documents of accessible projects"
ON public.legal_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = legal_documents.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can create legal documents for accessible projects"
ON public.legal_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can update legal documents of accessible projects"
ON public.legal_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = legal_documents.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can delete legal documents of accessible projects"
ON public.legal_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = legal_documents.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

-- Technical documents
DROP POLICY IF EXISTS "Users can view technical documents of their own projects" ON public.technical_documents;
DROP POLICY IF EXISTS "Users can create technical documents for their own projects" ON public.technical_documents;
DROP POLICY IF EXISTS "Users can update technical documents of their own projects" ON public.technical_documents;
DROP POLICY IF EXISTS "Users can delete technical documents of their own projects" ON public.technical_documents;

CREATE POLICY "Users can view technical documents of accessible projects"
ON public.technical_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = technical_documents.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can create technical documents for accessible projects"
ON public.technical_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can update technical documents of accessible projects"
ON public.technical_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = technical_documents.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can delete technical documents of accessible projects"
ON public.technical_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = technical_documents.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

-- Project photos
DROP POLICY IF EXISTS "Users can view photos of their own projects" ON public.project_photos;
DROP POLICY IF EXISTS "Users can upload photos for their own projects" ON public.project_photos;
DROP POLICY IF EXISTS "Users can delete photos of their own projects" ON public.project_photos;

CREATE POLICY "Users can view photos of accessible projects"
ON public.project_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE (ps.id)::text = project_photos.etapa_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

CREATE POLICY "Users can upload photos for accessible projects"
ON public.project_photos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE (ps.id)::text = etapa_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

CREATE POLICY "Users can delete photos of accessible projects"
ON public.project_photos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE (ps.id)::text = project_photos.etapa_id
    AND public.has_project_access(auth.uid(), p.id)
  )
);

-- Notifications
DROP POLICY IF EXISTS "Users can view notifications of their own projects" ON public.notifications;
DROP POLICY IF EXISTS "Users can update notifications of their own projects" ON public.notifications;

CREATE POLICY "Users can view notifications of accessible projects"
ON public.notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notifications.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

CREATE POLICY "Users can update notifications of accessible projects"
ON public.notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notifications.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  )
);

-- Material suppliers
DROP POLICY IF EXISTS "Users can view their own material suppliers or suppliers of their projects" ON public.material_suppliers;
DROP POLICY IF EXISTS "Users can create their own material suppliers or suppliers for their projects" ON public.material_suppliers;
DROP POLICY IF EXISTS "Users can update their own material suppliers or suppliers of their projects" ON public.material_suppliers;
DROP POLICY IF EXISTS "Users can delete their own material suppliers or suppliers of their projects" ON public.material_suppliers;

CREATE POLICY "Users can view material suppliers of accessible projects"
ON public.material_suppliers
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = material_suppliers.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can create material suppliers for accessible projects"
ON public.material_suppliers
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can update material suppliers of accessible projects"
ON public.material_suppliers
FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = material_suppliers.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can delete material suppliers of accessible projects"
ON public.material_suppliers
FOR DELETE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = material_suppliers.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

-- Service providers
DROP POLICY IF EXISTS "Users can view their own service providers or providers of their projects" ON public.service_providers;
DROP POLICY IF EXISTS "Users can create their own service providers or providers for their projects" ON public.service_providers;
DROP POLICY IF EXISTS "Users can update their own service providers or providers of their projects" ON public.service_providers;
DROP POLICY IF EXISTS "Users can delete their own service providers or providers of their projects" ON public.service_providers;

CREATE POLICY "Users can view service providers of accessible projects"
ON public.service_providers
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = service_providers.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can create service providers for accessible projects"
ON public.service_providers
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can update service providers of accessible projects"
ON public.service_providers
FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = service_providers.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);

CREATE POLICY "Users can delete service providers of accessible projects"
ON public.service_providers
FOR DELETE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = service_providers.project_id
    AND public.has_project_access(auth.uid(), projects.id)
  ))
);