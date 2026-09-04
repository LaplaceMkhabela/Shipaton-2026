import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, MinTouchTarget, Radius, Space, TabularNums, Type } from '@/constants/theme';
import type { SeedCreator } from '@/lib/seed/lessons';

/**
 * Four actions, deliberately. Every extra icon competes with the CTA card,
 * which is the thing that actually earns money.
 *
 * Likes and saves are optimistic — a heart that waits on a round-trip feels
 * broken. Wiring to Supabase comes with the mutations in API.md; for now the
 * state is local so the interaction can be judged.
 */
export function ActionRail({
  creator,
  likeCount,
  onOpenCreator,
}: {
  creator: SeedCreator;
  likeCount: number;
  onOpenCreator?: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.rail}>
      <Pressable
        onPress={onOpenCreator ?? (() => router.push(`/creator/${creator.id}`))}
        accessibilityRole="button"
        accessibilityLabel={`Open ${creator.displayName}'s profile`}
        style={styles.hit}>
        <View style={styles.avatar} />
      </Pressable>

      <Action
        glyph={liked ? '♥' : '♡'}
        label={formatCount(likeCount + (liked ? 1 : 0))}
        active={liked}
        accessibilityLabel={liked ? 'Unlike lesson' : 'Like lesson'}
        onPress={() => setLiked((v) => !v)}
      />
      <Action
        glyph={saved ? '★' : '☆'}
        label="Save"
        active={saved}
        accessibilityLabel={saved ? 'Remove from saved' : 'Save lesson'}
        onPress={() => setSaved((v) => !v)}
      />
      <Action glyph="↗" label="Share" accessibilityLabel="Share lesson" onPress={() => {}} />
    </View>
  );
}

function Action({
  glyph,
  label,
  active,
  accessibilityLabel,
  onPress,
}: {
  glyph: string;
  label: string;
  active?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}>
      {/* Lime marks a free interaction — liking and saving cost nothing. */}
      <Text style={[styles.glyph, active && styles.glyphActive]}>{glyph}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function formatCount(n: number) {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
}

const styles = StyleSheet.create({
  rail: { alignItems: 'center', gap: Space.md },
  hit: {
    minWidth: MinTouchTarget,
    minHeight: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: { opacity: 0.6 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.text,
    backgroundColor: Colors.surfaceHi,
  },
  glyph: { fontSize: 24, color: Colors.text, lineHeight: 28 },
  glyphActive: { color: Colors.free },
  label: { ...Type.micro, color: Colors.textMuted, ...TabularNums },
});
