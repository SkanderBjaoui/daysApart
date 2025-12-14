-- Update memories table: change type first, then rename
ALTER TABLE memories ALTER COLUMN photo_url TYPE text USING photo_url::text;
ALTER TABLE memories RENAME COLUMN photo_url TO photo;

-- Update photos table: change type first, then rename (column is named 'url' not 'photo_url')
ALTER TABLE photos ALTER COLUMN url TYPE text USING url::text;
ALTER TABLE photos RENAME COLUMN url TO photo;

-- Alternative: Use bytea for binary data (if storing actual image bytes)
-- ALTER TABLE memories ALTER COLUMN photo_url TYPE bytea USING photo_url::bytea;
-- ALTER TABLE memories RENAME COLUMN photo_url TO photo;
-- ALTER TABLE photos ALTER COLUMN url TYPE bytea USING url::bytea;
-- ALTER TABLE photos RENAME COLUMN url TO photo;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('memories', 'photos') 
AND column_name = 'photo';
