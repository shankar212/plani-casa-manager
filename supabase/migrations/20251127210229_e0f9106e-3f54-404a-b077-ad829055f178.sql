-- Allow users with project access to delete related notifications
CREATE POLICY "Users can delete notifications of accessible projects"
ON public.notifications
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.projects
    WHERE projects.id = notifications.project_id
      AND has_project_access(auth.uid(), projects.id)
  )
);
