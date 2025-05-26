-- Create the article-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update own uploads" ON storage.objects FOR UPDATE 
USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete own uploads" ON storage.objects FOR DELETE 
USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);
