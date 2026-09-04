import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';

/**
 * Root layout. Providers (TanStack Query, auth, RevenueCat) wrap the Stack here
 * once they're installed — see PLAN.md lane ownership.
 */
export default function RootLayout() {
  return (
    <ThemeProvider
      value={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: Colors.bg,
          card: Colors.surface,
          text: Colors.text,
          border: Colors.border,
          primary: Colors.paid,
        },
      }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="creator/[id]" />
        <Stack.Screen
          name="paywall/[courseId]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
