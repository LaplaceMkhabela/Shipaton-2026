import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, MinTouchTarget, Radius, Space, TabularNums, Type } from '@/constants/theme';
import { getCreator, type CreatorCourse, type CreatorDetail } from '@/lib/seed/creator';
import type { FeedLesson } from '@/lib/seed/lessons';
import { useAuth } from '@/providers/auth-provider';

/**
 * Creator profile — the middle of the funnel (feed → creator → course). Backed
 * by seed data for now; `getCreator(id)` in API.md lands as the Supabase query.
 */
export default function CreatorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const creator = getCreator(id);

  if (!creator) {
    return (
      <SafeAreaView style={styles.missing}>
        <Text style={styles.missingText}>That creator isn&apos;t available.</Text>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}>
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Hero creator={creator} />

        {creator.courses.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Courses</Text>
            <View style={styles.list}>
              {creator.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.empty}>No published courses yet.</Text>
        )}

        <Text style={[styles.sectionLabel, styles.lessonsLabel]}>Lessons</Text>
        {creator.lessons.length > 0 ? (
          <View style={styles.list}>
            {creator.lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No published lessons yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Hero({ creator }: { creator: CreatorDetail }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);

  function onToggleFollow() {
    // Following needs an account (profile tab gates on it the same way).
    // State is optimistic for now — wiring in API.md's followCreator lands
    // when the backend does, exactly like likes/saves in the action rail.
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }
    setFollowing((v) => !v);
  }

  return (
    <View style={styles.hero}>
      <Image
        source={{ uri: creator.imageUrl }}
        style={styles.avatar}
        contentFit="cover"
        transition={150}
        accessibilityLabel={`${creator.displayName}'s avatar`}
      />
      <Text style={styles.name}>{creator.displayName}</Text>
      <Text style={styles.handle}>@{creator.handle}</Text>
      <Text style={styles.bio}>{creator.bio}</Text>
      <Text style={styles.stats}>
        {formatCount(creator.followerCount)} followers · {creator.lessonCount} free lessons
      </Text>
      <Button
        label={following ? 'Following' : 'Follow'}
        variant={following ? 'secondary' : 'free'}
        onPress={onToggleFollow}
        style={styles.follow}
      />
    </View>
  );
}

function CourseCard({ course }: { course: CreatorCourse }) {
  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open course: ${course.title}`}
      style={({ pressed }) => [styles.course, pressed && styles.pressed]}>
      <Text style={styles.courseKicker}>Course</Text>
      <Text style={styles.courseTitle} numberOfLines={2}>
        {course.title}
      </Text>
      <Text style={styles.courseSubtitle} numberOfLines={2}>
        {course.subtitle}
      </Text>
      <Text style={styles.courseMeta}>
        {course.lessonCount} lessons · {course.freeLessonCount} free · {course.totalLabel}
      </Text>
    </Pressable>
  );
}

function LessonRow({ lesson }: { lesson: FeedLesson }) {
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={`Play in feed: ${lesson.title}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={styles.rowGlyph}>▶</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.rowMeta}>
          {lesson.topic} · {lesson.durationSeconds}s
        </Text>
      </View>
      <Text style={styles.rowHint}>Feed</Text>
    </Pressable>
  );
}

function formatCount(n: number) {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  missing: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    padding: Space.lg,
  },
  missingText: { ...Type.body, color: Colors.textMuted },

  bar: { height: 44, justifyContent: 'center', paddingHorizontal: Space.sm },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { color: Colors.text, fontSize: 32, lineHeight: 34 },

  body: { paddingHorizontal: Space.md, paddingBottom: Space.xl, gap: Space.md },

  hero: { alignItems: 'center', paddingTop: Space.sm, gap: Space.xs },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.text,
    backgroundColor: Colors.surfaceHi,
    marginBottom: Space.xs,
  },
  name: { ...Type.title, color: Colors.text },
  handle: { ...Type.caption, color: Colors.textMuted },
  bio: {
    ...Type.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Space.sm,
  },
  stats: { ...Type.micro, color: Colors.textFaint, ...TabularNums },
  follow: { alignSelf: 'stretch', marginTop: Space.sm },

  sectionLabel: {
    ...Type.micro,
    color: Colors.paid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    marginTop: Space.sm,
  },
  lessonsLabel: { color: Colors.free },

  list: { borderTopWidth: 1, borderTopColor: Colors.border },
  empty: { ...Type.caption, color: Colors.textFaint },

  course: {
    backgroundColor: Colors.surfaceHi,
    borderWidth: 1,
    borderColor: Colors.paid,
    borderRadius: Radius.lg,
    padding: Space.md,
    gap: 3,
  },
  courseKicker: {
    ...Type.micro,
    color: Colors.paid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  courseTitle: { ...Type.body, color: Colors.text, fontWeight: '600' },
  courseSubtitle: { ...Type.caption, color: Colors.textMuted },
  courseMeta: { ...Type.micro, color: Colors.textFaint, ...TabularNums },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    minHeight: MinTouchTarget,
    paddingVertical: Space.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowGlyph: { fontSize: 14, width: 20, textAlign: 'center', color: Colors.free },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...Type.caption, color: Colors.text, fontWeight: '600' },
  rowMeta: { ...Type.micro, color: Colors.textFaint, ...TabularNums },
  rowHint: { ...Type.micro, color: Colors.textFaint },

  pressed: { opacity: 0.7 },
});