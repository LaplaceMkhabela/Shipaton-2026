import { isSupabaseConfigured, supabase } from './client';

export type FeedCreator = {
  id: string;
  handle: string;
  displayName: string;
};

export type FeedCourse = {
  id: string;
  title: string;
  lessonCount: number;
};

export type FeedLesson = {
  id: string;
  title: string;
  topic: string;
  videoUrl: string;
  durationSeconds: number;
  likeCount: number;
  viewCount: number;
  /** Pagination cursor — pass the last item's value as the next page's `cursor`. */
  createdAt: string;
  creator: FeedCreator;
  /** null = standalone top-of-funnel clip. Drives whether the CTA card shows. */
  course: FeedCourse | null;
};

type FeedRow = {
  id: string;
  title: string;
  topic: string | null;
  video_path: string;
  duration_seconds: number;
  like_count: number;
  view_count: number;
  created_at: string;
  creator: { id: string; handle: string; display_name: string } | null;
  course: { id: string; title: string; lesson_count: number } | null;
};

function toFeedLesson(row: FeedRow): FeedLesson {
  if (!row.creator) {
    throw new Error(`Lesson ${row.id} has no creator — creator_id is not-null in the schema`);
  }
  return {
    id: row.id,
    title: row.title,
    topic: row.topic ?? '',
    // Free lessons store a full playable URL here today, not a storage path
    // — see supabase/seed.sql. Real uploads will replace these paths once
    // Storage is wired up; this mapping won't need to change either way.
    videoUrl: row.video_path,
    durationSeconds: row.duration_seconds,
    likeCount: row.like_count,
    viewCount: row.view_count,
    createdAt: row.created_at,
    creator: {
      id: row.creator.id,
      handle: row.creator.handle,
      displayName: row.creator.display_name,
    },
    course: row.course
      ? { id: row.course.id, title: row.course.title, lessonCount: row.course.lesson_count }
      : null,
  };
}

/**
 * The hot path. Runs on every scroll. See API.md for the full contract.
 *
 * Feed is browsable signed out, so this degrades to an empty page rather
 * than throwing when Supabase isn't configured — it is not itself an error.
 */
export async function getFeed({
  cursor,
  limit = 10,
}: { cursor?: string; limit?: number } = {}): Promise<FeedLesson[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('lessons')
    .select(
      `
      id, title, topic, video_path, duration_seconds, like_count, view_count, created_at,
      creator:profiles!lessons_creator_id_fkey ( id, handle, display_name ),
      course:courses ( id, title, lesson_count )
    `
    )
    // published is redundant under RLS (lessons_read_published already filters
    // it) but kept explicit so the planner uses the lessons(published,
    // created_at desc) index. access is NOT covered by RLS — this is the one
    // filter that must not be dropped, or paid lessons leak into the feed.
    .eq('published', true)
    .eq('access', 'free')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as FeedRow[]).map(toFeedLesson);
}
