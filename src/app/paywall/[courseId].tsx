import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/ui/placeholder';

// Lane C. RevenueCat offerings render here. See DESIGN.md "Paywall".
export default function PaywallScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <Placeholder title="Unlock" note={`RevenueCat paywall for course ${courseId}`} />;
}
