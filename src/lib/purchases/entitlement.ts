import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

import { PRO_ENTITLEMENT } from './client';

export type Entitlement = { isPro: boolean; expiresAt: string | null };

const NONE: Entitlement = { isPro: false, expiresAt: null };

/**
 * `getMyEntitlement()` from API.md. Lane C.
 *
 * Reads the `entitlements` row the RevenueCat webhook writes with the service
 * role. RevenueCat's own `customerInfo` answers faster, but **this is the one
 * that matters** — it is what `has_pro()` gates paid video on. Where the two
 * disagree, the webhook simply hasn't landed yet.
 *
 * A cancelled subscription is not an expired one: access runs to `expires_at`.
 */
export async function getMyEntitlement(): Promise<Entitlement> {
  if (!isSupabaseConfigured) return NONE;

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NONE;

  const { data, error } = await supabase
    .from('entitlements')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('entitlement', PRO_ENTITLEMENT)
    .maybeSingle();

  // Signed out or no row is the normal case, not a failure — the feed is
  // browsable anonymously and this must never throw.
  if (error || !data) return NONE;

  const expiresAt = data.expires_at;
  const isPro = expiresAt === null || new Date(expiresAt).getTime() > Date.now();

  return { isPro, expiresAt };
}
