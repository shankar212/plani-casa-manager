-- Temporarily drop the stage status notification trigger to isolate the issue
DROP TRIGGER IF EXISTS stage_status_notification ON project_stages;