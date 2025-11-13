-- Improve stage change notifications
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
      'criou uma nova etapa',
      '',
      NEW.name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only notify if status or important fields changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM notify_project_collaborators(
        NEW.project_id,
        auth.uid(),
        'alterou o status da etapa',
        '',
        NEW.name
      );
    ELSIF OLD.progress_percentage IS DISTINCT FROM NEW.progress_percentage THEN
      PERFORM notify_project_collaborators(
        NEW.project_id,
        auth.uid(),
        'atualizou o progresso da etapa',
        '',
        NEW.name || ' (' || NEW.progress_percentage || '%)'
      );
    ELSE
      PERFORM notify_project_collaborators(
        NEW.project_id,
        auth.uid(),
        'atualizou a etapa',
        '',
        NEW.name
      );
    END IF;
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

-- Improve task change notifications
CREATE OR REPLACE FUNCTION trigger_notify_task_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id uuid;
  _stage_name text;
BEGIN
  -- Get project_id and stage name
  IF TG_OP = 'DELETE' THEN
    SELECT ps.project_id, ps.name INTO _project_id, _stage_name
    FROM project_stages ps
    WHERE ps.id = OLD.stage_id;
    
    PERFORM notify_project_collaborators(
      _project_id,
      auth.uid(),
      'removeu uma tarefa',
      'da etapa ' || _stage_name,
      OLD.name
    );
  ELSE
    SELECT ps.project_id, ps.name INTO _project_id, _stage_name
    FROM project_stages ps
    WHERE ps.id = NEW.stage_id;
    
    IF TG_OP = 'INSERT' THEN
      PERFORM notify_project_collaborators(
        _project_id,
        auth.uid(),
        'adicionou uma nova tarefa',
        'na etapa ' || _stage_name,
        NEW.name
      );
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.completed IS DISTINCT FROM NEW.completed THEN
        IF NEW.completed THEN
          PERFORM notify_project_collaborators(
            _project_id,
            auth.uid(),
            'concluiu a tarefa',
            'na etapa ' || _stage_name,
            NEW.name
          );
        ELSE
          PERFORM notify_project_collaborators(
            _project_id,
            auth.uid(),
            'reabriu a tarefa',
            'na etapa ' || _stage_name,
            NEW.name
          );
        END IF;
      ELSE
        PERFORM notify_project_collaborators(
          _project_id,
          auth.uid(),
          'atualizou a tarefa',
          'na etapa ' || _stage_name,
          NEW.name
        );
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;