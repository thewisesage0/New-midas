-- ============================================================
-- HOUSE OF MIDAS PEN — Complete Supabase Schema
-- ============================================================

-- Extensions
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- ─── ENUMS ──────────────────────────────────────────────────
create type user_role as enum ('reader', 'admin');
create type manhwa_status as enum ('Ongoing', 'Completed', 'Hiatus');
create type download_format as enum ('PDF', 'EPUB');
create type report_status as enum ('pending', 'reviewed', 'dismissed');
create type report_reason as enum ('spam', 'harassment', 'spoiler', 'inappropriate', 'other');
create type moderation_action as enum ('warn', 'delete', 'ban');

-- ─── PROFILES ───────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  username      text unique,
  display_name  text not null default '',
  avatar_url    text,
  role          user_role not null default 'reader',
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_username_idx on profiles(username);
create index profiles_role_idx on profiles(role);

-- ─── USER SETTINGS ──────────────────────────────────────────
create table user_settings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  notifications_new_chapter  boolean default true,
  notifications_comments     boolean default true,
  reading_mode        text default 'scroll',
  theme               text default 'dark',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── GENRES ─────────────────────────────────────────────────
create table genres (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

insert into genres (name) values
  ('Werewolf'), ('Dark Romance'), ('Fantasy'), ('Romance'),
  ('Paranormal'), ('Revenge'), ('Mafia'), ('Thriller'),
  ('Sci-Fi'), ('Lycan'), ('Contemporary'), ('New Adult'), ('Sports');

-- ─── TAGS ───────────────────────────────────────────────────
create table tags (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

-- ─── MANHWA ─────────────────────────────────────────────────
create table manhwa (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique,
  title       text not null,
  cover_url   text,
  banner_url  text,
  status      manhwa_status not null default 'Ongoing',
  blurb       text,
  year        int default extract(year from now())::int,
  views       bigint not null default 0,
  rating      numeric(3,2) default 0,
  author_id   uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index manhwa_views_idx    on manhwa(views desc);
create index manhwa_rating_idx   on manhwa(rating desc);
create index manhwa_created_idx  on manhwa(created_at desc);
create index manhwa_status_idx   on manhwa(status);
create index manhwa_title_trgm   on manhwa using gin(title gin_trgm_ops);
create index manhwa_blurb_trgm   on manhwa using gin(blurb gin_trgm_ops);

-- ─── MANHWA GENRES ──────────────────────────────────────────
create table manhwa_genres (
  manhwa_id  uuid not null references manhwa(id) on delete cascade,
  genre_id   uuid not null references genres(id) on delete cascade,
  primary key (manhwa_id, genre_id)
);

-- ─── MANHWA TAGS ────────────────────────────────────────────
create table manhwa_tags (
  manhwa_id  uuid not null references manhwa(id) on delete cascade,
  tag_id     uuid not null references tags(id) on delete cascade,
  primary key (manhwa_id, tag_id)
);

-- ─── CHAPTERS ───────────────────────────────────────────────
create table chapters (
  id            uuid primary key default gen_random_uuid(),
  manhwa_id     uuid not null references manhwa(id) on delete cascade,
  number        int not null,
  title         text not null,
  description   text,
  thumbnail_url text,
  release_date  date not null default current_date,
  views         bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (manhwa_id, number)
);

create index chapters_manhwa_idx    on chapters(manhwa_id, number);
create index chapters_release_idx   on chapters(release_date desc);
create index chapters_views_idx     on chapters(views desc);

-- ─── PANELS ─────────────────────────────────────────────────
create table panels (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references chapters(id) on delete cascade,
  position    int not null,
  image_url   text not null,
  created_at  timestamptz not null default now(),
  unique (chapter_id, position)
);

create index panels_chapter_idx on panels(chapter_id, position);

-- ─── DOWNLOADS ──────────────────────────────────────────────
create table downloads (
  id          uuid primary key default gen_random_uuid(),
  manhwa_id   uuid not null references manhwa(id) on delete cascade,
  name        text not null,
  format      download_format not null,
  file_url    text not null,
  size_bytes  bigint,
  download_count bigint default 0,
  created_at  timestamptz not null default now()
);

create index downloads_manhwa_idx on downloads(manhwa_id);

-- ─── LIBRARY (saved manhwa) ──────────────────────────────────
create table library (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  manhwa_id   uuid not null references manhwa(id) on delete cascade,
  saved_at    timestamptz not null default now(),
  unique (user_id, manhwa_id)
);

create index library_user_idx   on library(user_id, saved_at desc);
create index library_manhwa_idx on library(manhwa_id);

-- ─── READING PROGRESS ───────────────────────────────────────
create table reading_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  manhwa_id   uuid not null references manhwa(id) on delete cascade,
  chapter_id  uuid not null references chapters(id) on delete cascade,
  pct         numeric(5,2) default 0 check (pct >= 0 and pct <= 100),
  updated_at  timestamptz not null default now(),
  unique (user_id, manhwa_id)
);

create index reading_progress_user_idx on reading_progress(user_id, updated_at desc);

-- ─── COMMENTS ───────────────────────────────────────────────
create table comments (
  id          uuid primary key default gen_random_uuid(),
  manhwa_id   uuid not null references manhwa(id) on delete cascade,
  chapter_id  uuid references chapters(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  parent_id   uuid references comments(id) on delete cascade,
  body        text not null check (char_length(body) >= 1 and char_length(body) <= 2000),
  likes       int not null default 0,
  pinned      boolean not null default false,
  is_author   boolean not null default false,
  deleted     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create index comments_manhwa_idx   on comments(manhwa_id, created_at desc);
create index comments_chapter_idx  on comments(chapter_id, created_at desc);
create index comments_user_idx     on comments(user_id);
create index comments_parent_idx   on comments(parent_id);

-- ─── COMMENT LIKES ──────────────────────────────────────────
create table comment_likes (
  comment_id  uuid not null references comments(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  primary key (comment_id, user_id)
);

-- ─── REVIEWS ────────────────────────────────────────────────
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  manhwa_id   uuid not null references manhwa(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  rating      numeric(2,1) not null check (rating >= 1 and rating <= 5),
  body        text check (char_length(body) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz,
  unique (manhwa_id, user_id)
);

create index reviews_manhwa_idx on reviews(manhwa_id, created_at desc);

-- ─── ANALYTICS ──────────────────────────────────────────────
create table analytics (
  id          uuid primary key default gen_random_uuid(),
  manhwa_id   uuid references manhwa(id) on delete cascade,
  chapter_id  uuid references chapters(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  event       text not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index analytics_manhwa_idx  on analytics(manhwa_id, created_at desc);
create index analytics_chapter_idx on analytics(chapter_id, created_at desc);
create index analytics_event_idx   on analytics(event, created_at desc);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on notifications(user_id, read, created_at desc);

-- ─── REPORTS ────────────────────────────────────────────────
create table reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references profiles(id) on delete cascade,
  comment_id    uuid references comments(id) on delete cascade,
  reason        report_reason not null,
  details       text,
  status        report_status not null default 'pending',
  resolved_by   uuid references profiles(id) on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index reports_status_idx on reports(status, created_at desc);

-- ─── MODERATION LOG ─────────────────────────────────────────
create table moderation_log (
  id              uuid primary key default gen_random_uuid(),
  admin_id        uuid not null references profiles(id) on delete cascade,
  target_user_id  uuid references profiles(id) on delete cascade,
  comment_id      uuid references comments(id) on delete set null,
  action          moderation_action not null,
  reason          text,
  created_at      timestamptz not null default now()
);

-- ─── TIMESTAMPS TRIGGER ─────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger manhwa_updated_at before update on manhwa for each row execute function set_updated_at();
create trigger chapters_updated_at before update on chapters for each row execute function set_updated_at();
create trigger user_settings_updated_at before update on user_settings for each row execute function set_updated_at();

-- ─── RECALCULATE MANHWA RATING ───────────────────────────────
create or replace function recalculate_manhwa_rating()
returns trigger language plpgsql security definer as $$
begin
  update manhwa
  set rating = (select coalesce(avg(rating), 0) from reviews where manhwa_id = coalesce(new.manhwa_id, old.manhwa_id))
  where id = coalesce(new.manhwa_id, old.manhwa_id);
  return null;
end;
$$;

create trigger reviews_rating_update
after insert or update or delete on reviews
for each row execute function recalculate_manhwa_rating();

-- ─── INCREMENT COMMENT LIKES ────────────────────────────────
create or replace function sync_comment_likes()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update comments set likes = likes + 1 where id = new.comment_id;
  elsif TG_OP = 'DELETE' then
    update comments set likes = likes - 1 where id = old.comment_id;
  end if;
  return null;
end;
$$;

create trigger comment_likes_sync
after insert or delete on comment_likes
for each row execute function sync_comment_likes();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _role user_role := 'reader';
begin
  -- Check if email matches admin
  if new.email = 'thesage196@gmail.com' then
    _role := 'admin';
  end if;

  insert into profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), _role);

  insert into user_settings (user_id) values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ─── SEARCH FUNCTION ────────────────────────────────────────
create or replace function search_manhwa(query text)
returns setof manhwa language sql stable as $$
  select * from manhwa
  where
    title ilike '%' || query || '%'
    or blurb ilike '%' || query || '%'
    or id in (
      select mt.manhwa_id from manhwa_tags mt
      join tags t on t.id = mt.tag_id
      where t.name ilike '%' || query || '%'
    )
    or id in (
      select mg.manhwa_id from manhwa_genres mg
      join genres g on g.id = mg.genre_id
      where g.name ilike '%' || query || '%'
    )
  order by views desc;
$$;

-- ─── ADMIN ANALYTICS VIEW ───────────────────────────────────
create or replace view admin_stats as
select
  (select count(*) from profiles where role = 'reader') as total_readers,
  (select count(*) from manhwa) as total_manhwa,
  (select count(*) from chapters) as total_chapters,
  (select count(*) from comments where deleted = false) as total_comments,
  (select coalesce(sum(views), 0) from manhwa) as total_views,
  (select coalesce(sum(download_count), 0) from downloads) as total_downloads;

-- ─── SEED DATA ──────────────────────────────────────────────
-- Insert seed genres/tags inline so they're available immediately
insert into tags (name) values
  ('fated mates'), ('wolfless heroine'), ('powerful alpha'), ('revenge'),
  ('second chance'), ('revenge arc'), ('luna rising'), ('forbidden desire'),
  ('captive romance'), ('feral alpha'), ('dark king'), ('sacrifice'),
  ('rejection'), ('rival alpha'), ('arranged marriage'), ('enemies to lovers'),
  ('fake dating'), ('slow burn'), ('hidden identity'), ('dark fantasy')
on conflict do nothing;
