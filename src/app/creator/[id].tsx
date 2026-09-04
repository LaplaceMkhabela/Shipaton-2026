import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/ui/placeholder';

export default function CreatorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Placeholder title="Creator" note={`Creator ${id} — lessons and courses`} />;
}
