-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gestao', 'pedidos', 'entregas', 'conformidade')),
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
ON public.notifications 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.notifications 
FOR UPDATE 
USING (true);

-- Function to create notification for stage status changes
CREATE OR REPLACE FUNCTION create_stage_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  status_text TEXT;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  -- Convert status to Portuguese
  status_text := CASE NEW.status
    WHEN 'finalizado' THEN 'Finalizados'
    WHEN 'andamento' THEN 'Em Andamento'
    WHEN 'proximo' THEN 'Próximos'
    ELSE NEW.status
  END;
  
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (title, message, type, project_id)
    VALUES (
      'Gestão',
      'Etapa ' || NEW.name || ' movida para ' || status_text,
      'gestao',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for new material requests
CREATE OR REPLACE FUNCTION create_material_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  total_cost NUMERIC := 0;
  material_count INTEGER := 0;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  -- Count materials and calculate cost for this request batch
  -- (assuming materials are added in batches with similar timestamps)
  SELECT COUNT(*), COALESCE(SUM(estimated_total_cost), 0)
  INTO material_count, total_cost
  FROM materials 
  WHERE project_id = NEW.project_id 
  AND created_at >= NOW() - INTERVAL '1 minute';
  
  INSERT INTO notifications (title, message, type, project_id)
  VALUES (
    'Pedidos',
    'Novo pedido de material criado, ' || material_count || ' materiais solicitados a um custo de R$ ' || COALESCE(total_cost, 0),
    'pedidos',
    NEW.project_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for material deliveries
CREATE OR REPLACE FUNCTION create_delivery_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
  delivery_count INTEGER := 0;
BEGIN
  -- Get project name
  SELECT p.name INTO project_name 
  FROM projects p 
  WHERE p.id = NEW.project_id;
  
  -- Only create notification if status changed to delivered
  IF OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
    -- Count deliveries for today
    SELECT COUNT(*)
    INTO delivery_count
    FROM materials 
    WHERE project_id = NEW.project_id 
    AND status = 'delivered'
    AND delivery_date = CURRENT_DATE;
    
    INSERT INTO notifications (title, message, type, project_id)
    VALUES (
      'Entregas',
      'Novos materiais entregues, ' || delivery_count || ' materiais entregues no dia ' || TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY'),
      'entregas',
      NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for legal documents
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
    'Novo documento adicionado em ' || COALESCE(project_name, 'projeto') || ' "' || NEW.file_name || '"',
    'conformidade',
    NEW.project_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER stage_status_notification
  AFTER UPDATE ON project_stages
  FOR EACH ROW
  EXECUTE FUNCTION create_stage_notification();

CREATE TRIGGER material_request_notification
  AFTER INSERT ON materials
  FOR EACH ROW
  EXECUTE FUNCTION create_material_request_notification();

CREATE TRIGGER material_delivery_notification
  AFTER UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_notification();

CREATE TRIGGER legal_document_notification
  AFTER INSERT ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_legal_document_notification();

-- Create index for better performance
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);