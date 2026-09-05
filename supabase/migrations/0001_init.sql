-- Shipaton 2026 — initial schema
-- Source of truth: schema.txt (read that file for the full "why" behind each
-- decision below — this migration only comments on where it DEVIATES).

--------------------------------------------------------------------------------
-- Extensions
--------------------------------------------------------------------------------
create extension if not exists citext;

--------------------------------------------------------------------------------
-- Enums
--------------------------------------------------------------------------------
create type lesson_access as enum ('free', 'paid');

--------------------------------------------------------------------------------
-- profiles — every user; creators are a flag, not a separate table
--------------------------------------------------------------------------------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        citext unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name  text not null,
  avatar_url    text,
  bio           text,
  is_creator    boolean not null default false,
  created_at    timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- courses — the paid destination
--------------------------------------------------------------------------------
create table courses (
  id                  uuid primary key default gen_random_uuid(),
  creator_id          uuid not null references profiles(id) on delete cascade,
  title               text not null,
  subtitle            text,
  description         text,
  cover_url           text,
  requires_pro        boolean not null default true,  -- unlocked by the 'pro' subscription
  published           boolean not null default false,
  created_at          timestamptz not null default now()
);

create index on courses (creator_id) where published;

--------------------------------------------------------------------------------
-- lessons — the feed unit
--------------------------------------------------------------------------------
create table lessons (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid not null references profiles(id) on delete cascade,
  course_id        uuid references courses(id) on delete set null,  -- NULLABLE
  title            text not null,
  description      text,
  topic            text,
  video_path       text not null,      -- storage object path, NOT a public URL
  thumbnail_url    text,
  duration_seconds int not null check (duration_seconds > 0),
  access           lesson_access not null default 'free',
  order_index      int not null default 0,
  published        boolean not null default false,
  like_count       int not null default 0,   -- denormalised
  view_count       int not null default 0,   -- denormalised
  created_at       timestamptz not null default now(),

  -- DEVIATION from schema.txt: the "byte-sized, 90s max" rule is a feed rule,
  -- not a lessons-table rule. src/lib/seed/courses.ts already models paid
  -- course lessons as long-form (9-14 min) — that's the product: free feed
  -- clips are short bait, paid course lessons are the real teaching content.
  -- A blanket 90s cap on the table would reject every paid lesson on insert.
  constraint lessons_free_duration_cap check (access = 'paid' or duration_seconds <= 90)
);

create index on lessons (published, created_at desc);
create index on lessons (course_id) where published;
create index on lessons (creator_id) where published;

--------------------------------------------------------------------------------
-- Engagement
--------------------------------------------------------------------------------
create table likes (
  user_id    uuid not null references profiles(id) on delete cascade,
  lesson_id  uuid not null references lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index on likes (lesson_id);

create table saves (
  user_id    uuid not null references profiles(id) on delete cascade,
  lesson_id  uuid not null references lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  creator_id  uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, creator_id),
  check (follower_id <> creator_id)
);
create index on follows (creator_id);

--------------------------------------------------------------------------------
-- watch_events — the growth-loop evidence
--------------------------------------------------------------------------------
create table watch_events (
  id          bigserial primary key,
  user_id     uuid references profiles(id) on delete set null,  -- nullable: anon
  lesson_id   uuid not null references lessons(id) on delete cascade,
  watched_ms  int not null,
  completed   boolean not null default false,
  cta_shown   boolean not null default false,
  cta_tapped  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on watch_events (lesson_id, created_at desc);

--------------------------------------------------------------------------------
-- entitlements — mirror of RevenueCat subscription state, written by webhook ONLY
--------------------------------------------------------------------------------
create table entitlements (
  user_id      uuid primary key references profiles(id) on delete cascade,
  entitlement  text not null default 'pro',
  rc_event_id  text,
  granted_at   timestamptz not null default now(),
  expires_at   timestamptz,   -- null = lifetime / non-expiring
  updated_at   timestamptz not null default now()
);

-- The single place that answers "may this user watch paid content?"
-- security definer so it can read entitlements regardless of the caller's RLS.
create function has_pro(uid uuid) returns boolean
  language sql stable security definer as $$
    select exists (
      select 1 from entitlements
      where user_id = uid
        and entitlement = 'pro'
        and (expires_at is null or expires_at > now())
    );
  $$;

--------------------------------------------------------------------------------
-- UGC compliance — required by Apple guideline 1.2
--------------------------------------------------------------------------------
create table reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  lesson_id   uuid not null references lessons(id) on delete cascade,
  reason      text not null,
  created_at  timestamptz not null default now()
);

create table blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);


--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY
--------------------------------------------------------------------------------

alter table profiles      enable row level security;
alter table courses       enable row level security;
alter table lessons       enable row level security;
alter table likes         enable row level security;
alter table saves         enable row level security;
alter table follows       enable row level security;
alter table watch_events  enable row level security;
alter table entitlements  enable row level security;
alter table reports       enable row level security;
alter table blocks        enable row level security;

-- Anyone can read published lessons, minus blocked creators
create policy lessons_read_published on lessons for select
  using (
    published
    and not exists (
      select 1 from blocks
      where blocker_id = auth.uid() and blocked_id = lessons.creator_id
    )
  );

-- Creators manage only their own lessons
create policy lessons_write_own on lessons for all
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

create policy courses_read_published on courses for select using (published);
create policy courses_write_own on courses for all
  using (creator_id = auth.uid()) with check (creator_id = auth.uid());

create policy profiles_read_all on profiles for select using (true);
create policy profiles_write_own on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Engagement: you may only act as yourself
create policy likes_own on likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saves_own on saves for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy follows_own on follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- Entitlements are readable by their owner and writable by NOBODY via the API
create policy entitlements_read_own on entitlements for select
  using (user_id = auth.uid());
-- (no insert/update policy: only the service role, via the RevenueCat webhook)

create policy watch_insert on watch_events for insert
  with check (user_id = auth.uid() or user_id is null);
create policy reports_insert on reports for insert
  with check (reporter_id = auth.uid());
create policy blocks_own on blocks for all
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());


--------------------------------------------------------------------------------
-- COUNTER TRIGGER (keeps like_count honest)
--------------------------------------------------------------------------------
create function bump_like_count() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update lessons set like_count = like_count + 1 where id = new.lesson_id;
  elsif tg_op = 'DELETE' then
    update lessons set like_count = like_count - 1 where id = old.lesson_id;
  end if;
  return null;
end $$;

create trigger likes_count_trg after insert or delete on likes
  for each row execute function bump_like_count();


--------------------------------------------------------------------------------
-- STORAGE — resolves the "OPEN ISSUE" in schema.txt (public bucket = unrevokable
-- paid video). Implements the recommended fix: a public bucket for free feed
-- content, a private bucket for paid course content served only via a
-- signed URL from the `get-lesson-url` edge function.
--------------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('lessons-free', 'lessons-free', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('lessons-paid', 'lessons-paid', false)
on conflict (id) do nothing;

-- Anyone can read free lesson videos straight from the CDN.
create policy lessons_free_public_read on storage.objects for select
  using (bucket_id = 'lessons-free');

-- Creators upload/manage objects only inside their own "{creator_id}/..." folder,
-- in either bucket. Reading paid objects is NOT granted here — that only
-- happens through has_pro() inside the get-lesson-url edge function using the
-- service role, which bypasses storage RLS entirely.
create policy lesson_objects_owner_write on storage.objects for all
  using (
    bucket_id in ('lessons-free', 'lessons-paid')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('lessons-free', 'lessons-paid')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
