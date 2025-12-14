-- Check if photos bucket exists
SELECT * FROM storage.buckets WHERE name = 'photos';

-- Create photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Check bucket permissions
SELECT 
  bucket_id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'photos';
