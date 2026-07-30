// @ts-nocheck
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      {/* @ts-ignore */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: (props: any) => <IconSymbol size={28} name="house.fill" color={tintColor} />,
        } as any}
      />
      {/* @ts-ignore */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: (props: any) => <IconSymbol size={28} name="paperplane.fill" color={tintColor} />,
        } as any}
      />
    </Tabs>
  );
}
