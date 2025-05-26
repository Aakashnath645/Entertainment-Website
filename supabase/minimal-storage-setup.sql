-- Minimal storage bucket creation (works with all Supabase versions)
-- Run this in your Supabase SQL Editor

-- Create the storage bucket (simple version)
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'article-images';
