-- Recreate the stage status notification trigger with correct implementation
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
    status_display := CASE NEW.status
      WHEN 'finalizado' THEN 'Finalizados'
      WHEN 'andamento' THEN 'Em Andamento'  
      WHEN 'proximo' THEN 'Próximos'
      ELSE NEW.status
    END;
    
    -- Insert notification (use INSERT directly, no recursion issues)
    INSERT INTO notifications (title, message, type, project_id)
    VALUES (
      'Gestão',
      'Etapa ' || COALESCE(NEW.name, 'sem nome') || ' movida para ' || status_display,
      'gestao',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER stage_status_notification
  AFTER UPDATE ON project_stages
  FOR EACH ROW
  EXECUTE FUNCTION create_stage_notification();

-- Recreate material request notification trigger
CREATE OR REPLACE FUNCTION create_material_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  INSERT INTO notifications (title, message, type, project_id)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER material_request_notification
  AFTER INSERT ON materials
  FOR EACH ROW
  EXECUTE FUNCTION create_material_request_notification();

-- Recreate material delivery notification trigger
CREATE OR REPLACE FUNCTION create_delivery_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  -- Only create notification if status changed to delivered
  IF OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
    INSERT INTO notifications (title, message, type, project_id)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER material_delivery_notification
  AFTER UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_notification();

-- Recreate legal document notification trigger
CREATE OR REPLACE FUNCTION create_legal_document_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  INSERT INTO notifications (title, message, type, project_id)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER legal_document_notification
  AFTER INSERT ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_legal_document_notification();