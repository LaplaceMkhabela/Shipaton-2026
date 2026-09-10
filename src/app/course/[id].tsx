import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Space, TabularNums, Type } from '@/constants/theme';
import { getSeedCourse, type CourseLesson } from '@/lib/seed/courses';

/**
 * The funnel destination — where a free lesson sends a viewer.
 *
 * The page opens with what it already gave you: watched free lessons, ticked
 * in lime, before anything locked. Value delivered, then value offered.
 */
export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = getSeedCourse(id);

  if (!course) {
    return (
      <SafeAreaView style={styles.missing}>
        <Text style={styles.missingText}>That course isn&apos;t available.</Text>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const watched = course.lessons.filter((l) => l.watched).length;

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
        <View style={styles.cover}>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        </View>

        <View style={styles.head}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle}>{course.subtitle}</Text>
          <Pressable
            onPress={() => router.push(`/creator/${course.creator.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${course.creator.displayName}'s profile`}
            style={({ pressed }) => [styles.creatorRow, pressed && styles.creatorRowPressed]}>
            <Image
              source={{ uri: course.creator.imageUrl }}
              style={styles.creatorAvatar}
              contentFit="cover"
              accessibilityLabel={`${course.creator.displayName}'s avatar`}
            />
            <Text style={styles.meta}>
              @{course.creator.handle} · {course.lessonCount} lessons · {course.totalLabel}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {watched > 0 ? (
          <Text style={styles.sectionLabel}>
            You&apos;ve watched {watched} of these free
          </Text>
        ) : null}

        <View style={styles.list}>
          {course.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.foot}>
        <Button
          label={`Unlock all ${course.lessonCount} lessons`}
          variant="paid"
          onPress={() => router.push(`/paywall/${course.id}`)}
        />
        <Text style={styles.footNote}>Included with Pro · R99/month</Text>
      </View>
    </SafeAreaView>
  );
}

function LessonRow({ lesson }: { lesson: CourseLesson }) {
  const locked = lesson.access === 'paid';
  return (
    <View style={styles.row}>
      {/* Lime for what's yours, violet for what isn't. Never crossed. */}
      <Text style={[styles.rowGlyph, locked ? styles.glyphPaid : styles.glyphFree]}>
        {locked ? '🔒' : lesson.watched ? '✓' : '▶'}
      </Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, locked && styles.rowTitleLocked]} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.rowMeta}>
          {lesson.watched ? 'Watched · ' : ''}
          {lesson.durationLabel}
        </Text>
      </View>
    </View>
  );
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

  cover: {
    height: 168,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHi,
    overflow: 'hidden',
  },
  proBadge: {
    alignSelf: 'flex-start',
    margin: Space.sm,
    paddingHorizontal: Space.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.paid,
    backgroundColor: 'rgba(10,10,11,0.72)',
  },
  proText: {
    ...Type.micro,
    color: Colors.paid,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  head: { gap: Space.xs },
  title: { ...Type.title, color: Colors.text },
  subtitle: { ...Type.body, color: Colors.textMuted },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, alignSelf: 'flex-start' },
  creatorRowPressed: { opacity: 0.6 },
  chevron: { ...Type.caption, color: Colors.textFaint },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceHi,
  },
  meta: { ...Type.caption, color: Colors.textFaint, ...TabularNums },

  sectionLabel: {
    ...Type.micro,
    color: Colors.free,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },

  list: { borderTopWidth: 1, borderTopColor: Colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: Space.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowGlyph: { fontSize: 14, width: 20, textAlign: 'center' },
  glyphFree: { color: Colors.free },
  glyphPaid: { color: Colors.paid },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...Type.caption, color: Colors.text, fontWeight: '600' },
  rowTitleLocked: { color: Colors.textMuted },
  rowMeta: { ...Type.micro, color: Colors.textFaint, ...TabularNums },

  foot: {
    paddingHorizontal: Space.md,
    paddingTop: Space.sm,
    paddingBottom: Space.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  footNote: { ...Type.micro, color: Colors.textFaint, textAlign: 'center', marginTop: Space.sm },
});
