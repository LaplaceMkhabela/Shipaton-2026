# Design System

The visual language for the app. Lane A owns this file; changes to tokens are a team decision, not a personal preference.

We're targeting the **RevenueCat Design Award**, judged on "innovative design and aesthetic appeal/animations." That means the system has to be coherent and the motion has to be deliberate — not decorated.

## Principle: the video is the interface

Every pixel of chrome competes with the lesson. UI floats over full-bleed video, so:

- **Dark-first, and only dark.** No light mode. A light theme over video is a losing fight and a day we don't have.
- Chrome sits at the edges. The centre belongs to the teacher's face and the content.
- Nothing opaque covers video except the paywall and modals.
- Text over video **always** sits on a scrim. Never raw text on unknown pixels.

## Principle: colour encodes the funnel

This is the system's one big idea, and it's worth saying out loud in the demo video.

**Lime is free. Violet is paid.**

Every free lesson, free badge, and open-access affordance is lime. Every premium surface — locked lessons, the course CTA, the paywall, subscriber badges — is violet. A learner scrolling the feed builds an unconscious map of where the paid world begins, and the moment of conversion is a colour they already recognise.

Never use lime on a paid surface or violet on a free one. That inconsistency breaks the only thing making this system distinctive.

## Tokens

Drop into `src/constants/theme.ts`.

```ts
export const Colors = {
  // Surfaces — near-black, not pure black; pure black crushes video edges on OLED
  bg:        '#0A0A0B',
  surface:   '#141417',
  surfaceHi: '#1E1E23',
  border:    '#2A2A31',

  // Text
  text:      '#FFFFFF',
  textMuted: '#A1A1AA',
  textFaint: '#71717A',

  // Funnel
  free:      '#C6FF3D', // lime — free lessons, open access
  freeDim:   '#8FBF14',
  paid:      '#7C5CFF', // violet — courses, paywall, premium
  paidDim:   '#5B3FD6',

  // Status
  danger:    '#FF4D5E',
  success:   '#3DD68C',

  // Scrims over video
  scrimTop:    'rgba(10,10,11,0.55)',
  scrimBottom: 'rgba(10,10,11,0.85)',
} as const;

export const Type = {
  hero:    { fontSize: 32, lineHeight: 36, fontWeight: '800' },
  title:   { fontSize: 22, lineHeight: 27, fontWeight: '700' },
  body:    { fontSize: 16, lineHeight: 23, fontWeight: '500' },
  caption: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  micro:   { fontSize: 12, lineHeight: 15, fontWeight: '600' },
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const Radius = { sm: 8, md: 14, lg: 22, pill: 999 } as const;

export const Motion = {
  instant: 120,  // taps, toggles
  quick:   220,  // most transitions
  settle:  380,  // sheets, cards
  spring:  { damping: 18, stiffness: 220, mass: 0.9 },
} as const;
```

**Type:** system font (SF Pro on iOS). Custom fonts cost load time and a build step for a gain nobody scores. Weight and size carry the hierarchy — headings are heavy and tight, body is medium.

**Numbers** (view counts, durations, prices) use `fontVariant: ['tabular-nums']` so they don't jitter as they tick.

## Components

### Feed item
Full-bleed video. Top scrim ~120px, bottom scrim ~280px. Bottom-left: creator handle, lesson title (2 lines max, truncated), topic pill. Right rail: like, save, share, stacked vertically with counts in `micro` beneath each.

A thin lime progress bar sits flush at the very bottom — 2px, no track, full-width, driven by `timeUpdate`.

### Course CTA card
The funnel's hinge, and the most important component in the app.

Appears over the bottom-left of a lesson that belongs to a course. Violet-bordered, `surfaceHi` fill at 92% opacity, `Radius.lg`. Shows course title, lesson count, and price. It should feel like an invitation, not an ad.

It does **not** appear instantly. It slides up and fades in at ~60% through the lesson — after the viewer has been given something, never before. That timing is the product thesis in one interaction, and it's worth calling out to judges.

### Paywall
The only full-opacity screen. Violet gradient wash over `bg`. Course hero, three outcome bullets (what you'll be able to do, not what's included), price, primary CTA, restore-purchases as quiet text. Free lessons already watched are listed with lime checkmarks — proof of value already delivered.

### Buttons
- **Primary (paid action):** violet fill, white text, `Radius.pill`, 52px tall
- **Primary (free action):** lime fill, `#0A0A0B` text — dark text on lime, never white
- **Secondary:** transparent, 1px `border`, white text
- **Tap targets never below 44×44**, regardless of visual size

## Motion

Three signature moments carry the Design award. Everything else stays quiet.

1. **Scroll-to-play.** As a lesson snaps into place it scales `0.96 → 1.0` while the outgoing one dims to 40% opacity. Makes a hard pager snap feel like physical momentum.
2. **CTA card entrance.** At 60% progress the card springs up from 24px below with a fade. `Motion.spring`. This is the funnel moment — it should feel like an offer, not a popup.
3. **Purchase confirmation.** Lime-to-violet radial sweep from the button, resolving into the unlocked course. The colour system literally completing itself: free becomes paid.

Rules: nothing animates longer than 400ms. Nothing bounces more than once. Use Reanimated on the UI thread — a dropped frame in a video feed is worse than no animation at all. Honour `prefers-reduced-motion` by cutting to end states.

## Accessibility

Not optional, and Apple checks some of it:

- Text over video sits on a scrim — verify 4.5:1 against the darkest scrim point
- Lime on `bg` passes for large text only; never lime body copy on dark
- Every icon button carries `accessibilityLabel`; icon-only controls are invisible to VoiceOver otherwise
- Captions/subtitles on lessons where possible — most feed viewing is muted, so this is a retention feature as much as an accessibility one
- Respect reduced-motion

## Non-goals

- No light mode
- No custom font
- No component library — hand-rolled components against these tokens
- No gradient-heavy or glassmorphic chrome; the video supplies the visual richness
