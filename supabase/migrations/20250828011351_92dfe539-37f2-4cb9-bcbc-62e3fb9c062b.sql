-- Remove unnecessary RPC now that we normalize on client and update directly
DROP FUNCTION IF EXISTS public.update_stage_status(uuid, text);