# Project Plan — Shipaton 2026

> **Deadline: Wed 30 Sept 2026, 11:45pm PDT.**
>
> **Primary route: Next Gen Award — no app store required.** We have a student on
> the team, and the rules state plainly: *"No paid Apple or Google developer
> account or store release is required."* A public open-source repo and a demo
> video are the deliverable. This removes App Review from the critical path
> entirely.
>
> **Secondary route: Samsung Galaxy Store — free to join, free to publish.**
> Unlocks the store-dependent categories. Nice to have, not load-bearing.
>
> We are **not** shipping to Apple. The $99 developer programme is out of budget,
> and nothing about the plan depends on it any more.

## Context

We're building a short-form video app for learning: a vertical feed of byte-sized lessons that funnels viewers from free clips into course creators' paid courses. This document covers the stack, the schedule, how three people split the work without colliding, and the risks that actually kill hackathon entries.

See [DESIGN.md](./DESIGN.md) for the visual system and [CLAUDE.md](./CLAUDE.md) for engineering rules.

## The one thing that matters

With Next Gen as the primary route, the thing that scores is a **working app plus a convincing demo video** — not a store listing. Judges assess "meaningful progress toward a working app" and "thoughtful use of RevenueCat," so a running Android build we can screen-record is the deliverable.

**Hard gate: a recordable end-to-end build by Sat 19 Sept.** That leaves eleven days to cut the video, write the submission, and — if Samsung comes through — publish there too.

Three things must be demonstrably working on camera: the feed, the funnel into a course, and a RevenueCat purchase. Everything else is optional.

## Target categories

Judges penalise apps jammed into every category. We commit to these, in priority order:

| Category | Prize | Why us | Cost |
|---|---|---|---|
| **Next Gen** (students only) | $20k | **Primary.** No store release required. Needs a student email on the Devpost account, a public repo with a visible open-source licence, and a demo video. We already have the repo and the MIT licence. | Free |
| **HAMM** (smartest monetization) | $20k | The app *is* a monetization funnel. Strongest natural fit. | Free — it's the core concept |
| **Growth Loop** (Layers) | $15k | Free lesson → paid course → creator posts more free lessons is a textbook loop. | Layers SDK + documented experiment |
| **Keep Them Coming Back** (OneSignal) | $25k | "Your next lesson is ready" is a real retention hook for learning. | OneSignal SDK + campaign design |
| **RevenueCat Design** | $20k | Rewards feed polish we need anyway. | Free — byproduct of doing it well |
| **#BuildInPublic** | $30k | Costs only social posts, starting today. | ~10 min/day |

**Cut order if time slips:** Layers first, then OneSignal, then the Samsung listing. Never cut Next Gen or HAMM — both are free and Next Gen is the entry that doesn't depend on anyone else's approval queue.

**Store-dependent categories** (Grand Prize, Design, Growth Loop, OneSignal) require a live Galaxy Store listing. Next Gen does not. If Samsung's review or seller verification stalls, we still have a complete entry.

Every category needs its own answer in the DevPost submission. Assign these to the Ship Captain on day 1, not on 30 Sept.

## Stack

Already scaffolded: Expo SDK 57, React Native 0.86, React 19.2, expo-router, TypeScript strict.

| Concern | Choice | Note |
|---|---|---|
| Platform | **Android** | Galaxy Store target. EAS builds it in the cloud, free. |
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

**Platform is now Android, not iOS.** Samsung Galaxy Store ships Android, and EAS builds Android in the cloud with no Mac and no paid account. Everything already written is cross-platform; the tab bar and video player need checking on Android, and the SF Symbols tab icons need Android equivalents (`md` prop alongside `sf`).

**Expo Go is dead to us once RevenueCat lands.** It's a native module. Until then Expo Go on an Android phone is a legitimate way to test the feed — see the testing notes. After that, an **EAS development build**, which is free and needs no store account.

## Schedule

| Milestone | Date | Definition of done |
|---|---|---|
| **M0 — Rails** | Sun 7 Sept | Supabase project live (#1), Samsung seller account registered, RevenueCat account + products, **EAS dev build running on a real Android phone** |
| **M1 — Vertical slice** | Fri 11 Sept | Feed plays seeded lessons smoothly on device, auth works, paywall gates a course via a real RevenueCat entitlement |
| **M2 — Full loop** | Wed 16 Sept | Creator upload, OneSignal campaign, Layers events, analytics |
| **M3 — Recordable build** | **Sat 19 Sept** | 30+ real lessons seeded, animations landed, no new features. The whole funnel demonstrable on camera. |
| **M4 — Demo video + repo polish** | Wed 23 Sept | Under 2 min, states the app and target categories in the first 30s. README explains how to run it — Next Gen judges read the repo. |
| **M5 — DevPost** | Fri 25 Sept | Submitted from the **student's** Devpost account with a qualifying academic email, all category answers written |
| **M6 — Galaxy Store** | if it lands | Bonus. Unlocks store-dependent categories; nothing depends on it. |

M5 is deliberately 5 days early. Treat 30 Sept as fiction.

**The Devpost account must be the student's**, with an academic email — eligibility is checked against the email domain. Submitting from the wrong account forfeits Next Gen, which is now our primary entry.

### Why content is a milestone

A scrolling video app with eight demo clips looks broken. Judges scroll. **30+ genuinely watchable lessons** is a real deliverable, not an afterthought — and it's non-code work that parallelises well. Start recording during M1, not M3.

## Work distribution — 3 lanes

Each lane owns directories. Cross-lane changes go through the contract, not by editing someone else's files.

### Lane A — Feed & Experience
**Owns:** `src/app/(tabs)/`, `src/components/feed/`, `src/components/ui/`, `src/constants/theme.ts`

The product's soul. Vertical pager, `expo-video` player lifecycle (only the active item plays, neighbours preload), gesture handling, like/save, creator overlay, the course CTA card, and every animation in DESIGN.md. Owns the Design award.

### Lane B — Backend & Creator
**Owns:** `supabase/`, `src/lib/supabase/`, `src/app/(auth)/`, `src/app/(tabs)/create.tsx`, `src/components/creator/`, `src/hooks/queries/`

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
| R1 | **Repo isn't judgeable** | Next Gen judges read the repository. It must have a visible open-source licence (MIT, already at root), all source and assets, and a README explaining how to run it. Currently the README describes the product but not how to build it — fix before M4. |
| R2 | **Samsung commercial-seller verification stalls** | Selling in-app on Galaxy Store may need a D-U-N-S number and bank verification, up to 10 business days each. Mitigation: publish the app free and put the RevenueCat purchase through **Web Billing**, which the rules accept ("in-app **or web** purchase"). Doesn't block Next Gen either way. |
| R3 | **Janky playback kills the Design award** | Cap uploads at 60s/720p, preload ±1 video, show a thumbnail poster while loading. If it's still rough after M1, escalate to Cloudflare Stream for HLS — budget one day. |
| R4 | **Empty-feed demo** | Content is milestone M3. Start recording in M1. |
| R5 | **RevenueCat only works in a dev build** | EAS dev build on day 1 — free, no store account. Guard the SDK behind a capability check so the app degrades instead of crashing. |
| R6 | **Judges can't try the paid tier** | For Next Gen they run it from the repo, so the README must document how to reach the paywall. If we do publish to Samsung, add a promo code or free trial. |
| R8 | **UGC moderation** | No longer an App Review gate, but report/block/EULA stay in — they're cheap, and "thoughtful product care" is an explicit Next Gen judging criterion. |
| R7 | **Over-targeting categories** | Five is already the ceiling. Cut per the order above rather than adding. |

## Immediate next actions

1. **Create the Devpost account using the student's academic email** — this is what makes Next Gen possible, and it costs nothing
2. Decide the app name
3. Finish issue #1 (Supabase) — auth is written but has never run against a real backend
4. Get an EAS dev build onto a physical Android phone (free, no store account)
5. Register the free Samsung Seller Portal account
6. Post the first #BuildInPublic update
