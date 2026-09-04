import type { Session, User } from '@supabase/supabase-js';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getProfile, getSession, onAuthStateChange, type Profile } from '@/lib/supabase/auth';

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isConfigured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession()
      .then((s) => active && setSession(s))
      .catch(() => active && setSession(null))
      .finally(() => active && setIsLoading(false));

    const subscription = onAuthStateChange((s) => {
      if (!active) return;
      setSession(s);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let active = true;
    getProfile(userId)
      .then((p) => active && setProfile(p))
      .catch(() => active && setProfile(null));
    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isConfigured: isSupabaseConfigured,
    }),
    [session, profile, isLoading]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  return use(AuthContext);
}
