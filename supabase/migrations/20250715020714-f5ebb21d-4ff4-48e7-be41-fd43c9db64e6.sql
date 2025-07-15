-- Drop the trigger and recreate with actual database values instead of converting to Portuguese
DROP TRIGGER IF EXISTS stage_status_notification ON project_stages;

-- Recreate the stage status notification trigger using actual database values
CREATE OR REPLACE FUNCTION create_stage_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get project name safely
    SELECT p.name INTO project_name 
    FROM projects p 
    WHERE p.id = NEW.project_id;
    
    -- Insert notification using the actual status value from database
    INSERT INTO notifications (title, message, type, project_id)
    VALUES (
      'Gestão',
      'Etapa ' || COALESCE(NEW.name, 'sem nome') || ' movida para ' || NEW.status,
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