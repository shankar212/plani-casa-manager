-- Drop all notification triggers and functions that are causing enum conflicts
DROP TRIGGER IF EXISTS stage_status_notification ON public.project_stages;
DROP TRIGGER IF EXISTS material_request_notification ON public.materials;
DROP TRIGGER IF EXISTS material_delivery_notification ON public.materials;
DROP TRIGGER IF EXISTS legal_document_notification ON public.legal_documents;

DROP FUNCTION IF EXISTS public.create_stage_notification();
DROP FUNCTION IF EXISTS public.create_material_request_notification();
DROP FUNCTION IF EXISTS public.create_delivery_notification();
DROP FUNCTION IF EXISTS public.create_legal_document_notification();