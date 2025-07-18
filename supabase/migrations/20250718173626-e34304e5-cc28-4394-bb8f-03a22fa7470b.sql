
-- Update all existing projects to assign them to your user ID
UPDATE public.projects 
SET user_id = 'ebb8e404-2f24-4eb1-86df-7602fd4f3cb1'
WHERE user_id IS NULL;
