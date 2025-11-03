-- ============================================
-- FIX CRITICAL SECURITY ISSUES
-- ============================================

-- PART 1: Remove all public storage policies that bypass project ownership checks
-- These policies allow ANY authenticated user to access ANY project's files

-- Remove public policies from technical-documents bucket
DROP POLICY IF EXISTS "Allow public downloads from technical-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to technical-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to technical-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from technical-documents" ON storage.objects;

-- Remove public policies from legal-documents bucket
DROP POLICY IF EXISTS "Anyone can view legal documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload legal documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update legal documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete legal documents" ON storage.objects;

-- Remove public policies from project-photos bucket
DROP POLICY IF EXISTS "Project photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload project photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete project photos" ON storage.objects;

-- The proper ownership-checking policies remain in place:
-- - "Users can view technical documents of their own projects"
-- - "Users can upload technical documents to their own projects"
-- - "Users can delete technical documents from their own projects"
-- And similar for legal-documents and project-photos

-- PART 2: Fix nullable user_id columns in RLS-protected tables
-- First, check and clean up any NULL user_id records

-- Delete orphaned records with NULL user_id (if any exist)
DELETE FROM materials WHERE user_id IS NULL;
DELETE FROM material_suppliers WHERE user_id IS NULL;
DELETE FROM service_providers WHERE user_id IS NULL;
DELETE FROM projects WHERE user_id IS NULL;

-- Now make user_id columns NOT NULL to prevent future issues
ALTER TABLE projects 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE materials 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE material_suppliers 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE service_providers 
ALTER COLUMN user_id SET NOT NULL;