-- Allow any authenticated user to create their own projects (in addition to role-based policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Authenticated users can create own projects'
  ) THEN
    CREATE POLICY "Authenticated users can create own projects"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;