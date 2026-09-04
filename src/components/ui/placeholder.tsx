import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Space, Type } from '@/constants/theme';

/**
 * Temporary scaffold for routes that exist but aren't built yet.
 * Delete each usage as the real screen lands.
 */
export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.sm, padding: Space.lg },
  title: { ...Type.title, color: Colors.text },
  note: { ...Type.caption, color: Colors.textFaint, textAlign: 'center' },
});
