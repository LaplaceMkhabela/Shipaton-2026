/**
 * Seed course detail, shaped like the `getCourse` response in API.md.
 *
 * Note what paid lessons carry and don't: title, duration and access come
 * back, but never a video path. Rows are readable; the video is gated. That
 * mirrors the real RLS behaviour in schema.txt, so the UI is built against the
 * shape it will actually receive rather than one it has to be stripped down to
 * later.
 *
 * Structure mirrors the course-structure JSON each creator keeps in the shared
 * Drive folder. Free lessons are the ones already in the feed; paid lessons
 * are the rest of the module outline.
 */

import { COURSES, CREATORS, type SeedCreator } from './lessons';

export type CourseLesson = {
  id: string;
  title: string;
  durationLabel: string;
  access: 'free' | 'paid';
  /** Free lessons the viewer already watched in the feed. */
  watched: boolean;
};

export type CourseDetail = {
  id: string;
  title: string;
  subtitle: string;
  creator: SeedCreator;
  lessonCount: number;
  totalLabel: string;
  requiresPro: boolean;
  lessons: CourseLesson[];
};

export const seedCourses: Record<string, CourseDetail> = {
  [COURSES.calc.id]: {
    id: COURSES.calc.id,
    title: COURSES.calc.title,
    subtitle:
      'A clear, visual introduction to the core ideas of calculus: limits, derivatives, and integrals. Build intuition before formulas.',
    creator: CREATORS.voss,
    lessonCount: 30,
    totalLabel: '2h',
    requiresPro: true,
    lessons: [
      { id: 'cl1', title: 'What is a Limit?', durationLabel: '45s', access: 'free', watched: true },
      { id: 'cl2', title: 'One-Sided Limits', durationLabel: '50s', access: 'free', watched: true },
      { id: 'cl3', title: 'Limit Notation', durationLabel: '35s', access: 'free', watched: false },
      { id: 'cl4', title: 'Computing Limits Algebraically', durationLabel: '1m', access: 'free', watched: false },
      { id: 'cl5', title: 'Limits at Infinity', durationLabel: '55s', access: 'free', watched: false },
      { id: 'cl6', title: 'Infinite Limits', durationLabel: '50s', access: 'free', watched: false },
      { id: 'cl7', title: 'Continuity Defined', durationLabel: '45s', access: 'free', watched: false },
      { id: 'cl8', title: 'Types of Discontinuities', durationLabel: '55s', access: 'free', watched: false },
      { id: 'cl9', title: 'Intermediate Value Theorem', durationLabel: '1m', access: 'free', watched: false },
      { id: 'cl10', title: 'Limit & Continuity Summary', durationLabel: '40s', access: 'free', watched: false },
      { id: 'clp1', title: 'Tangent Lines & Slope', durationLabel: '6m 20s', access: 'paid', watched: false },
      { id: 'clp2', title: 'Definition of the Derivative', durationLabel: '7m 05s', access: 'paid', watched: false },
      { id: 'clp3', title: 'Power Rule', durationLabel: '4m 50s', access: 'paid', watched: false },
      { id: 'clp4', title: 'Chain Rule', durationLabel: '8m 15s', access: 'paid', watched: false },
      { id: 'clp5', title: 'Riemann Sums', durationLabel: '6m 40s', access: 'paid', watched: false },
      { id: 'clp6', title: 'The Fundamental Theorem', durationLabel: '7m 30s', access: 'paid', watched: false },
      { id: 'clp7', title: 'u-Substitution', durationLabel: '5m 55s', access: 'paid', watched: false },
      { id: 'clp8', title: 'Area Between Curves', durationLabel: '6m 10s', access: 'paid', watched: false },
    ],
  },

  [COURSES.piano.id]: {
    id: COURSES.piano.id,
    title: COURSES.piano.title,
    subtitle:
      'A rapid-fire, micro-drill introduction to the piano — keyboard geography, rhythm, and hand independence to play your first two-handed melody.',
    creator: CREATORS.keys,
    lessonCount: 24,
    totalLabel: '2h',
    requiresPro: true,
    lessons: [
      { id: 'pn1', title: 'Welcome to Piano', durationLabel: '1m 30s', access: 'free', watched: true },
      { id: 'pn2', title: 'Understanding the Keyboard', durationLabel: '1m 30s', access: 'free', watched: true },
      { id: 'pn3', title: 'Finding Middle C', durationLabel: '1m 15s', access: 'free', watched: false },
      { id: 'pn4', title: 'Finger Numbers', durationLabel: '1m 10s', access: 'free', watched: false },
      { id: 'pn5', title: 'Rhythm', durationLabel: '1m 20s', access: 'free', watched: false },
      { id: 'pn6', title: 'Notes', durationLabel: '1m', access: 'free', watched: false },
      { id: 'pn7', title: 'Chords', durationLabel: '1m 15s', access: 'free', watched: false },
      { id: 'pn8', title: 'Scales', durationLabel: '1m 30s', access: 'free', watched: false },
      { id: 'pn9', title: 'Playing Simple Music', durationLabel: '1m 35s', access: 'free', watched: false },
      { id: 'pnp1', title: 'Melody Phrase 1: The Start', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp2', title: 'Melody Phrase 2: The Descent', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp3', title: 'The Turnaround', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp4', title: 'Melody Fluidity', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp5', title: 'Finding the Bass', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp6', title: 'The Anchor Note', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp7', title: 'Rhythm Matching', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp8', title: 'The Drop', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp9', title: 'Measure 1 Together', durationLabel: '5m', access: 'paid', watched: false },
      { id: 'pnp10', title: 'Finding the Flow', durationLabel: '5m', access: 'paid', watched: false },
    ],
  },

  [COURSES.money.id]: {
    id: COURSES.money.id,
    title: COURSES.money.title,
    subtitle: 'Pay yourself first, automate the system, and let compound interest do the heavy lifting.',
    creator: CREATORS.vance,
    lessonCount: 15,
    totalLabel: '7m',
    requiresPro: true,
    lessons: [
      { id: 'm1', title: 'Write Your Savings Goal', durationLabel: '30s', access: 'free', watched: true },
      { id: 'm2', title: 'Micro-Savings', durationLabel: '30s', access: 'free', watched: true },
      { id: 'm3', title: 'Gamify Your Savings', durationLabel: '30s', access: 'free', watched: false },
      { id: 'm4', title: 'Automate Your Savings', durationLabel: '30s', access: 'free', watched: false },
      { id: 'm5', title: 'Emergency Fund Shield', durationLabel: '30s', access: 'free', watched: false },
      { id: 'm6', title: 'High-Yield Savings', durationLabel: '30s', access: 'free', watched: false },
      { id: 'm7', title: 'Automate Wealth Buckets', durationLabel: '30s', access: 'free', watched: false },
      { id: 'm8', title: 'Compound Interest', durationLabel: '30s', access: 'free', watched: false },
      { id: 'm9', title: 'Audit Your Expenses', durationLabel: '30s', access: 'free', watched: false },
      { id: 'mp1', title: 'Needs vs. Wants in the Digital Age', durationLabel: '30s', access: 'paid', watched: false },
      { id: 'mp2', title: 'Community Savings', durationLabel: '30s', access: 'paid', watched: false },
      { id: 'mp3', title: 'Lifestyle Creep', durationLabel: '30s', access: 'paid', watched: false },
      { id: 'mp4', title: 'Debt Management', durationLabel: '30s', access: 'paid', watched: false },
      { id: 'mp5', title: 'Smart Spending & Bulk Buying', durationLabel: '30s', access: 'paid', watched: false },
      { id: 'mp6', title: 'The 24-Hour Rule', durationLabel: '30s', access: 'paid', watched: false },
    ],
  },
};

export function getSeedCourse(id: string): CourseDetail | null {
  return seedCourses[id] ?? null;
}