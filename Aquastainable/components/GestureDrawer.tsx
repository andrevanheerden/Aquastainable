import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

interface GestureDrawerProps {
  children: React.ReactNode;
}

export function GestureDrawer({ children }: GestureDrawerProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const [drawerPosition, setDrawerPosition] = useState(-DRAWER_WIDTH);
  const dragStartPosition = useRef(-DRAWER_WIDTH);
  const drawerPositionRef = useRef(-DRAWER_WIDTH);
  const isDraggingRef = useRef(false);

  const openDrawer = () => {
    drawerPositionRef.current = 0;
    setDrawerPosition(0);
  };
  const closeDrawer = () => {
    drawerPositionRef.current = -DRAWER_WIDTH;
    setDrawerPosition(-DRAWER_WIDTH);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        dragStartPosition.current = drawerPositionRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isDraggingRef.current) {
          return;
        }

        const nextPosition = Math.min(0, Math.max(-DRAWER_WIDTH, dragStartPosition.current + gestureState.dx));
        drawerPositionRef.current = nextPosition;
        setDrawerPosition(nextPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        isDraggingRef.current = false;

        const dragDistance = gestureState.dx;
        const shouldOpen = dragDistance > DRAWER_WIDTH * 0.3 || gestureState.vx > 0.25;
        if (shouldOpen || drawerPositionRef.current > -DRAWER_WIDTH * 0.5) {
          openDrawer();
        } else {
          closeDrawer();
        }
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        if (drawerPositionRef.current > -DRAWER_WIDTH * 0.5) {
          openDrawer();
        } else {
          closeDrawer();
        }
      },
    })
  ).current;

  const drawerAnimatedStyle = {
    transform: [{ translateX: drawerPosition }],
  };
  const backdropOpacity = Math.min(0.65, Math.max(0, (drawerPosition + DRAWER_WIDTH) / DRAWER_WIDTH));
  const handleOpacity = Math.max(0, Math.min(1, 1 - (drawerPosition + DRAWER_WIDTH + 10) / 40));
  const pointerEvents = drawerPosition > -DRAWER_WIDTH + 10 ? 'auto' : 'none';

  const navigateTo = (path: string) => {
    closeDrawer();
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>{children}</View>

      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, pointerEvents, backgroundColor: 'rgba(17, 24, 28, 0.72)' }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View style={[styles.drawerPanel, drawerAnimatedStyle]}>
        <Animated.View style={[styles.pullHandleContainer, { opacity: handleOpacity }]} {...panResponder.panHandlers}>
          <View style={styles.pullHandlePill} />
        </Animated.View>

        <View style={styles.drawerInnerContent}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.avatar}
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.userName}>André van Heerden</Text>
              <Text style={styles.userRole}>3 Active Aquariums</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.navSection}>
            <DrawerItem
              icon="house.fill"
              label="Dashboard & Tanks"
              isActive={currentPath.includes('home')}
              onPress={() => navigateTo('/(tabs)/home')}
            />
            <DrawerItem
              icon="fish.fill"
              label="Fish Species"
              isActive={currentPath.includes('fishSpecies')}
              onPress={() => navigateTo('/(tabs)/fishSpecies')}
            />
            <DrawerItem
              icon="leaf.fill"
              label="Plant Species"
              isActive={currentPath.includes('plantSpecies')}
              onPress={() => navigateTo('/(tabs)/plantSpecies')}
            />
            <DrawerItem
              icon="drop.fill"
              label="Water Test"
              isActive={currentPath.includes('waterTest')}
              onPress={() => navigateTo('/(tabs)/waterTest')}
            />
          </View>

          <View style={styles.footerSection}>
            <View style={styles.divider} />
            <DrawerItem icon="gearshape.fill" label="Settings & Account" isActive={false} onPress={() => {}} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// --- Sub-component for Menu Rows ---
function DrawerItem({
  icon,
  label,
  isActive,
  onPress,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, isActive && styles.activeItemContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconSymbol
        size={22}
        name={icon as any}
        color={isActive ? Colors.primary : Colors.lightBlue}
      />
      <Text style={[styles.itemLabel, isActive && styles.activeItemLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 28, 0.72)',
    zIndex: 99,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.dark.background,
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  pullHandleContainer: {
    position: 'absolute',
    right: -24,
    top: '42%',
    width: 24,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pullHandlePill: {
    width: 5,
    height: 48,
    borderRadius: 3,
    backgroundColor: Colors.light.tint,
  },
  drawerInnerContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justify: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileTextContainer: {
    marginLeft: 14,
  },
  userName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userRole: {
    color: Colors.dark.icon,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 18,
  },
  navSection: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  activeItemContainer: {
    backgroundColor: 'rgba(214, 22, 75, 0.12)', // Subtle crimson backlight
    borderWidth: 1,
    borderColor: 'rgba(214, 22, 75, 0.3)',
  },
  itemLabel: {
    color: Colors.dark.icon,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 14,
  },
  activeItemLabel: {
    color: Colors.dark.text,
    fontWeight: '700',
  },
  footerSection: {
    marginTop: 'auto',
  },
});