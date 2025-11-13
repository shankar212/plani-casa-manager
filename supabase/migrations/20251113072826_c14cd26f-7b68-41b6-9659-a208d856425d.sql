-- Create helper functions to check access levels
CREATE OR REPLACE FUNCTION has_project_view_access(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Own project
    SELECT 1 FROM projects WHERE id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    -- Direct project share (any level)
    SELECT 1 FROM project_shares
    WHERE project_id = _project_id AND shared_with_user_id = _user_id
  ) OR EXISTS (
    -- Account-level access
    SELECT 1 FROM account_shares
    JOIN projects ON projects.user_id = account_shares.owner_user_id
    WHERE projects.id = _project_id AND account_shares.shared_with_user_id = _user_id
  ) OR (
    -- Admin access
    has_role(_user_id, 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION has_project_edit_access(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Own project
    SELECT 1 FROM projects WHERE id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    -- Direct project share with edit access
    SELECT 1 FROM project_shares
    WHERE project_id = _project_id 
      AND shared_with_user_id = _user_id
      AND access_level = 'edit'
  ) OR (
    -- Admin access
    has_role(_user_id, 'admin')
  )
$$;

-- Update project_stages policies to respect access levels
DROP POLICY IF EXISTS "Users can create stages for accessible projects" ON project_stages;
CREATE POLICY "Users can create stages for accessible projects"
ON project_stages FOR INSERT
WITH CHECK (has_project_edit_access(auth.uid(), project_id));

DROP POLICY IF EXISTS "Users can update stages of accessible projects" ON project_stages;
CREATE POLICY "Users can update stages of accessible projects"
ON project_stages FOR UPDATE
USING (has_project_edit_access(auth.uid(), project_id));

DROP POLICY IF EXISTS "Users can delete stages of accessible projects" ON project_stages;
CREATE POLICY "Users can delete stages of accessible projects"
ON project_stages FOR DELETE
USING (has_project_edit_access(auth.uid(), project_id));

DROP POLICY IF EXISTS "Users can view stages of accessible projects" ON project_stages;
CREATE POLICY "Users can view stages of accessible projects"
ON project_stages FOR SELECT
USING (has_project_view_access(auth.uid(), project_id));

-- Update project_tasks policies
DROP POLICY IF EXISTS "Users can create tasks for accessible projects" ON project_tasks;
CREATE POLICY "Users can create tasks for accessible projects"
ON project_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_stages ps
    JOIN projects p ON p.id = ps.project_id
    WHERE ps.id = stage_id AND has_project_edit_access(auth.uid(), p.id)
  )
);

DROP POLICY IF EXISTS "Users can update tasks of accessible projects" ON project_tasks;
CREATE POLICY "Users can update tasks of accessible projects"
ON project_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_stages ps
    JOIN projects p ON p.id = ps.project_id
    WHERE ps.id = stage_id AND has_project_edit_access(auth.uid(), p.id)
  )
);

DROP POLICY IF EXISTS "Users can delete tasks of accessible projects" ON project_tasks;
CREATE POLICY "Users can delete tasks of accessible projects"
ON project_tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM project_stages ps
    JOIN projects p ON p.id = ps.project_id
    WHERE ps.id = stage_id AND has_project_edit_access(auth.uid(), p.id)
  )
);

DROP POLICY IF EXISTS "Users can view tasks of accessible projects" ON project_tasks;
CREATE POLICY "Users can view tasks of accessible projects"
ON project_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_stages ps
    JOIN projects p ON p.id = ps.project_id
    WHERE ps.id = stage_id AND has_project_view_access(auth.uid(), p.id)
  )
);

-- Update materials policies
DROP POLICY IF EXISTS "Users can create materials for accessible projects" ON materials;
CREATE POLICY "Users can create materials for accessible projects"
ON materials FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR has_project_edit_access(auth.uid(), project_id)
);

DROP POLICY IF EXISTS "Users can update materials of accessible projects" ON materials;
CREATE POLICY "Users can update materials of accessible projects"
ON materials FOR UPDATE
USING (
  auth.uid() = user_id OR has_project_edit_access(auth.uid(), project_id)
);

DROP POLICY IF EXISTS "Users can delete materials of accessible projects" ON materials;
CREATE POLICY "Users can delete materials of accessible projects"
ON materials FOR DELETE
USING (
  auth.uid() = user_id OR has_project_edit_access(auth.uid(), project_id)
);

DROP POLICY IF EXISTS "Users can view materials of accessible projects" ON materials;
CREATE POLICY "Users can view materials of accessible projects"
ON materials FOR SELECT
USING (
  auth.uid() = user_id OR has_project_view_access(auth.uid(), project_id)
);

-- Update project update policy to only allow edit access
DROP POLICY IF EXISTS "Project owners can update their projects" ON projects;
CREATE POLICY "Users with edit access can update projects"
ON projects FOR UPDATE
USING (has_project_edit_access(auth.uid(), id));

-- Create notification for new shares
CREATE OR REPLACE FUNCTION notify_new_share()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_name text;
  _sharer_name text;
  _access_label text;
BEGIN
  -- Get project name
  SELECT name INTO _project_name
  FROM projects
  WHERE id = NEW.project_id;

  -- Get sharer name
  SELECT full_name INTO _sharer_name
  FROM profiles
  WHERE id = NEW.shared_by_user_id;

  -- Get access level label
  _access_label := CASE 
    WHEN NEW.access_level = 'view' THEN 'visualização'
    WHEN NEW.access_level = 'edit' THEN 'edição'
    ELSE NEW.access_level
  END;

  -- Create notification for the shared user
  INSERT INTO notifications (project_id, title, message, type)
  VALUES (
    NEW.project_id,
    'Novo Acesso ao Projeto',
    COALESCE(_sharer_name, 'Um usuário') || ' compartilhou o projeto "' || 
    _project_name || '" com você. Você tem acesso de ' || _access_label || '.',
    'project_shared'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_project_share_created ON project_shares;
CREATE TRIGGER on_project_share_created
  AFTER INSERT ON project_shares
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_share();