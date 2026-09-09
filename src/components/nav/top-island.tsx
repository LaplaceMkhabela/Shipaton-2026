import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';

import { Colors, Radius, Space, Type } from '@/constants/theme';

type Glyph = ComponentProps<typeof MaterialIcons>['name'];

const TABS: Record<string, { label: string; icon: Glyph }> = {
  index: { label: 'Learn', icon: 'school' },
  search: { label: 'Search', icon: 'search' },
  create: { label: 'Create', icon: 'add-circle-outline' },
  profile: { label: 'You', icon: 'person-outline' },
};

/**
 * Floating top navigation island (see DESIGN.md). Rendered as the tab bar
 * slot (BottomTabView's `tabBar`), so the default bar is gone and this
 * floats over the full-bleed feed instead of reserving its own space.
 */
export function TopIsland({ state, navigation, insets }: BottomTabBarProps) {
  const { routes, index: activeIndex } = state;

  return (
    <View style={[styles.pill, { top: insets.top + Space.sm }]} accessibilityRole="tablist">
      {routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;
        const active = index === activeIndex;
        const color = active ? Colors.text : Colors.textMuted;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={config.label}
            onPress={() => navigation.navigate(route.name)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <MaterialIcons name={config.icon} size={18} color={color} />
            <Text style={[styles.label, { color }, active && styles.labelActive]}>
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    paddingHorizontal: Space.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.scrimTop,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs,
    borderRadius: Radius.pill,
  },
  itemPressed: { opacity: 0.7 },
  label: { ...Type.caption, fontWeight: '600' },
  labelActive: { fontWeight: '800' },
});