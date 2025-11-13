-- Update notifications type check constraint to include all existing and new types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('task_update', 'stage_complete', 'project_shared', 'project_activity', 'pedidos', 'gestao', 'entregas'));