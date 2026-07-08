-- ============================================================
-- VIEW INCREMENT FUNCTIONS (called from services)
-- ============================================================

-- Increment manhwa views atomically
create or replace function increment_manhwa_views(manhwa_id uuid)
returns void language sql security definer as $$
  update manhwa set views = views + 1 where id = manhwa_id;
$$;

-- Increment chapter views atomically
create or replace function increment_chapter_views(chapter_id uuid)
returns void language sql security definer as $$
  update chapters set views = views + 1 where id = chapter_id;
$$;

-- Increment download count atomically
create or replace function increment_download_count(download_id uuid)
returns void language sql security definer as $$
  update downloads set download_count = download_count + 1 where id = download_id;
$$;

-- Grant execute to anon and authenticated so frontend can call them without auth
grant execute on function increment_manhwa_views(uuid) to anon, authenticated;
grant execute on function increment_chapter_views(uuid) to anon, authenticated;
grant execute on function increment_download_count(uuid) to authenticated;
