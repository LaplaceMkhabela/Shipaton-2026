import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

/**
 * RevenueCat wrapper. Lane C.
 *
 * Two things make this file look more defensive than a normal SDK binding:
 *
 * 1. `react-native-purchases` is a native module. It does not exist in Expo Go,
 *    and per CLAUDE.md native modules degrade rather than crash — so the import
 *    is lazy and every call returns a null-ish result when the module is
 *    missing. The feed stays browsable; only the paywall says it's unavailable.
 * 2. The SDK is the fast source for UI, never the boundary. Paid content is
 *    gated server-side by `has_pro()` in the edge function. See ./entitlement.
 */

/** The single entitlement. Option A in revenuecat.txt — one 'pro' subscription. */
export const PRO_ENTITLEMENT = 'pro';

const androidKey = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';
const iosKey = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';

const apiKey = Platform.select({ android: androidKey, ios: iosKey, default: '' }) ?? '';

/**
 * RevenueCat Web Billing checkout.
 *
 * On Android the SDK bills through Google Play, which needs a Play developer
 * account we don't have. Web Billing is the way a purchase completes without
 * one, and the Shipaton rules accept an "in-app **or web**" purchase — PLAN.md
 * risk R2. Entitlements still arrive through the same webhook.
 */
export const webBillingUrl = process.env.EXPO_PUBLIC_RC_WEB_BILLING_URL ?? '';

export const isWebBillingConfigured = webBillingUrl.startsWith('http');

/**
 * Opens checkout in a browser sheet and resolves when it closes. Says nothing
 * about whether the purchase succeeded — the caller re-reads entitlement after.
 */
export async function openWebCheckout(userId: string | null): Promise<boolean> {
  if (!isWebBillingConfigured) return false;

  // RevenueCat matches the web purchase to the app user by this id, so a
  // signed-out checkout would strand the entitlement on an anonymous customer.
  if (!userId) return false;

  try {
    const url = new URL(webBillingUrl);
    url.searchParams.set('app_user_id', userId);
    await WebBrowser.openBrowserAsync(url.toString());
    return true;
  } catch {
    return false;
  }
}

export const isPurchasesConfigured = apiKey.length > 0 && !apiKey.includes('your-');

type PurchasesModule = typeof import('react-native-purchases').default;

let cached: PurchasesModule | null | undefined;

/**
 * Resolves the native module, or null where it isn't linked. Cached because a
 * failed require is not cheap and the paywall asks repeatedly.
 */
function getPurchases(): PurchasesModule | null {
  if (cached !== undefined) return cached;
  try {
    // Required lazily: a top-level import throws at startup in Expo Go, which
    // would take the whole app down before the feed ever renders.
    cached = (require('react-native-purchases') as { default: PurchasesModule }).default;
  } catch {
    cached = null;
  }
  return cached;
}

/** True when purchases can actually run here — module present and keyed. */
export function isPurchasesAvailable(): boolean {
  return isPurchasesConfigured && getPurchases() !== null;
}

let configured = false;

/** Idempotent. Safe to call on every mount; only the first call reaches the SDK. */
export async function configurePurchases(): Promise<boolean> {
  if (configured) return true;
  const Purchases = getPurchases();
  if (!Purchases || !isPurchasesConfigured) return false;

  try {
    Purchases.configure({ apiKey });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Ties RevenueCat's customer to the Supabase user id.
 *
 * API.md: skip this and one device's subscription follows whoever signs in
 * next. Anonymous browsing is fine — we simply don't identify until there's
 * a user.
 */
export async function identifyUser(userId: string): Promise<void> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // Identity failure must not block the app; the webhook is the source of
    // truth for entitlements either way.
  }
}

export async function forgetUser(): Promise<void> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // Already anonymous. Nothing to do.
  }
}

/** The current offering, or null when unavailable or empty. */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    // An offering with no packages is the products-not-propagated case in
    // revenuecat.txt §6, not a code bug. Treat it as absent.
    if (!current || current.availablePackages.length === 0) return null;
    return current;
  } catch {
    return null;
  }
}

export type PurchaseResult =
  | { status: 'purchased'; isPro: boolean }
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

/**
 * `cancelled` is deliberately not an error. Dismissing the sheet is a normal
 * thing to do and must never surface a toast — reviewers test exactly this.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return { status: 'unavailable' };

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { status: 'purchased', isPro: hasProEntitlement(customerInfo) };
  } catch (error) {
    if (isUserCancelled(error)) return { status: 'cancelled' };
    return { status: 'error', message: readableError(error) };
  }
}

/** Required by every store's review. Never ship a paywall without it. */
export async function restorePurchases(): Promise<PurchaseResult> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return { status: 'unavailable' };

  try {
    const customerInfo = await Purchases.restorePurchases();
    return { status: 'purchased', isPro: hasProEntitlement(customerInfo) };
  } catch (error) {
    return { status: 'error', message: readableError(error) };
  }
}

/** Client-side entitlement, good enough for UI. Not a content gate. */
export async function getCachedProStatus(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return false;
  try {
    return hasProEntitlement(await Purchases.getCustomerInfo());
  } catch {
    return false;
  }
}

function hasProEntitlement(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[PRO_ENTITLEMENT] !== 'undefined';
}

function isUserCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'userCancelled' in error &&
    Boolean((error as { userCancelled?: boolean }).userCancelled)
  );
}

function readableError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return 'Something went wrong with that purchase.';
}
