import type { Session, User } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from './client';

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_creator: boolean;
  created_at: string;
};

export class NotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Add credentials to .env — see issue #1.');
    this.name = 'NotConfiguredError';
  }
}

function assertConfigured() {
  if (!isSupabaseConfigured) throw new NotConfiguredError();
}

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

/**
 * Creates the auth user, then the profiles row. Two steps because handle and
 * display_name are NOT NULL in the schema and auth.users can't carry them.
 */
export async function signUp(input: {
  email: string;
  password: string;
  handle: string;
  displayName: string;
}): Promise<{ session: Session | null; user: User | null }> {
  assertConfigured();

  const handle = input.handle.trim().toLowerCase();
  if (!HANDLE_PATTERN.test(handle)) {
    throw new Error('Handle must be 3-20 characters: lowercase letters, numbers or underscore.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed — no user returned.');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    handle,
    display_name: input.displayName.trim(),
  });

  if (profileError) {
    // 23505 = unique_violation. The only unique column here is handle.
    if (profileError.code === '23505') {
      throw new Error(`@${handle} is already taken.`);
    }
    throw profileError;
  }

  // TODO(API.md): once react-native-purchases is installed, call
  // Purchases.logIn(data.user.id) here so entitlements follow the account.
  return { session: data.session, user: data.user };
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  assertConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;

  // TODO(API.md): Purchases.logIn(data.user.id)
  return data.session;
}

export async function signOut(): Promise<void> {
  assertConfigured();

  // TODO(API.md): Purchases.logOut() must run here too. Without it a device's
  // subscription follows whoever signs in next.
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export function onAuthStateChange(cb: (session: Session | null) => void) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return data.subscription;
}
