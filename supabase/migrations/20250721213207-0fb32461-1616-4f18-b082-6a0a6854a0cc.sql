
-- First, update all materials with 'used' status to 'delivered'
UPDATE public.materials 
SET status = 'delivered'::material_status 
WHERE status = 'used'::material_status;

-- Create a new enum without the 'used' value
CREATE TYPE material_status_new AS ENUM ('requested', 'delivered');

-- Update the materials table to use the new enum
ALTER TABLE public.materials 
ALTER COLUMN status TYPE material_status_new 
USING status::text::material_status_new;

-- Drop the old enum and rename the new one
DROP TYPE material_status;
ALTER TYPE material_status_new RENAME TO material_status;

-- Optional: Remove the used_date column since it's no longer needed
ALTER TABLE public.materials DROP COLUMN IF EXISTS used_date;

-- Update the delivery notification trigger to work with the new status values
CREATE OR REPLACE FUNCTION public.create_delivery_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;
