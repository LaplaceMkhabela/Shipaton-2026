@AGENTS.md

# Shipaton 2026

A short-form video app for learning: a vertical feed of byte-sized lessons that funnels viewers from free clips into course creators' paid courses.

Hackathon entry. **Ships to the App Store by 30 Sept 2026.**

- [PLAN.md](./PLAN.md) — schedule, lane ownership, risks
- [API.md](./API.md) — every data operation; the contract between lanes
- [schema.txt](./schema.txt) — tables and RLS policies
- [revenuecat.txt](./revenuecat.txt) — monetization model
- [DESIGN.md](./DESIGN.md) — visual system

## Hard constraints

- **Expo SDK 57 / React Native 0.86 / React 19.2.** APIs changed. Read https://docs.expo.dev/versions/v57.0.0/ before writing against any Expo module — do not write from memory.
- **`expo-video`, never `expo-av`.** `useVideoPlayer(source, setup)` + `<VideoView player={...} />`. Player events come from `useEvent`/`useEventListener` imported from `expo`.
- **iOS only** for the hackathon window. Don't spend time on Android-specific paths.
- **No Expo Go.** RevenueCat, OneSignal, and Layers are native modules; everything runs on an EAS development build.
- **`main` must stay TestFlight-able.** A broken `main` is the team's only priority until it's fixed.

## Layout

```
src/app/
  _layout.tsx       root stack + providers, dark theme
  (tabs)/           index=feed, search, create, profile
  (auth)/           sign-in
  course/[id]       funnel destination
  creator/[id]
  paywall/[courseId]  modal
src/components/feed/     Lane A: pager, player, CTA card, action rail
src/components/creator/  Lane B: upload form, lesson rows
src/components/ui/       shared primitives
src/constants/theme.ts   design tokens, see DESIGN.md
src/hooks/queries/       TanStack Query hooks
src/lib/supabase/        client + generated types
src/lib/purchases/       RevenueCat
src/lib/growth/          OneSignal, Layers, analytics
src/lib/seed/            seed lessons — lets the feed run with no backend
src/providers/           app-wide context providers
supabase/migrations/     schema + RLS
supabase/functions/      get-lesson-url, revenuecat-webhook
```

Routes are placeholders using `<Placeholder>` from `src/components/ui/placeholder.tsx`. Delete each usage as the real screen lands.

`@/*` maps to `src/*`. `@/assets/*` maps to `assets/*`.

## Conventions

- **Types come from Supabase.** `src/lib/supabase/types.ts` is generated. Never hand-write a `Lesson` or `Course` type.
- **Server state is TanStack Query. Client state is Zustand.** Don't put server data in Zustand.
- **Styling is `StyleSheet` + tokens** from `src/constants/theme.ts`. No inline hex, no magic spacing numbers, no NativeWind.
- Files kebab-case, components PascalCase, hooks `use-*.ts`.
- Reanimated for animation, on the UI thread. A dropped frame in a video feed is worse than no animation.

## Rules

- **Stay in your lane's directories.** Cross-lane needs go through the shared contract (schema + generated types + seed data), not by editing another lane's files.
- **Native modules degrade, never crash.** RevenueCat/OneSignal/Layers must be behind a capability check so the app still runs where the module is unavailable.
- **UGC compliance is not optional.** Report, block, EULA, and moderation must stay wired up — Apple rejects under guideline 1.2 without them, and a rejection near the deadline is fatal.
- Don't add dependencies that require new build config without raising it first. A broken native build costs a day we don't have.
- Don't refactor across lanes mid-week. Ship first.

## Verification

```bash
npx tsc --noEmit      # must be clean before merging
npx expo config       # app config resolves
npm start             # Metro; also generates .expo/types
```

`expo-env.d.ts` and `.expo/types/` are gitignored and generated — a fresh clone needs `npm install` plus one Metro start before `tsc` passes.
