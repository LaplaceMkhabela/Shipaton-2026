# API Surface

Every data operation in the app. This is the contract between lanes — Lane A codes against these signatures while Lane B implements them.

There is **no backend server**. "Endpoints" are Supabase client calls wrapped in typed functions, plus two edge functions where the client can't be trusted. See [schema.txt](./schema.txt) for tables and RLS.

## Conventions

**Where code lives**

```
src/lib/supabase/          client, generated types, raw data functions
src/hooks/queries/         TanStack Query wrappers around those functions
supabase/functions/        edge functions (Deno)
```

Data functions are plain async functions that take arguments and return typed rows. Hooks wrap them for caching. Components only ever import hooks — never the Supabase client directly, so there's one place to change when a query needs fixing.

**Query keys**

```ts
['feed', cursor]              ['lesson', id]
['course', id]                ['creator', id]
['profile', 'me']             ['entitlement', 'me']
['saved', userId]             ['creator-stats', creatorId]
```

**Pagination is keyset, not offset.** `.range()` on an offset breaks when rows are inserted mid-scroll — the user sees a duplicate lesson, which in a video feed reads as a bug. Cursor on `created_at`.

**Errors.** Data functions throw; hooks surface `error`. Never swallow a Supabase error into an empty array — an empty feed and a failed feed look identical to the user and take an hour to debug.

**Auth.** RLS enforces access. These functions do not check permissions themselves; if a policy is missing, the fix goes in the migration, not in a `if (user.id === ...)` in the client.

---

## Reads

### `getFeed({ cursor, limit })` — Lane A/B
The hot path. Runs on every scroll.

```ts
getFeed(params: { cursor?: string; limit?: number }): Promise<FeedLesson[]>
```

Reads `lessons` joined to `profiles` for the creator overlay, and `courses` for the CTA card. Filters `published = true` and `access = 'free'` — paid lessons never appear in the feed, they live on course pages.

Returns `like_count` and `view_count` from the denormalised columns. Never counts rows.

Ordered `created_at desc`, cursor on the last item's `created_at`. Limit defaults to 10 — enough to preload ahead, small enough to stay fast.

**Gotcha:** must return enough to render the CTA card without a second query — `course_id`, course title, and lesson count come back in the same call. A per-item follow-up query for the CTA is a scroll-jank generator.

### `getLesson(id)` — Lane B
Single lesson for deep links and shares. Same shape as a feed item.

### `getCourse(id)` — Lane B
The funnel destination.

```ts
getCourse(id: string): Promise<CourseDetail>
```

Returns the course, its creator, and all its lessons ordered by `order_index`. Free lessons return a playable path; paid ones return metadata only — title, duration, thumbnail — with no video path. The lock state is derived client-side from `requires_pro` plus the user's entitlement.

**Gotcha:** paid lesson rows are *readable*; only the video is gated. Showing locked lessons is the point — it's what makes the paywall feel worth crossing.

### `getCreator(id)` — Lane B
Profile, their published lessons, their courses, and follower count. Backs `creator/[id]`.

### `searchLessons(q)` / `searchCreators(q)` — Lane B
`ilike` on title/topic and handle/display_name respectively. Postgres full-text search is better and not worth the time; revisit if search feels bad with real content.

### `getMyProfile()` — Lane B
Current user's `profiles` row. Returns null when signed out — the feed is browsable anonymously and this must not throw.

### `getMyEntitlement()` — Lane C
```ts
getMyEntitlement(): Promise<{ isPro: boolean; expiresAt: string | null }>
```

Reads the `entitlements` row for the current user. RevenueCat's `customerInfo` is the faster source for UI, but **this is the one that matters** — it's what the database gates content on. Where they disagree, the webhook hasn't landed yet.

### `getSavedLessons(userId)` — Lane B
Saved lessons for the profile tab. Joins `saves` to `lessons`.

### `getCreatorStats(creatorId)` — Lane C
The award-winning query. Aggregates `watch_events` per lesson:

```ts
{ lessonId, views, completions, ctaShown, ctaTapped, conversionRate }
```

`ctaTapped / ctaShown` is the funnel conversion rate — the number HAMM and the Growth Loop award both ask for on the submission form. Build this even if the creator dashboard is ugly.

---

## Writes

### `likeLesson(lessonId)` / `unlikeLesson(lessonId)` — Lane A
Insert/delete on `likes`. The trigger maintains `like_count`.

**Optimistic** — the heart fills instantly, rolls back on error. A like that waits on a round-trip feels broken.

### `saveLesson` / `unsaveLesson` — Lane A
Same pattern on `saves`.

### `followCreator(creatorId)` / `unfollowCreator` — Lane A
Same pattern on `follows`.

### `recordWatchEvent(...)` — Lane C
```ts
recordWatchEvent(e: {
  lessonId: string;
  watchedMs: number;
  completed: boolean;
  ctaShown: boolean;
  ctaTapped: boolean;
}): Promise<void>
```

Fire-and-forget on lesson exit. `user_id` is null when signed out — that's deliberate, anonymous scrolling is the top of the funnel and we need its data.

**Gotcha:** never `await` this in the scroll handler. Queue and flush; a analytics write must never delay the next video.

### `createLesson(...)` — Lane B
```ts
createLesson(input: {
  title: string; description?: string; topic?: string;
  courseId?: string | null; access: 'free' | 'paid';
  videoPath: string; durationSeconds: number; thumbnailUrl?: string;
}): Promise<Lesson>
```

Insert into `lessons` after the upload completes. `courseId` null is valid and common — a standalone top-of-funnel clip.

Duration is constrained to 90s in the database, so validate client-side too and give a real message rather than surfacing a constraint violation.

### `updateLesson(id, patch)` / `deleteLesson(id)` — Lane B
RLS restricts to own rows. Deleting should also remove the storage object — orphaned video files are the fastest way to blow through the free tier.

### `createCourse` / `updateCourse` / `publishCourse` — Lane B
`publishCourse` flips `published` and should refuse if the course has no lessons — an empty course reached from the feed is the worst thing a judge can find.

### `upsertProfile(patch)` — Lane B
Handle, display name, avatar, bio. Handle collisions surface as a unique-violation; catch and show "that handle is taken" rather than a raw Postgres error.

### `reportLesson({ lessonId, reason })` — Lane B
Apple guideline 1.2. Insert-only. Must be reachable from the feed in two taps — reviewers look for this.

### `blockUser(userId)` — Lane B
Insert into `blocks`. The feed read policy filters blocked creators automatically, so the feed just needs to refetch.

---

## Auth — Lane B

Thin wrappers over Supabase auth in `src/lib/supabase/auth.ts`.

```ts
signUp(email, password)   // then create the profiles row
signIn(email, password)
signOut()                 // must also call Purchases.logOut()
getSession()
onAuthStateChange(cb)
```

**Gotcha:** sign-in must call `Purchases.logIn(user.id)` and sign-out `Purchases.logOut()`. Skip it and one device's subscription follows the next person who signs in — a real bug, and an ugly one to find during judging.

---

## Storage — Lane B/C

### `uploadLessonVideo(file, onProgress)` — Lane B
```ts
uploadLessonVideo(file, onProgress?): Promise<{ path: string }>
```

Uploads to `lessons-free` or `lessons-paid` depending on the lesson's access. Returns the **object path**, not a URL — schema.txt stores paths so delivery can change without a data migration.

Show real progress. Video uploads on mobile data are slow and a spinner with no percentage feels frozen.

### `getLessonUrl(lessonId)` — Lane C · **edge function**
`supabase/functions/get-lesson-url`

The paywall's actual enforcement. For a free lesson, returns the public CDN URL. For a paid one, calls `has_pro(auth.uid())` and returns a **short-lived signed URL**, or 403.

This must be an edge function, not a client call. If the client could mint the URL, the paywall would be decoration — and HAMM is the category we're most likely to place in, so a walkable paywall is expensive.

---

## Webhook — Lane C

### `revenuecat-webhook` — **edge function**
`supabase/functions/revenuecat-webhook`

RevenueCat posts subscription events here. Verifies the shared secret, then upserts `entitlements` using the **service role** — the only writer, since the table has no insert/update policy.

Handles `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`. Cancellation is not expiry: a cancelled subscription keeps access until `expires_at`. Getting that wrong locks out paying users, which is the worst possible bug to ship to judges.

Must be idempotent — RevenueCat retries. Key on `rc_event_id`.

---

## Build order

1. `getFeed` against `src/lib/seed/` — unblocks Lane A immediately, no backend needed
2. Auth + `getMyProfile`
3. `getFeed` against real Supabase, `getCourse`, `getCreator`
4. `createLesson` + `uploadLessonVideo`
5. `revenuecat-webhook` + `getMyEntitlement`
6. `getLessonUrl` — the real gate
7. `recordWatchEvent` + `getCreatorStats` — the submission numbers
8. `reportLesson` + `blockUser` — before App Review, not after
