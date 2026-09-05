import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, type ViewToken } from 'react-native';

import { Colors, Space } from '@/constants/theme';
import type { FeedLesson } from '@/lib/supabase/feed';
import { FeedItem } from './feed-item';

export function FeedPager({
  lessons,
  onEndReached,
  isFetchingNextPage,
}: {
  lessons: FeedLesson[];
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
}) {
  // Measured, not Dimensions.get('window'). Window height ignores the native
  // tab bar and safe-area insets, which makes every snap land slightly off.
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Both of these must keep a stable identity across renders — React Native
  // throws "Changing onViewableItemsChanged on the fly is not supported".
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setActiveIndex(first.index);
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: FeedLesson; index: number }) => (
      <FeedItem lesson={item} isActive={index === activeIndex} height={height} />
    ),
    [activeIndex, height]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<FeedLesson> | null | undefined, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [height]
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => setHeight(Math.round(e.nativeEvent.layout.height))}>
      {height > 0 ? (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          // Mounted-but-inactive neighbours are the preload: ±1 warm player
          // without maintaining a manual pool.
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews
          onEndReached={onEndReached}
          onEndReachedThreshold={2}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={Colors.text} />
            ) : null
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  footer: { paddingVertical: Space.md },
});
