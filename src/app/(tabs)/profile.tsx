import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, Space, Type } from '@/constants/theme';
import { signOut } from '@/lib/supabase/auth';
import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={Colors.textMuted} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.block}>
          <Text style={styles.title}>You</Text>
          <Text style={styles.body}>
            Sign in to save lessons, follow creators, and publish your own.
          </Text>
          <Button label="Sign in" onPress={() => router.push('/(auth)/sign-in')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.block}>
        <Text style={styles.title}>{profile?.display_name ?? 'You'}</Text>
        {profile?.handle ? <Text style={styles.handle}>@{profile.handle}</Text> : null}
        <Text style={styles.body}>Saved lessons, purchases, and creator tools go here.</Text>
        <Button label="Sign out" variant="secondary" onPress={() => signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  block: { gap: Space.md, padding: Space.lg, alignSelf: 'stretch' },
  title: { ...Type.title, color: Colors.text },
  handle: { ...Type.caption, color: Colors.free },
  body: { ...Type.body, color: Colors.textMuted },
});
