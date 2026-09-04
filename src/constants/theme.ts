/**
 * Design tokens. See DESIGN.md for the reasoning behind them.
 *
 * Dark-only by design: the video is the interface, and a light theme over
 * full-bleed video is a fight we don't need to have.
 *
 * The one rule worth remembering: colour encodes the funnel.
 * `free` (lime) marks open content, `paid` (violet) marks premium surfaces.
 * Never cross them.
 */

export const Colors = {
  // Surfaces — near-black, not pure black; pure black crushes video edges on OLED
  bg: '#0A0A0B',
  surface: '#141417',
  surfaceHi: '#1E1E23',
  border: '#2A2A31',

  // Text
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  textFaint: '#71717A',

  // Funnel
  free: '#C6FF3D',
  freeDim: '#8FBF14',
  paid: '#7C5CFF',
  paidDim: '#5B3FD6',

  // Status
  danger: '#FF4D5E',
  success: '#3DD68C',

  // Scrims over video
  scrimTop: 'rgba(10,10,11,0.55)',
  scrimBottom: 'rgba(10,10,11,0.85)',
} as const;

export const Type = {
  hero: { fontSize: 32, lineHeight: 36, fontWeight: '800' },
  title: { fontSize: 22, lineHeight: 27, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '500' },
  caption: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  micro: { fontSize: 12, lineHeight: 15, fontWeight: '600' },
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const Radius = { sm: 8, md: 14, lg: 22, pill: 999 } as const;

export const Motion = {
  instant: 120,
  quick: 220,
  settle: 380,
  spring: { damping: 18, stiffness: 220, mass: 0.9 },
} as const;

/** Minimum touch target, per Apple HIG. Never go below this. */
export const MinTouchTarget = 44;

/** Counts and durations use tabular figures so they don't jitter as they tick. */
export const TabularNums = { fontVariant: ['tabular-nums' as const] };
