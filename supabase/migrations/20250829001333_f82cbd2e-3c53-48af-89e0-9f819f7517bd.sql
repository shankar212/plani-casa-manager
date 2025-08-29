-- Add sale_value column to projects table
ALTER TABLE public.projects 
ADD COLUMN sale_value NUMERIC DEFAULT 0;