import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Colors, Space, Type } from '@/constants/theme';
import { signUp } from '@/lib/supabase/auth';
import { useAuth } from '@/providers/auth-provider';
import { NotConfiguredBanner } from './sign-in';

export default function SignUpScreen() {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const canSubmit = !!email && password.length >= 6 && !!handle && !!displayName;

  async function submit() {
    setError(undefined);
    setLoading(true);
    try {
      await signUp({ email, password, handle, displayName });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Free. Start learning, or start teaching.</Text>
          </View>

          {!isConfigured && <NotConfiguredBanner />}

          <TextField
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Sabelo Mkhabela"
            autoComplete="name"
          />
          <TextField
            label="Handle"
            value={handle}
            onChangeText={(t) => setHandle(t.toLowerCase())}
            autoCapitalize="none"
            placeholder="sabelo"
            hint="3-20 characters: lowercase letters, numbers or underscore"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={error}
          />

          <Button label="Create account" onPress={submit} loading={loading} disabled={!canSubmit} />

          <Link href="/(auth)/sign-in" style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  content: { padding: Space.lg, gap: Space.md, flexGrow: 1, justifyContent: 'center' },
  header: { gap: Space.xs, marginBottom: Space.sm },
  title: { ...Type.hero, color: Colors.text },
  subtitle: { ...Type.body, color: Colors.textMuted },
  link: { alignSelf: 'center', paddingVertical: Space.md },
  linkText: { ...Type.caption, color: Colors.textMuted },
});
