import { Tabs } from 'expo-router';

import { TopIsland } from '@/components/nav/top-island';

// Floating top navigation (see DESIGN.md). The custom `tabBar` replaces the
// system tab bar entirely — screens are full-bleed and the island floats over
// them, so the bottom of the screen belongs to the feed, not to chrome.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TopIsland {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Learn' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="create" options={{ title: 'Create' }} />
      <Tabs.Screen name="profile" options={{ title: 'You' }} />
    </Tabs>
  );
}