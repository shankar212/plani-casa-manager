-- Enable realtime on project tables (skip if already enabled)
DO $$ 
BEGIN
  ALTER TABLE projects REPLICA IDENTITY FULL;
  ALTER TABLE project_stages REPLICA IDENTITY FULL;
  ALTER TABLE project_tasks REPLICA IDENTITY FULL;
  ALTER TABLE materials REPLICA IDENTITY FULL;
  ALTER TABLE service_providers REPLICA IDENTITY FULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create function to notify project collaborators
CREATE OR REPLACE FUNCTION notify_project_collaborators(
  _project_id uuid,
  _action_user_id uuid,
  _action_type text,
  _entity_type text,
  _entity_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_name text;
  _actor_name text;
BEGIN
  -- Get project name
  SELECT name INTO _project_name
  FROM projects
  WHERE id = _project_id;

  -- Get actor name
  SELECT full_name INTO _actor_name
  FROM profiles
  WHERE id = _action_user_id;

  -- Create notifications for project shares
  INSERT INTO notifications (project_id, title, message, type)
  SELECT 
    _project_id,
    'Atividade no Projeto: ' || _project_name,
    COALESCE(_actor_name, 'Um usuário') || ' ' || _action_type || ' ' || _entity_type || 
    CASE WHEN _entity_name IS NOT NULL THEN ': ' || _entity_name ELSE '' END,
    'project_activity'
  FROM project_shares
  WHERE project_id = _project_id 
    AND shared_with_user_id != _action_user_id;

  -- Also notify account shares
  INSERT INTO notifications (project_id, title, message, type)
  SELECT 
    _project_id,
    'Atividade no Projeto: ' || _project_name,
    COALESCE(_actor_name, 'Um usuário') || ' ' || _action_type || ' ' || _entity_type || 
    CASE WHEN _entity_name IS NOT NULL THEN ': ' || _entity_name ELSE '' END,
    'project_activity'
  FROM account_shares
  JOIN projects ON projects.user_id = account_shares.owner_user_id
  WHERE projects.id = _project_id 
    AND account_shares.shared_with_user_id != _action_user_id;
END;
$$;

-- Trigger for project updates
CREATE OR REPLACE FUNCTION trigger_notify_project_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM notify_project_collaborators(
    NEW.id,
    auth.uid(),
    'atualizou o projeto',
    '',
    NEW.name
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_project_update ON projects;
CREATE TRIGGER on_project_update
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_project_update();

-- Trigger for stage changes
CREATE OR REPLACE FUNCTION trigger_notify_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM notify_project_collaborators(
      NEW.project_id,
      auth.uid(),
      'adicionou uma etapa',
      '',
      NEW.name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM notify_project_collaborators(
      NEW.project_id,
      auth.uid(),
      'atualizou a etapa',
      '',
      NEW.name
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM notify_project_collaborators(
      OLD.project_id,
      auth.uid(),
      'removeu a etapa',
      '',
      OLD.name
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_stage_change ON project_stages;
CREATE TRIGGER on_stage_change
  AFTER INSERT OR UPDATE OR DELETE ON project_stages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_stage_change();

-- Trigger for task changes
CREATE OR REPLACE FUNCTION trigger_notify_task_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id uuid;
BEGIN
  -- Get project_id from stage
  IF TG_OP = 'DELETE' THEN
    SELECT project_id INTO _project_id
    FROM project_stages
    WHERE id = OLD.stage_id;
    
    PERFORM notify_project_collaborators(
      _project_id,
      auth.uid(),
      'removeu uma tarefa',
      '',
      OLD.name
    );
  ELSE
    SELECT project_id INTO _project_id
    FROM project_stages
    WHERE id = NEW.stage_id;
    
    IF TG_OP = 'INSERT' THEN
      PERFORM notify_project_collaborators(
        _project_id,
        auth.uid(),
        'adicionou uma tarefa',
        '',
        NEW.name
      );
    ELSIF TG_OP = 'UPDATE' THEN
      PERFORM notify_project_collaborators(
        _project_id,
        auth.uid(),
        'atualizou a tarefa',
        '',
        NEW.name
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_task_change ON project_tasks;
CREATE TRIGGER on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_task_change();

-- Trigger for material changes
CREATE OR REPLACE FUNCTION trigger_notify_material_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM notify_project_collaborators(
      NEW.project_id,
      auth.uid(),
      'adicionou um material',
      '',
      NEW.material_name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM notify_project_collaborators(
      NEW.project_id,
      auth.uid(),
      'atualizou o material',
      '',
      NEW.material_name
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM notify_project_collaborators(
      OLD.project_id,
      auth.uid(),
      'removeu o material',
      '',
      OLD.material_name
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_material_change ON materials;
CREATE TRIGGER on_material_change
  AFTER INSERT OR UPDATE OR DELETE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_material_change();