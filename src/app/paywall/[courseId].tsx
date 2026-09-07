import { router, useLocalSearchParams } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, MinTouchTarget, Radius, Space, TabularNums, Type } from '@/constants/theme';
import { getSeedCourse } from '@/lib/seed/courses';
import { usePurchases } from '@/providers/purchases-provider';

/**
 * The paywall. Lane C.
 *
 * DESIGN.md: the only full-opacity screen in the app. Violet wash, outcome
 * bullets rather than a feature list, and the free lessons already watched
 * listed with lime checkmarks — value delivered before value asked for.
 *
 * What we sell is Pro, not this course (Option A in revenuecat.txt), so the
 * bullets are all-access framing anchored to the course that brought you here.
 */
export default function PaywallScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const course = getSeedCourse(courseId);
  const { isAvailable, isLoading, isPro, offering, purchase, restore, canCheckoutOnWeb, checkoutOnWeb } =
    usePurchases();

  const packages = offering?.availablePackages ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    packages.find((p) => p.identifier === selectedId) ?? packages[0] ?? null;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watched = course?.lessons.filter((l) => l.access === 'free' && l.watched) ?? [];

  async function onPurchase() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const result = await purchase(selected);
    setBusy(false);

    // Dismissing the sheet is not an error and gets no message.
    if (result.status === 'cancelled') return;
    if (result.status === 'purchased') return router.back();
    setError(
      result.status === 'unavailable'
        ? 'Purchases need a development build — this is Expo Go.'
        : result.message
    );
  }

  async function onWebCheckout() {
    setBusy(true);
    setError(null);
    const opened = await checkoutOnWeb();
    setBusy(false);
    if (!opened) setError('Web checkout is unavailable. Sign in first, or try again later.');
  }

  async function onRestore() {
    setBusy(true);
    setError(null);
    const result = await restore();
    setBusy(false);

    if (result.status === 'purchased') {
      if (result.isPro) return router.back();
      return setError('No previous purchase found on this account.');
    }
    if (result.status === 'error') setError(result.message);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Violet wash, layered rather than a gradient dependency. */}
      <View style={styles.washTop} pointerEvents="none" />
      <View style={styles.washMid} pointerEvents="none" />

      <View style={styles.bar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.close}>
          <Text style={styles.closeGlyph}>×</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pro</Text>
        </View>

        <Text style={styles.hero}>
          {course ? `Finish ${course.title}` : 'Unlock every lesson'}
        </Text>
        {course ? <Text style={styles.sub}>{course.subtitle}</Text> : null}

        <View style={styles.outcomes}>
          <Outcome
            text={
              course
                ? `Watch all ${course.lessonCount} lessons in this course, start to end`
                : 'Watch every course start to end'
            }
          />
          <Outcome text="Unlock every paid lesson from every creator, not just this one" />
          <Outcome text="Cancel anytime — your watch time is what pays the creators you learn from" />
        </View>

        {watched.length > 0 ? (
          <View style={styles.proof}>
            <Text style={styles.proofLabel}>Already yours, free</Text>
            {watched.map((lesson) => (
              <View key={lesson.id} style={styles.proofRow}>
                <Text style={styles.proofTick}>✓</Text>
                <Text style={styles.proofText} numberOfLines={1}>
                  {lesson.title}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {packages.length > 1 ? (
          <View style={styles.packages}>
            {packages.map((pkg) => (
              <PackageRow
                key={pkg.identifier}
                pkg={pkg}
                selected={selected?.identifier === pkg.identifier}
                onSelect={() => setSelectedId(pkg.identifier)}
              />
            ))}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.foot}>
        {isPro ? (
          <>
            <Button label="You're on Pro" variant="paid" disabled onPress={() => {}} />
            <Text style={styles.footNote}>Everything is already unlocked.</Text>
          </>
        ) : (
          <>
            {/* Store billing when the SDK has products; otherwise Web Billing,
                which is how a purchase completes with no Play account (R2). */}
            {selected ? (
              <Button
                label={`Continue — ${selected.product.priceString}`}
                variant="paid"
                loading={busy || isLoading}
                onPress={onPurchase}
              />
            ) : (
              <Button
                label="Continue in browser"
                variant="paid"
                loading={busy || isLoading}
                disabled={!canCheckoutOnWeb}
                onPress={onWebCheckout}
              />
            )}
            <Text style={styles.footNote}>
              {selected
                ? // Never hardcode a price: it is wrong in every other currency.
                  `${selected.product.priceString} · billed through the store · cancel anytime`
                : canCheckoutOnWeb
                  ? 'Checkout opens in your browser. Access unlocks here as soon as it clears.'
                  : isAvailable
                    ? 'Plans are still loading. Products can take a few hours to appear after setup.'
                    : 'Purchases need a development build with RevenueCat configured.'}
            </Text>
            <Pressable
              onPress={onRestore}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              style={styles.restore}>
              <Text style={styles.restoreText}>Restore purchases</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Outcome({ text }: { text: string }) {
  return (
    <View style={styles.outcomeRow}>
      <View style={styles.outcomeDot} />
      <Text style={styles.outcomeText}>{text}</Text>
    </View>
  );
}

function PackageRow({
  pkg,
  selected,
  onSelect,
}: {
  pkg: PurchasesPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${pkg.product.title}, ${pkg.product.priceString}`}
      style={[styles.pkg, selected && styles.pkgSelected]}>
      <View style={styles.pkgText}>
        <Text style={styles.pkgTitle}>{pkg.product.title}</Text>
        {pkg.product.description ? (
          <Text style={styles.pkgDesc} numberOfLines={1}>
            {pkg.product.description}
          </Text>
        ) : null}
      </View>
      <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  washTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(124,92,255,0.20)',
  },
  washMid: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(124,92,255,0.07)',
  },

  bar: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Space.sm },
  close: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: { color: Colors.text, fontSize: 30, lineHeight: 34 },

  body: { paddingHorizontal: Space.lg, paddingBottom: Space.xl, gap: Space.md },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Space.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.paid,
    backgroundColor: 'rgba(124,92,255,0.16)',
  },
  badgeText: {
    ...Type.micro,
    color: Colors.paid,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  hero: { ...Type.hero, color: Colors.text },
  sub: { ...Type.body, color: Colors.textMuted },

  outcomes: { gap: Space.sm, marginTop: Space.sm },
  outcomeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.sm },
  outcomeDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.paid,
    marginTop: 8,
  },
  outcomeText: { ...Type.body, color: Colors.text, flex: 1 },

  // Lime, because this is what's already free. Never violet here.
  proof: {
    gap: Space.xs,
    marginTop: Space.sm,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  proofLabel: {
    ...Type.micro,
    color: Colors.free,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: Space.xs,
  },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  proofTick: { ...Type.caption, color: Colors.free, width: 14 },
  proofText: { ...Type.caption, color: Colors.textMuted, flex: 1 },

  packages: { gap: Space.sm, marginTop: Space.sm },
  pkg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    minHeight: MinTouchTarget + 12,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pkgSelected: { borderColor: Colors.paid, backgroundColor: Colors.surfaceHi },
  pkgText: { flex: 1, gap: 2 },
  pkgTitle: { ...Type.caption, color: Colors.text, fontWeight: '700' },
  pkgDesc: { ...Type.micro, color: Colors.textFaint },
  pkgPrice: { ...Type.caption, color: Colors.text, fontWeight: '700', ...TabularNums },

  error: { ...Type.caption, color: Colors.danger, marginTop: Space.sm },

  foot: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
    paddingBottom: Space.md,
    gap: Space.sm,
  },
  footNote: { ...Type.micro, color: Colors.textFaint, textAlign: 'center' },
  restore: { minHeight: MinTouchTarget, alignItems: 'center', justifyContent: 'center' },
  restoreText: { ...Type.micro, color: Colors.textMuted, textDecorationLine: 'underline' },
});
