-- This script should be run in your Supabase SQL Editor as it bypasses RLS
-- Go to your Supabase Dashboard > SQL Editor > New Query and paste this

-- Create the storage bucket (this bypasses RLS when run in SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  updated_at = NOW();

-- Create storage policies for the bucket
-- Policy for public read access
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'article-images-public-read',
  'article-images',
  'Public Access',
  'bucket_id = ''article-images''',
  NULL,
  'SELECT',
  ARRAY['public', 'authenticated', 'anon']
)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'article-images-auth-insert',
  'article-images',
  'Authenticated users can upload',
  NULL,
  'bucket_id = ''article-images'' AND auth.role() = ''authenticated''',
  'INSERT',
  ARRAY['authenticated']
)
ON CONFLICT (id) DO NOTHING;

-- Policy for users to update their own uploads
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'article-images-auth-update',
  'article-images',
  'Users can update own uploads',
  'bucket_id = ''article-images''',
  'bucket_id = ''article-images''',
  'UPDATE',
  ARRAY['authenticated']
)
ON CONFLICT (id) DO NOTHING;

-- Policy for users to delete their own uploads
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'article-images-auth-delete',
  'article-images',
  'Users can delete own uploads',
  'bucket_id = ''article-images''',
  'bucket_id = ''article-images''',
  'DELETE',
  ARRAY['authenticated']
)
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'article-images';
