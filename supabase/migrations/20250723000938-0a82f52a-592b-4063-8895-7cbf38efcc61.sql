
-- Fix Function Search Path Mutable warnings by adding SET search_path = '' to all functions

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update the handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Update the create_legal_document_notification function
CREATE OR REPLACE FUNCTION public.create_legal_document_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM public.projects p 
  WHERE p.id = NEW.project_id;
  
  INSERT INTO public.notifications (title, message, type, project_id)
  VALUES (
    'Conformidade Legal',
    'Novo documento adicionado: ' || NEW.file_name ||
    CASE 
      WHEN project_name IS NOT NULL THEN ' - ' || project_name
      ELSE ''
    END,
    'conformidade',
    NEW.project_id
  );
  
  RETURN NEW;
END;
$function$;

-- Update the create_stage_notification function
CREATE OR REPLACE FUNCTION public.create_stage_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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
      'Etapa ' || COALESCE(NEW.name, 'sem nome') || ' movida para ' || status_display,
      'gestao',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the create_material_request_notification function
CREATE OR REPLACE FUNCTION public.create_material_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM public.projects p 
  WHERE p.id = NEW.project_id;
  
  INSERT INTO public.notifications (title, message, type, project_id)
  VALUES (
    'Pedidos',
    'Novo pedido de material: ' || NEW.material_name || 
    CASE 
      WHEN NEW.estimated_total_cost IS NOT NULL THEN ' (R$ ' || NEW.estimated_total_cost || ')'
      ELSE ''
    END ||
    CASE 
      WHEN project_name IS NOT NULL THEN ' - ' || project_name
      ELSE ''
    END,
    'pedidos',
    NEW.project_id
  );
  
  RETURN NEW;
END;
$function$;

-- Update the create_delivery_notification function
CREATE OR REPLACE FUNCTION public.create_delivery_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM public.projects p 
  WHERE p.id = NEW.project_id;
  
  -- Only create notification if status changed to delivered
  IF OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
    INSERT INTO public.notifications (title, message, type, project_id)
    VALUES (
      'Entregas',
      'Material entregue: ' || NEW.material_name ||
      CASE 
        WHEN project_name IS NOT NULL THEN ' - ' || project_name
        ELSE ''
      END,
      'entregas',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the triggers to ensure they use the updated functions
DROP TRIGGER IF EXISTS stage_status_notification ON public.project_stages;
DROP TRIGGER IF EXISTS material_request_notification ON public.materials;
DROP TRIGGER IF EXISTS material_delivery_notification ON public.materials;
DROP TRIGGER IF EXISTS legal_document_notification ON public.legal_documents;

CREATE TRIGGER stage_status_notification
  AFTER UPDATE ON public.project_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_stage_notification();

CREATE TRIGGER material_request_notification
  AFTER INSERT ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.create_material_request_notification();

CREATE TRIGGER material_delivery_notification
  AFTER UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.create_delivery_notification();

CREATE TRIGGER legal_document_notification
  AFTER INSERT ON public.legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_legal_document_notification();
