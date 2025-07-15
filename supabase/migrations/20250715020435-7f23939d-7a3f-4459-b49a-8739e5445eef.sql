-- Recreate the stage status notification trigger with proper safeguards
CREATE OR REPLACE FUNCTION create_stage_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  status_display TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get project name safely
    SELECT p.name INTO project_name 
    FROM projects p 
    WHERE p.id = NEW.project_id;
    
    -- Convert status to Portuguese for display in notification message only
    -- Use a local variable to avoid any interference with NEW record
    status_display := CASE NEW.status
      WHEN 'finalizado' THEN 'Finalizados'
      WHEN 'andamento' THEN 'Em Andamento'  
      WHEN 'proximo' THEN 'Próximos'
      ELSE NEW.status
    END;
    
    -- Insert notification using explicit values to avoid any interference
    INSERT INTO notifications (title, message, type, project_id)
    VALUES (
      'Gestão',
      'Etapa ' || COALESCE(NEW.name, 'sem nome') || ' movida para ' || status_display,
      'gestao',
      NEW.project_id
    );
  END IF;
  
  -- Always return NEW unchanged
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER stage_status_notification
  AFTER UPDATE ON project_stages
  FOR EACH ROW
  EXECUTE FUNCTION create_stage_notification();