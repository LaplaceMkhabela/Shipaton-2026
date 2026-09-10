/**
 * Seed lessons so the feed runs with no backend.
 *
 * Shaped like the `FeedLesson` contract in API.md, so switching to the real
 * `getFeed` query is an import change rather than a rewrite.
 *
 * Videos stream from the public Supabase `lessons-free` bucket via drive.ts
 * (mirrored from the shared Shipaton_2026 Google Drive folder) — real course
 * content from three creators (calculus, piano, saving money). Lifecycle,
 * descriptions and lesson counts come from the course-structure JSON each
 * creator keeps beside their videos.
 *
 * Durations are estimates where the JSON doesn't state one; real value comes
 * from the `lessons.duration_seconds` column once issue #2 lands.
 */

import { imageUrl, type DriveKey, videoUrl } from './drive';

export type SeedCreator = {
  id: string;
  handle: string;
  displayName: string;
  /** Avatar — creator.png from the course folder in Drive. */
  imageUrl: string;
  /** Short pitch, shown on the creator profile page. */
  bio: string;
  followerCount: number;
};

export type SeedCourse = {
  id: string;
  title: string;
  lessonCount: number;
  /** Count of that course's lessons shown free in the feed (the funnel). */
  freeLessonCount: number;
};

export type FeedLesson = {
  id: string;
  title: string;
  topic: string;
  videoUrl: string;
  durationSeconds: number;
  likeCount: number;
  viewCount: number;
  creator: SeedCreator;
  /** null = standalone top-of-funnel clip. Drives whether the CTA card shows. */
  course: SeedCourse | null;
};

export const CREATORS: Record<string, SeedCreator> = {
  voss: {
    id: 'c1',
    handle: 'elaravoss',
    displayName: 'Dr. Elara Voss',
    imageUrl: imageUrl('calc_creator_image'),
    bio: "Math professor making calculus make sense — one 45-second intuition at a time. No memorising, just seeing.",
    followerCount: 48200,
  },
  keys: {
    id: 'c2',
    handle: 'juliankeys',
    displayName: 'Julian Keys',
    imageUrl: imageUrl('piano_creator_image'),
    bio: "Pianist and teacher. You don't need to read music to start — you need five honest minutes a day.",
    followerCount: 87600,
  },
  vance: {
    id: 'c3',
    handle: 'eliasvance',
    displayName: 'Elias Vance',
    imageUrl: imageUrl('money_creator_image'),
    bio: "Money coach for people who think \u201cbudget\u201d is a four-letter word. Small systems, lasting change.",
    followerCount: 64100,
  },
};

export const COURSES: Record<string, SeedCourse> = {
  calc: { id: 'co1', title: 'Introduction to Calculus', lessonCount: 30, freeLessonCount: 10 },
  piano: {
    id: 'co2',
    title: '120-Minute Beginner Piano Crash Course',
    lessonCount: 24,
    freeLessonCount: 9,
  },
  money: { id: 'co3', title: 'Saving Money', lessonCount: 15, freeLessonCount: 9 },
};

function feed(
  id: string,
  title: string,
  topic: string,
  video: DriveKey,
  durationSeconds: number,
  creator: SeedCreator,
  course: SeedCourse,
  likeCount: number,
  viewCount: number
): FeedLesson {
  return {
    id,
    title,
    topic,
    videoUrl: videoUrl(video),
    durationSeconds,
    likeCount,
    viewCount,
    creator,
    course,
  };
}

export const seedLessons: FeedLesson[] = [
  // ── Introduction to Calculus ───────────────────────────────────────────
  feed('cl1', 'What is a Limit?', 'Calculus', 'calc_what_is_a_limit', 45, CREATORS.voss, COURSES.calc, 2184, 41200),
  feed('cl2', 'One-Sided Limits', 'Calculus', 'calc_one_sided_limits', 50, CREATORS.voss, COURSES.calc, 1642, 29800),
  feed('cl3', 'Limit Notation', 'Calculus', 'calc_limit_notation', 35, CREATORS.voss, COURSES.calc, 1201, 22600),
  feed('cl4', 'Computing Limits Algebraically', 'Calculus', 'calc_computing_limits', 60, CREATORS.voss, COURSES.calc, 1833, 33900),
  feed('cl5', 'Limits at Infinity', 'Calculus', 'calc_limits_at_infinity', 55, CREATORS.voss, COURSES.calc, 976, 18300),
  feed('cl6', 'Infinite Limits', 'Calculus', 'calc_infinite_limits', 50, CREATORS.voss, COURSES.calc, 1402, 25100),
  feed('cl7', 'Continuity Defined', 'Calculus', 'calc_continuity_defined', 45, CREATORS.voss, COURSES.calc, 1130, 21000),
  feed('cl8', 'Types of Discontinuities', 'Calculus', 'calc_discontinuities', 55, CREATORS.voss, COURSES.calc, 1520, 27200),
  feed('cl9', 'Intermediate Value Theorem', 'Calculus', 'calc_ivt', 60, CREATORS.voss, COURSES.calc, 1284, 23900),
  feed('cl10', 'Limit & Continuity Summary', 'Calculus', 'calc_summary', 40, CREATORS.voss, COURSES.calc, 861, 16800),

  // ── Learning the Piano ──────────────────────────────────────────────────
  feed('pn1', 'Welcome to Piano', 'Piano', 'piano_welcome', 90, CREATORS.keys, COURSES.piano, 3240, 58300),
  feed('pn2', 'Understanding the Keyboard', 'Piano', 'piano_keyboard', 90, CREATORS.keys, COURSES.piano, 2810, 51200),
  feed('pn3', 'Finding Middle C', 'Piano', 'piano_middle_c', 75, CREATORS.keys, COURSES.piano, 1950, 36700),
  feed('pn4', 'Finger Numbers', 'Piano', 'piano_finger_numbers', 70, CREATORS.keys, COURSES.piano, 1734, 32100),
  feed('pn5', 'Rhythm', 'Piano', 'piano_rhythm', 80, CREATORS.keys, COURSES.piano, 2208, 40800),
  feed('pn6', 'Notes', 'Piano', 'piano_notes', 60, CREATORS.keys, COURSES.piano, 1521, 27900),
  feed('pn7', 'Chords', 'Piano', 'piano_chords', 75, CREATORS.keys, COURSES.piano, 2683, 49200),
  feed('pn8', 'Scales', 'Piano', 'piano_scales', 90, CREATORS.keys, COURSES.piano, 1990, 37400),
  feed('pn9', 'Playing Simple Music', 'Piano', 'piano_simple_music', 95, CREATORS.keys, COURSES.piano, 3411, 62100),

  // ── Saving Money ────────────────────────────────────────────────────────
  feed('m1', 'Write Your Savings Goal', 'Money', 'money_write_goal', 30, CREATORS.vance, COURSES.money, 3890, 72400),
  feed('m2', 'Micro-Savings', 'Money', 'money_micro_savings', 30, CREATORS.vance, COURSES.money, 2734, 51900),
  feed('m3', 'Gamify Your Savings', 'Money', 'money_gamify', 30, CREATORS.vance, COURSES.money, 2415, 45300),
  feed('m4', 'Automate Your Savings', 'Money', 'money_automate_savings', 30, CREATORS.vance, COURSES.money, 3021, 56600),
  feed('m5', 'Emergency Fund Shield', 'Money', 'money_emergency_fund', 30, CREATORS.vance, COURSES.money, 3542, 67200),
  feed('m6', 'High-Yield Savings', 'Money', 'money_high_yield', 30, CREATORS.vance, COURSES.money, 2209, 41800),
  feed('m7', 'Automate Wealth Buckets', 'Money', 'money_automate_buckets', 30, CREATORS.vance, COURSES.money, 2643, 49700),
  feed('m8', 'Compound Interest', 'Money', 'money_compound_interest', 30, CREATORS.vance, COURSES.money, 4185, 80900),
  feed('m9', 'Audit Your Expenses', 'Money', 'money_audit', 30, CREATORS.vance, COURSES.money, 1872, 34100),
];