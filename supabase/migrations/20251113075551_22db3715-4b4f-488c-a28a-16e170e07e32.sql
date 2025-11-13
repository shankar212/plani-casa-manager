DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Any user can create own projects'
  ) THEN
    CREATE POLICY "Any user can create own projects"
    ON public.projects
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;