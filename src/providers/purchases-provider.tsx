import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  configurePurchases,
  forgetUser,
  getCachedProStatus,
  getCurrentOffering,
  identifyUser,
  isPurchasesAvailable,
  isWebBillingConfigured,
  openWebCheckout,
  purchasePackage,
  restorePurchases,
  type PurchaseResult,
} from '@/lib/purchases/client';
import { getMyEntitlement } from '@/lib/purchases/entitlement';
import { useAuth } from '@/providers/auth-provider';

type PurchasesState = {
  /** Native module present and keyed. False in Expo Go — degrade, don't crash. */
  isAvailable: boolean;
  isLoading: boolean;
  /** UI-level access. Paid video is still gated server-side by `has_pro()`. */
  isPro: boolean;
  offering: PurchasesOffering | null;
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  refresh: () => Promise<void>;
  /** Web Billing is usable: a checkout URL is set and someone is signed in. */
  canCheckoutOnWeb: boolean;
  /** Opens web checkout, then reconciles entitlement when the sheet closes. */
  checkoutOnWeb: () => Promise<boolean>;
};

const PurchasesContext = createContext<PurchasesState>({
  isAvailable: false,
  isLoading: true,
  isPro: false,
  offering: null,
  purchase: async () => ({ status: 'unavailable' }),
  restore: async () => ({ status: 'unavailable' }),
  refresh: async () => {},
  canCheckoutOnWeb: false,
  checkoutOnWeb: async () => false,
});

/**
 * Owns RevenueCat's lifecycle. Lane C.
 *
 * Sits inside AuthProvider because identity is derived from the Supabase
 * session: sign-in calls `logIn(user.id)`, sign-out calls `logOut()`. Doing it
 * here rather than in the auth calls keeps the two lanes from editing each
 * other's files, and means a session restored from storage identifies too.
 */
export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [isAvailable, setIsAvailable] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    let active = true;

    configurePurchases()
      .then(async (ok) => {
        if (!active) return;
        setIsAvailable(ok && isPurchasesAvailable());
        if (ok) {
          const current = await getCurrentOffering();
          if (active) setOffering(current);
        }
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Identity follows the session. Without this, one device's subscription
  // follows whoever signs in next — see API.md.
  useEffect(() => {
    if (!isReady) return;
    if (userId) {
      void identifyUser(userId);
    } else {
      void forgetUser();
    }
  }, [isReady, userId]);

  const refresh = useCallback(async () => {
    // The database row is authoritative; the SDK's cached answer is the
    // fallback for the window before the webhook lands.
    const [server, cached] = await Promise.all([getMyEntitlement(), getCachedProStatus()]);
    setIsPro(server.isPro || cached);
  }, []);

  useEffect(() => {
    if (!isReady || authLoading) return;
    void refresh();
  }, [isReady, authLoading, userId, refresh]);

  const purchase = useCallback(
    async (pkg: PurchasesPackage) => {
      const result = await purchasePackage(pkg);
      if (result.status === 'purchased') {
        setIsPro(result.isPro);
        // Don't wait on the webhook to unlock the UI; reconcile in the
        // background so the server answer wins if they disagree.
        void refresh();
      }
      return result;
    },
    [refresh]
  );

  const restore = useCallback(async () => {
    const result = await restorePurchases();
    if (result.status === 'purchased') {
      setIsPro(result.isPro);
      void refresh();
    }
    return result;
  }, [refresh]);

  const checkoutOnWeb = useCallback(async () => {
    const opened = await openWebCheckout(userId);
    // The browser sheet can't report success, so re-read entitlement on return.
    // The webhook may still be in flight; refresh again on the next mount.
    if (opened) await refresh();
    return opened;
  }, [userId, refresh]);

  const value = useMemo<PurchasesState>(
    () => ({
      isAvailable,
      isLoading: !isReady || authLoading,
      isPro,
      offering,
      purchase,
      restore,
      refresh,
      canCheckoutOnWeb: isWebBillingConfigured && userId !== null,
      checkoutOnWeb,
    }),
    [
      isAvailable,
      isReady,
      authLoading,
      isPro,
      offering,
      purchase,
      restore,
      refresh,
      userId,
      checkoutOnWeb,
    ]
  );

  return <PurchasesContext value={value}>{children}</PurchasesContext>;
}

export function usePurchases() {
  return use(PurchasesContext);
}
