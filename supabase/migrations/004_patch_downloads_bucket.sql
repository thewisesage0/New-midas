-- ============================================================
-- PATCH: Make downloads bucket public so file URLs work directly
-- Run this in Supabase SQL Editor if you already ran 002
-- ============================================================

-- Update downloads bucket to public
update storage.buckets set public = true where id = 'downloads';

-- Drop old restricted policy and replace with public read
drop policy if exists "downloads_auth_read" on storage.objects;
drop policy if exists "downloads_public_read" on storage.objects;

create policy "downloads_public_read"
  on storage.objects for select
  using (bucket_id = 'downloads');
