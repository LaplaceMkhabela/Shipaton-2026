import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Space, TabularNums, Type } from '@/constants/theme';
import type { FeedLesson } from '@/lib/seed/lessons';
import { ActionRail } from './action-rail';
import { CourseCtaCard } from './course-cta-card';

/** The CTA card enters here, not at the start. See CourseCtaCard for why. */
const CTA_AT = 0.6;

type Props = {
  lesson: FeedLesson;
  isActive: boolean;
  height: number;
};

function FeedItemImpl({ lesson, isActive, height }: Props) {
  const player = useVideoPlayer(lesson.videoUrl, (p) => {
    p.loop = true;
    // Defaults to 0, which means timeUpdate never fires and the progress bar
    // silently does nothing. Must be set explicitly.
    p.timeUpdateEventInterval = 0.25;
  });

  const [progress, setProgress] = useState(0);

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      // Restart rather than resume — coming back to a lesson mid-sentence is
      // worse than starting it over.
      player.currentTime = 0;
      setProgress(0);
    }
  }, [isActive, player]);

  useEffect(() => {
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      const total = player.duration;
      setProgress(total > 0 ? Math.min(currentTime / total, 1) : 0);
    });
    return () => sub.remove();
  }, [player]);

  return (
    <View style={[styles.container, { height }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => (isPlaying ? player.pause() : player.play())}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause lesson' : 'Play lesson'}>
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </Pressable>

      {/* Text over video always sits on a scrim — see DESIGN.md */}
      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.arail}>
        <ActionRail creator={lesson.creator} likeCount={lesson.likeCount} />
      </View>

      <View style={styles.overlay}>
        {lesson.course ? (
          <CourseCtaCard
            course={lesson.course}
            visible={isActive && progress >= CTA_AT}
            freeCount={3}
          />
        ) : null}
        <Text style={styles.handle}>@{lesson.creator.handle}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.meta}>
          {lesson.topic} · {lesson.durationSeconds}s
        </Text>
      </View>

      {!isPlaying && isActive ? (
        <View style={styles.pausedBadge} pointerEvents="none">
          <Text style={styles.pausedText}>Paused</Text>
        </View>
      ) : null}

      <View style={styles.progressTrack} pointerEvents="none">
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

export const FeedItem = memo(FeedItemImpl);

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: Colors.bg },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
    backgroundColor: Colors.scrimBottom,
  },
  overlay: {
    position: 'absolute',
    left: Space.md,
    // Clears the action rail so the title never runs under the icons.
    right: 72,
    bottom: Space.xl,
    gap: Space.xs,
  },
  arail: { position: 'absolute', right: Space.sm, bottom: Space.xxl + Space.md },
  handle: { ...Type.caption, color: Colors.free, fontWeight: '700' },
  title: { ...Type.title, color: Colors.text },
  meta: { ...Type.micro, color: Colors.textMuted, ...TabularNums },
  pausedBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: 999,
    backgroundColor: Colors.scrimTop,
  },
  pausedText: { ...Type.micro, color: Colors.text },
  progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2 },
  progressFill: { height: 2, backgroundColor: Colors.free },
});
