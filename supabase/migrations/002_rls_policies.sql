-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table user_settings enable row level security;
alter table manhwa enable row level security;
alter table manhwa_genres enable row level security;
alter table manhwa_tags enable row level security;
alter table chapters enable row level security;
alter table panels enable row level security;
alter table downloads enable row level security;
alter table library enable row level security;
alter table reading_progress enable row level security;
alter table comments enable row level security;
alter table comment_likes enable row level security;
alter table reviews enable row level security;
alter table analytics enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table moderation_log enable row level security;
alter table tags enable row level security;
alter table genres enable row level security;

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── PROFILES ───────────────────────────────────────────────
create policy "profiles_public_read"     on profiles for select using (true);
create policy "profiles_own_insert"      on profiles for insert with check (id = auth.uid());
create policy "profiles_own_update"      on profiles for update using (id = auth.uid() or is_admin());
create policy "profiles_admin_delete"    on profiles for delete using (is_admin());

-- ─── USER SETTINGS ──────────────────────────────────────────
create policy "settings_own_all"         on user_settings for all using (user_id = auth.uid());
create policy "settings_admin_read"      on user_settings for select using (is_admin());

-- ─── GENRES & TAGS ──────────────────────────────────────────
create policy "genres_public_read"       on genres for select using (true);
create policy "genres_admin_write"       on genres for all using (is_admin());
create policy "tags_public_read"         on tags for select using (true);
create policy "tags_admin_write"         on tags for all using (is_admin());

-- ─── MANHWA ─────────────────────────────────────────────────
create policy "manhwa_public_read"       on manhwa for select using (true);
create policy "manhwa_admin_write"       on manhwa for insert with check (is_admin());
create policy "manhwa_admin_update"      on manhwa for update using (is_admin());
create policy "manhwa_admin_delete"      on manhwa for delete using (is_admin());

-- ─── MANHWA GENRES & TAGS ───────────────────────────────────
create policy "manhwa_genres_public_read" on manhwa_genres for select using (true);
create policy "manhwa_genres_admin_write" on manhwa_genres for all using (is_admin());
create policy "manhwa_tags_public_read"   on manhwa_tags for select using (true);
create policy "manhwa_tags_admin_write"   on manhwa_tags for all using (is_admin());

-- ─── CHAPTERS ───────────────────────────────────────────────
create policy "chapters_public_read"     on chapters for select using (true);
create policy "chapters_admin_write"     on chapters for insert with check (is_admin());
create policy "chapters_admin_update"    on chapters for update using (is_admin());
create policy "chapters_admin_delete"    on chapters for delete using (is_admin());

-- ─── PANELS ─────────────────────────────────────────────────
create policy "panels_public_read"       on panels for select using (true);
create policy "panels_admin_write"       on panels for insert with check (is_admin());
create policy "panels_admin_update"      on panels for update using (is_admin());
create policy "panels_admin_delete"      on panels for delete using (is_admin());

-- ─── DOWNLOADS ──────────────────────────────────────────────
create policy "downloads_public_read"    on downloads for select using (true);
create policy "downloads_admin_write"    on downloads for all using (is_admin());

-- ─── LIBRARY ────────────────────────────────────────────────
create policy "library_own_read"         on library for select using (user_id = auth.uid());
create policy "library_own_insert"       on library for insert with check (user_id = auth.uid());
create policy "library_own_delete"       on library for delete using (user_id = auth.uid());
create policy "library_admin_read"       on library for select using (is_admin());

-- ─── READING PROGRESS ───────────────────────────────────────
create policy "progress_own_all"         on reading_progress for all using (user_id = auth.uid());
create policy "progress_admin_read"      on reading_progress for select using (is_admin());

-- ─── COMMENTS ───────────────────────────────────────────────
create policy "comments_public_read"     on comments for select using (deleted = false);
create policy "comments_auth_insert"     on comments for insert with check (auth.uid() is not null and user_id = auth.uid());
create policy "comments_own_update"      on comments for update using (user_id = auth.uid() or is_admin());
create policy "comments_admin_delete"    on comments for delete using (is_admin());

-- ─── COMMENT LIKES ──────────────────────────────────────────
create policy "comment_likes_public_read"  on comment_likes for select using (true);
create policy "comment_likes_own_insert"   on comment_likes for insert with check (user_id = auth.uid());
create policy "comment_likes_own_delete"   on comment_likes for delete using (user_id = auth.uid());

-- ─── REVIEWS ────────────────────────────────────────────────
create policy "reviews_public_read"      on reviews for select using (true);
create policy "reviews_own_insert"       on reviews for insert with check (user_id = auth.uid());
create policy "reviews_own_update"       on reviews for update using (user_id = auth.uid() or is_admin());
create policy "reviews_own_delete"       on reviews for delete using (user_id = auth.uid() or is_admin());

-- ─── ANALYTICS ──────────────────────────────────────────────
create policy "analytics_admin_read"     on analytics for select using (is_admin());
create policy "analytics_anon_insert"    on analytics for insert with check (true);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
create policy "notifications_own_read"   on notifications for select using (user_id = auth.uid());
create policy "notifications_own_update" on notifications for update using (user_id = auth.uid());
create policy "notifications_admin_write" on notifications for insert with check (is_admin());

-- ─── REPORTS ────────────────────────────────────────────────
create policy "reports_own_insert"       on reports for insert with check (reporter_id = auth.uid());
create policy "reports_admin_read"       on reports for select using (is_admin());
create policy "reports_admin_update"     on reports for update using (is_admin());

-- ─── MODERATION LOG ─────────────────────────────────────────
create policy "modlog_admin_all"         on moderation_log for all using (is_admin());

-- ─── STORAGE POLICIES ───────────────────────────────────────
-- Run in Supabase dashboard or via CLI after creating buckets:

-- avatars bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
-- covers bucket
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict do nothing;
-- banners bucket
insert into storage.buckets (id, name, public) values ('banners', 'banners', true) on conflict do nothing;
-- chapter-panels bucket
insert into storage.buckets (id, name, public) values ('chapter-panels', 'chapter-panels', true) on conflict do nothing;
-- downloads bucket
insert into storage.buckets (id, name, public) values ('downloads', 'downloads', false) on conflict do nothing;

-- Storage RLS
create policy "avatars_public_read"      on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_own_upload"       on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_own_delete"       on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "covers_public_read"       on storage.objects for select using (bucket_id = 'covers');
create policy "covers_admin_write"       on storage.objects for insert with check (bucket_id = 'covers' and is_admin());
create policy "covers_admin_delete"      on storage.objects for delete using (bucket_id = 'covers' and is_admin());

create policy "banners_public_read"      on storage.objects for select using (bucket_id = 'banners');
create policy "banners_admin_write"      on storage.objects for insert with check (bucket_id = 'banners' and is_admin());

create policy "panels_public_read"       on storage.objects for select using (bucket_id = 'chapter-panels');
create policy "panels_admin_write"       on storage.objects for insert with check (bucket_id = 'chapter-panels' and is_admin());
create policy "panels_admin_delete"      on storage.objects for delete using (bucket_id = 'chapter-panels' and is_admin());

create policy "downloads_auth_read"      on storage.objects for select using (bucket_id = 'downloads' and auth.uid() is not null);
create policy "downloads_admin_write"    on storage.objects for insert with check (bucket_id = 'downloads' and is_admin());
