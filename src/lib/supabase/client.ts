import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Whether real credentials are present. The Supabase project may not exist yet
 * (see issue #1), so the app has to boot and let the feed work regardless —
 * screens check this and say so rather than failing silently.
 */
export const isSupabaseConfigured =
  url.length > 0 &&
  anonKey.length > 0 &&
  !url.includes('your-project') &&
  !anonKey.includes('your-anon-key');

/**
 * Constructed even without credentials so importing this module never throws.
 * Requests fail at call time with a readable message instead of crashing at
 * startup — see assertConfigured in ./auth.
 */
export const supabase = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? anonKey : 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Browser-only OAuth mechanism; must be off on native or auth stalls.
      detectSessionInUrl: false,
    },
  }
);

/**
 * Supabase only refreshes tokens while the app is foregrounded. Without this,
 * sessions expire in the background and users come back apparently logged out.
 */
if (isSupabaseConfigured) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
