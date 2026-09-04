import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Colors, MinTouchTarget, Radius, Space, Type } from '@/constants/theme';

/**
 * `free` and `paid` are not styling choices — DESIGN.md encodes the funnel in
 * colour. Lime marks open access, violet marks premium. Don't cross them.
 */
type Variant = 'free' | 'paid' | 'secondary';

export function Button({
  label,
  onPress,
  variant = 'free',
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'free' ? Colors.bg : Colors.text} />
      ) : (
        <Text style={[styles.label, variant === 'free' ? styles.labelOnLime : styles.labelOnDark]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    minHeight: MinTouchTarget,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
  },
  free: { backgroundColor: Colors.free },
  paid: { backgroundColor: Colors.paid },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  label: { ...Type.body, fontWeight: '700' },
  // Dark text on lime, never white — see DESIGN.md.
  labelOnLime: { color: Colors.bg },
  labelOnDark: { color: Colors.text },
});
