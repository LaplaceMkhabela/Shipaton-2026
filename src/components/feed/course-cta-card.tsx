import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Motion, Radius, Space, TabularNums, Type } from '@/constants/theme';
import type { SeedCourse } from '@/lib/seed/lessons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The funnel's hinge, and the most important component in the app.
 *
 * It deliberately does not appear at the start of a lesson. It enters once the
 * viewer is ~60% through — after they've been given something. That timing is
 * the product thesis expressed as one interaction, so don't "fix" it by
 * showing it sooner.
 */
export function CourseCtaCard({
  course,
  visible,
  freeCount,
}: {
  course: SeedCourse;
  visible: boolean;
  freeCount: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible
      ? withSpring(1, Motion.spring)
      : withTiming(0, { duration: Motion.quick });
  }, [visible, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 24 }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, style]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityRole="button"
      accessibilityLabel={`Open course: ${course.title}`}
      onPress={() => router.push(`/course/${course.id}`)}>
      <Text style={styles.kicker}>From the course</Text>
      <Text style={styles.title} numberOfLines={2}>
        {course.title}
      </Text>
      <Text style={styles.meta}>
        {course.lessonCount} lessons · {freeCount} free
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // Violet: this is a paid surface. Never lime here — see DESIGN.md.
    backgroundColor: 'rgba(30,30,35,0.93)',
    borderWidth: 1,
    borderColor: Colors.paid,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm + 2,
    marginBottom: Space.sm,
  },
  kicker: {
    ...Type.micro,
    color: Colors.paid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  title: { ...Type.body, color: Colors.text, fontWeight: '600', marginTop: 3 },
  meta: { ...Type.micro, color: Colors.textMuted, marginTop: 3, ...TabularNums },
});
