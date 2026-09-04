import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/ui/placeholder';

// The funnel destination: where a free lesson sends a viewer.
export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Placeholder title="Course" note={`Course ${id} — free lessons, then the paywall`} />;
}
