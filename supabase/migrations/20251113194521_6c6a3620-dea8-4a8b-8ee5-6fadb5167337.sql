-- Make lesson-files bucket public so uploaded videos can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE name = 'lesson-files';