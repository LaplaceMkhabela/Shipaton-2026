import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FeedPager } from '@/components/feed/feed-pager';
import { Colors, Space, Type } from '@/constants/theme';
import { useFeed } from '@/hooks/queries/use-feed';

export default function FeedScreen() {
  const { data, isPending, isError, refetch, fetchNextPage, isFetchingNextPage } = useFeed();

  if (isPending) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>Couldn't load the feed.</Text>
        <Pressable onPress={() => refetch()} accessibilityRole="button">
          <Text style={styles.retry}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const lessons = data.pages.flat();

  return (
    <>
      <StatusBar style="light" />
      <FeedPager
        lessons={lessons}
        onEndReached={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
  },
  errorText: { ...Type.body, color: Colors.textMuted },
  retry: { ...Type.body, color: Colors.free, fontWeight: '700' },
});
