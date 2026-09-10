/**
 * Seed creator profiles, shaped like the `getCreator` response in API.md.
 *
 * Composes the existing seed collections (lessons.ts + courses.ts) so the
 * creator page runs with no backend: the profile, their published free
 * lessons (what's in the feed), and their paid course outlines. Swaps to a
 * Supabase `getCreator(id)` query as an import change, not a rewrite — see
 * the build order in API.md.
 */

import { CREATORS, seedLessons, type FeedLesson } from './lessons';
import { seedCourses, type CourseDetail } from './courses';

export type CreatorCourse = {
  id: string;
  title: string;
  subtitle: string;
  lessonCount: number;
  /** Count of that course's lessons shown free in the feed (the funnel). */
  freeLessonCount: number;
  totalLabel: string;
};

export type CreatorDetail = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  imageUrl: string;
  followerCount: number;
  /** Their published free lessons — exactly what the feed shows for them. */
  lessonCount: number;
  lessons: FeedLesson[];
  courses: CreatorCourse[];
};

export function getCreator(id: string): CreatorDetail | null {
  const creator = Object.values(CREATORS).find((c) => c.id === id);
  if (!creator) return null;

  const lessons = seedLessons.filter((l) => l.creator.id === id);
  const courses = Object.values(seedCourses)
    .filter((c) => c.creator.id === id)
    .map(toCreatorCourse);

  return {
    ...creator,
    lessonCount: lessons.length,
    lessons,
    courses,
  };
}

function toCreatorCourse(course: CourseDetail): CreatorCourse {
  const freeLessonCount = course.lessons.filter((l) => l.access === 'free').length;
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    lessonCount: course.lessonCount,
    freeLessonCount,
    totalLabel: course.totalLabel,
  };
}