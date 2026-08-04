import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureDrawer } from '@/components/GestureDrawer';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <GestureDrawer>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tintColor,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }: { color?: string }) => <IconSymbol size={28} name="house.fill" color={color ?? tintColor} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }: { color?: string }) => <IconSymbol size={28} name="paperplane.fill" color={color ?? tintColor} />,
          }}
        />
        <Tabs.Screen
          name="fishSpecies"
          options={{
            title: 'Fish Species',
            tabBarIcon: ({ color }: { color?: string }) => <IconSymbol size={28} name="fish.fill" color={color ?? tintColor} />,
          }}
        />
        <Tabs.Screen
          name="plantSpecies"
          options={{
            title: 'Plant Species',
            tabBarIcon: ({ color }: { color?: string }) => <IconSymbol size={28} name="leaf.fill" color={color ?? tintColor} />,
          }}
        />
        <Tabs.Screen
          name="waterTest"
          options={{
            title: 'Water Test',
            tabBarIcon: ({ color }: { color?: string }) => <IconSymbol size={28} name="drop.fill" color={color ?? tintColor} />,
          }}
        />
        <Tabs.Screen
          name="waterTestDetails"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureDrawer>
  );
}