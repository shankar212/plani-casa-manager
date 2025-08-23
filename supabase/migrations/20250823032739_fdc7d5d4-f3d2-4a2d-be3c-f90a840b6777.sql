-- Fix the create_stage_notification function to avoid enum value issues
CREATE OR REPLACE FUNCTION public.create_stage_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  project_name TEXT;
  status_display TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get project name safely
    SELECT p.name INTO project_name 
    FROM public.projects p 
    WHERE p.id = NEW.project_id;
    
    -- Convert status to Portuguese for display in notification message only
    -- Don't assign back to NEW.status - just use for display
    status_display := CASE NEW.status
      WHEN 'finalizado' THEN 'Finalizados'
      WHEN 'andamento' THEN 'Em Andamento'  
      WHEN 'proximo' THEN 'Próximos'
      ELSE NEW.status
    END;
    
    -- Insert notification (use INSERT directly, no recursion issues)
    INSERT INTO public.notifications (title, message, type, project_id)
    VALUES (
      'Gestão',
      'Etapa ' || COALESCE(NEW.name, 'sem nome') || ' movida para ' || status_display ||
      CASE 
        WHEN project_name IS NOT NULL THEN ' - ' || project_name
        ELSE ''
      END,
      'gestao',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;