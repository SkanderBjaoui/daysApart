-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;

-- Create policies for storage bucket
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
