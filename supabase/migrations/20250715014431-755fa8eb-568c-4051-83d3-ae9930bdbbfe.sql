-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS stage_status_notification ON project_stages;

-- Recreate the function with proper logic
CREATE OR REPLACE FUNCTION create_stage_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  status_display TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get project name
    SELECT p.name INTO project_name 
    FROM projects p 
    WHERE p.id = NEW.project_id;
    
    -- Convert status to Portuguese for display
    status_display := CASE NEW.status
      WHEN 'finalizado' THEN 'Finalizados'
      WHEN 'andamento' THEN 'Em Andamento'  
      WHEN 'proximo' THEN 'Próximos'
      ELSE NEW.status
    END;
    
    -- Insert notification
    INSERT INTO notifications (title, message, type, project_id)
    VALUES (
      'Gestão',
      'Etapa ' || NEW.name || ' movida para ' || status_display,
      'gestao',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER stage_status_notification
  AFTER UPDATE ON project_stages
  FOR EACH ROW
  EXECUTE FUNCTION create_stage_notification();