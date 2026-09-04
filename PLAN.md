# Project Plan — Shipaton 2026

> **Deadline: Wed 30 Sept 2026, 11:45pm PDT. Today is Fri 4 Sept. 26 days.**
> The app must be **fully published** on the App Store by then — "in review" does not count.

## Context

We're building a short-form video app for learning: a vertical feed of byte-sized lessons that funnels viewers from free clips into course creators' paid courses. This document covers the stack, the schedule, how three people split the work without colliding, and the risks that actually kill hackathon entries.

See [DESIGN.md](./DESIGN.md) for the visual system and [CLAUDE.md](./CLAUDE.md) for engineering rules.

## The one thing that matters

Most Shipaton entries fail on **shipping**, not on code. An unpublished app scores zero regardless of quality. Everything below is arranged so that a working build reaches TestFlight on **day 2**, and every subsequent day ends with `main` still shippable.

**Hard gate: submit to App Review by Sun 20 Sept.** That leaves 10 days of buffer for rejection and resubmission. Apple review is usually 24–48h, but a rejection on 28 Sept with no buffer ends the run.

## Target categories

Judges penalise apps jammed into every category. We commit to these, in priority order:

| Category | Prize | Why us | Cost |
|---|---|---|---|
| **HAMM** (smartest monetization) | $20k | The app *is* a monetization funnel. Strongest natural fit. | Free — it's the core concept |
| **Growth Loop** (Layers) | $15k | Free lesson → paid course → creator posts more free lessons is a textbook loop. | Layers SDK + documented experiment |
| **Keep Them Coming Back** (OneSignal) | $25k | "Your next lesson is ready" is a real retention hook for learning. | OneSignal SDK + campaign design |
| **RevenueCat Design** | $20k | Rewards feed polish we need anyway. | Free — byproduct of doing it well |
| **#BuildInPublic** | $30k | Costs only social posts, starting today. | ~10 min/day |

**Cut order if time slips:** Layers first, then OneSignal. Never cut HAMM — it's free.

Every category needs its own answer in the DevPost submission. Assign these to the Ship Captain on day 1, not on 30 Sept.

## Stack

Already scaffolded: Expo SDK 57, React Native 0.86, React 19.2, expo-router, TypeScript strict.

| Concern | Choice | Note |
|---|---|---|
| Video playback | `expo-video` | SDK 57 API: `useVideoPlayer` + `<VideoView>`. Not `expo-av`. |
| Backend | Supabase | Postgres + Auth + Storage + RLS in one |
| Video storage | Supabase Storage | MP4, 720p, `faststart`, hard 60s cap. See risk R3. |
| Payments | RevenueCat (`react-native-purchases`) | Mandatory for eligibility |
| Push | OneSignal (`onesignal-expo-plugin`) | Category target |
| Growth | Layers SDK | Category target |
| Server state | TanStack Query | Caching, pagination, optimistic likes |
| Client state | Zustand | Session, playback, feed position |
| Animation | `react-native-reanimated` | Already installed |
| Styling | `StyleSheet` + tokens in `src/constants/theme.ts` | No NativeWind — new build config is risk we don't need |
| Builds | EAS Build + TestFlight | Dev build required from day 1 |

**Expo Go is dead to us.** RevenueCat, OneSignal, and Layers are native modules. Everyone runs an **EAS development build** on a real device from day 1. Do not waste a week building against Expo Go and discover this later.

## Schedule

| Milestone | Date | Definition of done |
|---|---|---|
| **M0 — Ship rails** | Sat 5 Sept | Apple account live, bundle ID + App Store Connect record created, RevenueCat products configured, Supabase project up, EAS dev build on a real device, **template app on TestFlight** |
| **M1 — Vertical slice** | Fri 11 Sept | Feed plays seeded lessons smoothly, auth works, paywall gates a course via a real RevenueCat entitlement |
| **M2 — Full loop** | Wed 16 Sept | Creator upload, course page, OneSignal campaign, Layers events, analytics |
| **M3 — Content + polish freeze** | Sat 19 Sept | 30+ real lessons seeded, animations landed, store assets done, no new features |
| **M4 — Submit to Apple** | **Sun 20 Sept** | Binary in App Review |
| **M5 — DevPost** | Fri 25 Sept | Video + description + all category answers submitted, 5 days early |

M5 is deliberately 5 days before the real deadline. Treat 30 Sept as fiction.

### Why content is a milestone

A scrolling video app with eight demo clips looks broken. Judges scroll. **30+ genuinely watchable lessons** is a real deliverable, not an afterthought — and it's non-code work that parallelises well. Start recording during M1, not M3.

## Work distribution — 3 lanes

Each lane owns directories. Cross-lane changes go through the contract, not by editing someone else's files.

### Lane A — Feed & Experience
**Owns:** `src/app/(feed)/`, `src/components/feed/`, `src/components/ui/`, `src/constants/theme.ts`

The product's soul. Vertical pager, `expo-video` player lifecycle (only the active item plays, neighbours preload), gesture handling, like/save, creator overlay, the course CTA card, and every animation in DESIGN.md. Owns the Design award.

### Lane B — Backend & Creator
**Owns:** `supabase/`, `src/lib/supabase/`, `src/app/(creator)/`, `src/hooks/queries/`

Schema, RLS policies, migrations, auth, the upload pipeline (pick → compress → upload → row), course/lesson CRUD, creator dashboard. Owns the seed dataset that unblocks Lane A.

### Lane C — Monetization, Growth & Ship
**Owns:** `src/lib/purchases/`, `src/lib/growth/`, `src/app/paywall/`, EAS config, App Store Connect

RevenueCat init/offerings/entitlements/restore, paywall screen, OneSignal, Layers, analytics. **Also the Ship Captain** — owns the Apple account, every build, store assets, the demo video, and the DevPost submission with all five category answers.

The Ship Captain role is the one teams neglect and the one that decides whether you place at all. It is not a part-time duty in the final week; it is a lane.

### Collapsing to 2 people
Merge A + the design half of C (one person owns everything the judge sees); B takes backend, creator, and the RevenueCat plumbing. **Ship Captain still gets named explicitly** and gets ~30% of one person's time reserved for it.

### Day-1 contract, before anyone writes a feature

Lanes only parallelise if the seams are fixed first. Together, in one sitting on day 1:

1. **The schema** — `profiles`, `creators`, `courses`, `lessons`, `likes`, `follows`, `watch_events`, `purchases`. Written as a migration in `supabase/migrations/`.
2. **Shared types** — generated from Supabase into `src/lib/supabase/types.ts`. Single source of truth; nobody hand-writes a `Lesson` type.
3. **Seed data** — `src/lib/seed/lessons.ts`, 20 lessons with real video URLs. Lane A builds the entire feed against this without waiting for Lane B.
4. **The app name** — needed for App Store Connect on day 1, which blocks everything else in M0.

### Git workflow

- Short-lived branches: `feed/…`, `backend/…`, `growth/…`
- **Merge to `main` daily.** Long-lived branches are how 3-person hackathon teams lose a day to conflicts.
- `main` must stay TestFlight-able at all times. If `main` is broken, that is the only thing anyone works on.
- Ship Captain cuts a TestFlight build every evening. Daily builds catch native-module breakage while it's still cheap.

## Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **App Review rejection near the deadline** | Submit 20 Sept. UGC apps get scrutiny — see R2. |
| R2 | **Apple 1.2 (UGC) rejection** | Apps with user uploads *must* ship: a report button, a block-user action, a EULA, and moderation. Non-negotiable, and cheap if built in M2. Apple rejects for this routinely. |
| R3 | **Janky playback kills the Design award** | Cap uploads at 60s/720p, preload ±1 video, show a thumbnail poster while loading. If it's still rough after M1, escalate to Cloudflare Stream for HLS — budget one day. |
| R4 | **Empty-feed demo** | Content is milestone M3. Start recording in M1. |
| R5 | **RevenueCat only works in a dev build** | EAS dev build on day 1. Guard the SDK behind a capability check so the app degrades instead of crashing. |
| R6 | **Judges can't test the paid tier** | Submission requires a promo code or free trial granting full premium access. Configure in App Store Connect during M3. |
| R7 | **Over-targeting categories** | Five is already the ceiling. Cut per the order above rather than adding. |

## Immediate next actions

1. Decide the app name — blocks App Store Connect, which blocks everything
2. Buy/confirm the Apple Developer account today
3. Create the App Store Connect record and bundle ID
4. Write the schema migration and seed dataset together
5. Get an EAS dev build onto a physical device
6. Post the first #BuildInPublic update
