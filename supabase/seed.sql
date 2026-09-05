-- Shipaton 2026 — dev seed data
--
-- Mirrors src/lib/seed/lessons.ts and src/lib/seed/courses.ts exactly (same
-- ids, titles, counts) so the real Supabase backend renders the identical feed
-- the app already shows offline. When getFeed/getCourse are pointed at
-- Supabase instead of the local seed module (API.md build order step 3),
-- nothing on screen should change.
--
-- Run after 0001_init.sql. Safe to re-run — every insert is ON CONFLICT DO
-- NOTHING keyed on primary id.
--
-- FOR DEV/DEMO ONLY. This creates real auth.users rows with a shared
-- placeholder password so you can sign in as any seed creator locally.
-- Never point this at a production project.

create extension if not exists pgcrypto;

--------------------------------------------------------------------------------
-- Creators (auth.users + identities + profiles)
--------------------------------------------------------------------------------

do $$
declare
  seed_users jsonb := '[
    {"id":"00000000-0000-0000-0000-000000000001","email":"thandi@seed.dev","handle":"thandishoots","name":"Thandi Nkosi"},
    {"id":"00000000-0000-0000-0000-000000000002","email":"marco@seed.dev","handle":"marcocooks","name":"Marco Bianchi"},
    {"id":"00000000-0000-0000-0000-000000000003","email":"ayesha@seed.dev","handle":"ayeshafinance","name":"Ayesha Patel"},
    {"id":"00000000-0000-0000-0000-000000000004","email":"dave@seed.dev","handle":"davesixstrings","name":"Dave Mokoena"}
  ]';
  u jsonb;
begin
  for u in select * from jsonb_array_elements(seed_users)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      (u->>'id')::uuid,
      'authenticated',
      'authenticated',
      u->>'email',
      crypt('seed-password-123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      '', '', '', ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      (u->>'id')::uuid,
      u->>'id',
      jsonb_build_object('sub', u->>'id', 'email', u->>'email'),
      'email',
      now(), now(), now()
    )
    on conflict do nothing;

    insert into profiles (id, handle, display_name, is_creator)
    values ((u->>'id')::uuid, u->>'handle', u->>'name', true)
    on conflict (id) do nothing;
  end loop;
end $$;

--------------------------------------------------------------------------------
-- Courses — matches src/lib/seed/lessons.ts COURSES + courses.ts subtitles
--------------------------------------------------------------------------------

insert into courses (id, creator_id, title, subtitle, requires_pro, published) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001',
   'Phone Photography That Looks Expensive',
   'Stop blaming the camera. Start controlling the light.', true, true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002',
   'Knife Skills in One Weekend',
   'Faster prep, fewer cuts, better food.', true, true),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003',
   'Your First R10,000 Invested',
   'The boring plan that actually compounds.', true, true)
on conflict (id) do nothing;

--------------------------------------------------------------------------------
-- Free lessons — matches src/lib/seed/lessons.ts seedLessons exactly.
--
-- video_path stores the full playable URL (Google's public sample clips, same
-- ones used offline) rather than a storage object path. That's a deliberate
-- deviation for this seed only: no video files have actually been uploaded to
-- the `lessons-free` bucket yet, and storing a dead path would make the
-- Supabase-backed feed silently worse than the offline one. Replace with real
-- storage paths as creators upload real content.
--------------------------------------------------------------------------------

insert into lessons (
  id, creator_id, course_id, title, topic, video_path,
  duration_seconds, access, order_index, published, like_count, view_count
) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Why your photos look flat (and the one fix)', 'Photography',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
   48, 'free', 0, true, 1284, 21400),

  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000102',
   'Hold your knife like this, not like that', 'Cooking',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
   39, 'free', 0, true, 892, 15200),

  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000103',
   'Compound interest, explained with a jar', 'Money',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
   55, 'free', 0, true, 3410, 68900),

  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000004',
   null,
   'The only 4 chords you need this week', 'Guitar',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
   42, 'free', 0, true, 620, 9800),

  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Golden hour is a lie. Shoot at this time instead', 'Photography',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
   51, 'free', 1, true, 2145, 40300),

  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000102',
   'Salt earlier. Here is why it matters', 'Cooking',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
   36, 'free', 1, true, 1502, 27700),

  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000103',
   'Emergency fund before investing. Always', 'Money',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
   47, 'free', 1, true, 980, 18600),

  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000004',
   null,
   'Your strumming hand is too tense', 'Guitar',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
   44, 'free', 1, true, 733, 12100),

  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Portrait mode vs. actually moving closer', 'Photography',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
   53, 'free', 2, true, 1876, 33400),

  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000102',
   'A dull knife is the dangerous one', 'Cooking',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
   40, 'free', 2, true, 2290, 51800),

  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000103',
   'Fees eat more than you think', 'Money',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
   49, 'free', 2, true, 4102, 88200),

  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000004',
   null,
   'Practise slower than feels useful', 'Guitar',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
   38, 'free', 2, true, 545, 7400)
on conflict (id) do nothing;

-- All 12 rows above land with ~the same created_at (one seed transaction),
-- so `order by created_at desc` won't reproduce the intended l1..l12 feed
-- order. Stagger them a minute apart, newest = l1, so getFeed's real
-- ordering matches this file's reading order.
update lessons set created_at = now() - (
  case id
    when '00000000-0000-0000-0000-000000000201' then interval '0 minutes'
    when '00000000-0000-0000-0000-000000000202' then interval '1 minutes'
    when '00000000-0000-0000-0000-000000000203' then interval '2 minutes'
    when '00000000-0000-0000-0000-000000000204' then interval '3 minutes'
    when '00000000-0000-0000-0000-000000000205' then interval '4 minutes'
    when '00000000-0000-0000-0000-000000000206' then interval '5 minutes'
    when '00000000-0000-0000-0000-000000000207' then interval '6 minutes'
    when '00000000-0000-0000-0000-000000000208' then interval '7 minutes'
    when '00000000-0000-0000-0000-000000000209' then interval '8 minutes'
    when '00000000-0000-0000-0000-000000000210' then interval '9 minutes'
    when '00000000-0000-0000-0000-000000000211' then interval '10 minutes'
    when '00000000-0000-0000-0000-000000000212' then interval '11 minutes'
  end
)
where id in (
  '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000204',
  '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000206',
  '00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000208',
  '00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000210',
  '00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000212'
);

--------------------------------------------------------------------------------
-- Paid lessons — matches src/lib/seed/courses.ts long-form course content.
-- video_path is a storage path placeholder (no object uploaded); these rows
-- exist so course pages render real locked/paid rows, not to be playable yet.
--------------------------------------------------------------------------------

insert into lessons (
  id, creator_id, course_id, title, video_path,
  duration_seconds, access, order_index, published
) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Manual exposure without the fear',
   '00000000-0000-0000-0000-000000000001/manual-exposure.mp4', 552, 'paid', 3, true),

  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Editing: the three-slider method',
   '00000000-0000-0000-0000-000000000001/three-slider-edit.mp4', 760, 'paid', 4, true),

  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Reading light before you shoot',
   '00000000-0000-0000-0000-000000000001/reading-light.mp4', 485, 'paid', 5, true),

  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101',
   'Composition that survives cropping',
   '00000000-0000-0000-0000-000000000001/composition.mp4', 678, 'paid', 6, true),

  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000102',
   'The claw grip, drilled slowly',
   '00000000-0000-0000-0000-000000000002/claw-grip.mp4', 450, 'paid', 3, true),

  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000102',
   'Onions without tears or panic',
   '00000000-0000-0000-0000-000000000002/onions.mp4', 585, 'paid', 4, true),

  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000102',
   'Sharpening on a whetstone',
   '00000000-0000-0000-0000-000000000002/whetstone.mp4', 842, 'paid', 5, true),

  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000103',
   'Picking your first index fund',
   '00000000-0000-0000-0000-000000000003/index-fund.mp4', 800, 'paid', 3, true),

  ('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000103',
   'Tax-free accounts, plainly',
   '00000000-0000-0000-0000-000000000003/tax-free-accounts.mp4', 655, 'paid', 4, true),

  ('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000103',
   'What to do when the market drops',
   '00000000-0000-0000-0000-000000000003/market-drops.mp4', 520, 'paid', 5, true)
on conflict (id) do nothing;
