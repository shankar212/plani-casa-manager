-- Update has_project_edit_access function to check access_level in account_shares
CREATE OR REPLACE FUNCTION public.has_project_edit_access(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
  ) OR EXISTS (
    -- Account-level access with edit permission
    SELECT 1 FROM account_shares
    JOIN projects ON projects.user_id = account_shares.owner_user_id
    WHERE projects.id = _project_id 
      AND account_shares.shared_with_user_id = _user_id
      AND account_shares.access_level = 'edit'
  ) OR (
    -- Admin access
    has_role(_user_id, 'admin')
  )
$$;

-- Update has_project_view_access function to check access_level in account_shares
CREATE OR REPLACE FUNCTION public.has_project_view_access(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    -- Own project
    SELECT 1 FROM projects WHERE id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    -- Direct project share (any level: view or edit)
    SELECT 1 FROM project_shares
    WHERE project_id = _project_id AND shared_with_user_id = _user_id
  ) OR EXISTS (
    -- Account-level access (any level: view or edit)
    SELECT 1 FROM account_shares
    JOIN projects ON projects.user_id = account_shares.owner_user_id
    WHERE projects.id = _project_id 
      AND account_shares.shared_with_user_id = _user_id
      AND account_shares.access_level IN ('view', 'edit')
  ) OR (
    -- Admin access
    has_role(_user_id, 'admin')
  )
$$;