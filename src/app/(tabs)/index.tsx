import { StatusBar } from 'expo-status-bar';

import { FeedPager } from '@/components/feed/feed-pager';
import { seedLessons } from '@/lib/seed/lessons';

// Lane A. Seed data for now — swaps to getFeed() per API.md once issue #1 lands.
export default function FeedScreen() {
  return (
    <>
      <StatusBar style="light" />
      <FeedPager lessons={seedLessons} />
    </>
  );
}
