import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Radius, Space, Type } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  /** Rendered dimmed under the field; use for format hints, not errors. */
  hint?: string;
};

export function TextField({ label, error, hint, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={Colors.textFaint}
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Space.xs },
  label: { ...Type.micro, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    ...Type.body,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    // 52 matches the primary button height in DESIGN.md
    height: 52,
  },
  inputFocused: { borderColor: Colors.textMuted },
  inputError: { borderColor: Colors.danger },
  error: { ...Type.caption, color: Colors.danger },
  hint: { ...Type.caption, color: Colors.textFaint },
});
