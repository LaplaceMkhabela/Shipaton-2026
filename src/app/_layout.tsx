import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/providers/auth-provider';
import { PurchasesProvider } from '@/providers/purchases-provider';
import { QueryProvider } from '@/providers/query-provider';

/**
 * Root layout. PurchasesProvider sits inside AuthProvider because RevenueCat's
 * identity is the Supabase user id — see PLAN.md lane ownership.
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
      <QueryProvider>
        <AuthProvider>
          <PurchasesProvider>
            <Stack
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
              <Stack.Screen name="(tabs)" />
              {/* Auth is action-triggered, never a gate on launch — the feed is
                  browsable signed out. So it presents as a modal. */}
              <Stack.Screen
                name="(auth)"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="course/[id]" />
              <Stack.Screen name="creator/[id]" />
              <Stack.Screen
                name="paywall/[courseId]"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack>
          </PurchasesProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
