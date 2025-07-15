-- First, let's drop all notification triggers to isolate the issue
DROP TRIGGER IF EXISTS stage_status_notification ON project_stages;
DROP TRIGGER IF EXISTS material_request_notification ON materials;
DROP TRIGGER IF EXISTS material_delivery_notification ON materials;
DROP TRIGGER IF EXISTS legal_document_notification ON legal_documents;

-- Let's test the stage update without any triggers first
-- We can add the triggers back one by one later