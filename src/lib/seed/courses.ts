/**
 * Seed course detail, shaped like the `getCourse` response in API.md.
 *
 * Note what paid lessons carry and don't: title, duration and access come
 * back, but never a video path. Rows are readable; the video is gated. That
 * mirrors the real RLS behaviour in schema.txt, so the UI is built against the
 * shape it will actually receive rather than one it has to be stripped down to
 * later.
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
  [COURSES.photo.id]: {
    id: COURSES.photo.id,
    title: COURSES.photo.title,
    subtitle: 'Stop blaming the camera. Start controlling the light.',
    creator: CREATORS.thandi,
    lessonCount: 14,
    totalLabel: '2h 10m',
    requiresPro: true,
    lessons: [
      { id: 'l1', title: 'Why your photos look flat', durationLabel: '48s', access: 'free', watched: true },
      { id: 'l5', title: 'Golden hour is a lie', durationLabel: '51s', access: 'free', watched: true },
      { id: 'l9', title: 'Portrait mode vs. moving closer', durationLabel: '53s', access: 'free', watched: true },
      { id: 'p1', title: 'Manual exposure without the fear', durationLabel: '9m 12s', access: 'paid', watched: false },
      { id: 'p2', title: 'Editing: the three-slider method', durationLabel: '12m 40s', access: 'paid', watched: false },
      { id: 'p3', title: 'Reading light before you shoot', durationLabel: '8m 05s', access: 'paid', watched: false },
      { id: 'p4', title: 'Composition that survives cropping', durationLabel: '11m 18s', access: 'paid', watched: false },
    ],
  },

  [COURSES.knife.id]: {
    id: COURSES.knife.id,
    title: COURSES.knife.title,
    subtitle: 'Faster prep, fewer cuts, better food.',
    creator: CREATORS.marco,
    lessonCount: 9,
    totalLabel: '1h 24m',
    requiresPro: true,
    lessons: [
      { id: 'l2', title: 'Hold your knife like this, not like that', durationLabel: '39s', access: 'free', watched: true },
      { id: 'l6', title: 'Salt earlier. Here is why it matters', durationLabel: '36s', access: 'free', watched: true },
      { id: 'l10', title: 'A dull knife is the dangerous one', durationLabel: '40s', access: 'free', watched: false },
      { id: 'p5', title: 'The claw grip, drilled slowly', durationLabel: '7m 30s', access: 'paid', watched: false },
      { id: 'p6', title: 'Onions without tears or panic', durationLabel: '9m 45s', access: 'paid', watched: false },
      { id: 'p7', title: 'Sharpening on a whetstone', durationLabel: '14m 02s', access: 'paid', watched: false },
    ],
  },

  [COURSES.money.id]: {
    id: COURSES.money.id,
    title: COURSES.money.title,
    subtitle: 'The boring plan that actually compounds.',
    creator: CREATORS.ayesha,
    lessonCount: 11,
    totalLabel: '1h 52m',
    requiresPro: true,
    lessons: [
      { id: 'l3', title: 'Compound interest, explained with a jar', durationLabel: '55s', access: 'free', watched: true },
      { id: 'l7', title: 'Emergency fund before investing. Always', durationLabel: '47s', access: 'free', watched: true },
      { id: 'l11', title: 'Fees eat more than you think', durationLabel: '49s', access: 'free', watched: false },
      { id: 'p8', title: 'Picking your first index fund', durationLabel: '13m 20s', access: 'paid', watched: false },
      { id: 'p9', title: 'Tax-free accounts, plainly', durationLabel: '10m 55s', access: 'paid', watched: false },
      { id: 'p10', title: 'What to do when the market drops', durationLabel: '8m 40s', access: 'paid', watched: false },
    ],
  },
};

export function getSeedCourse(id: string): CourseDetail | null {
  return seedCourses[id] ?? null;
}
