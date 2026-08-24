import React, { useEffect, useRef, useState } from 'react';
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
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { auth } from '@/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

interface GestureDrawerProps {
  children: React.ReactNode;
}

export function GestureDrawer({ children }: GestureDrawerProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const [drawerPosition, setDrawerPosition] = useState(-DRAWER_WIDTH);
  const [user, setUser] = useState<User | null>(null);
  const dragStartPosition = useRef(-DRAWER_WIDTH);
  const drawerPositionRef = useRef(-DRAWER_WIDTH);
  const isDraggingRef = useRef(false);
  const logoutHoldProgress = useRef(new Animated.Value(0)).current;
  const logoutHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => {
      unsubscribe();
      if (logoutHoldTimer.current) {
        clearTimeout(logoutHoldTimer.current);
      }
    };
  }, []);

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
  const userName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const startLogoutHold = () => {
    logoutHoldProgress.setValue(0);
    Animated.timing(logoutHoldProgress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
    logoutHoldTimer.current = setTimeout(async () => {
      logoutHoldTimer.current = null;
      await signOut(auth);
      closeDrawer();
      router.replace('/signin');
    }, 500);
  };

  const cancelLogoutHold = () => {
    if (logoutHoldTimer.current) {
      clearTimeout(logoutHoldTimer.current);
      logoutHoldTimer.current = null;
    }
    logoutHoldProgress.stopAnimation();
    logoutHoldProgress.setValue(0);
  };

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
            {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarInitials}>{userInitials}</Text></View>}
            <View style={styles.profileTextContainer}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>{user?.email || 'Account'}</Text>
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
            <DrawerItem
              icon="sparkles"
              label="AI Assistant"
              isActive={currentPath.includes('AskAIScreen')}
              onPress={() => navigateTo('/(tabs)/AskAIScreen')}
            />
          </View>

          <View style={styles.footerSection}>
            <View style={styles.divider} />
            <HoldLogoutItem onPressIn={startLogoutHold} onPressOut={cancelLogoutHold} progress={logoutHoldProgress} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function HoldLogoutItem({ onPressIn, onPressOut, progress }: { onPressIn: () => void; onPressOut: () => void; progress: Animated.Value }) {
  const fillWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <TouchableOpacity
      style={styles.logoutItem}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.85}
      accessibilityLabel="Hold to log out"
    >
      <Animated.View style={[styles.logoutFill, { width: fillWidth }]} />
      <IconSymbol size={22} name="rectangle.portrait.and.arrow.right" color="#FFFFFF" />
      <Text style={styles.logoutLabel}>Hold to log out</Text>
    </TouchableOpacity>
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
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
  }, []);

  const startHold = () => {
    holdProgress.setValue(0);
    Animated.timing(holdProgress, { toValue: 1, duration: 500, useNativeDriver: false }).start();
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      onPress();
    }, 500);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    holdProgress.stopAnimation();
    holdProgress.setValue(0);
  };

  const holdFillWidth = holdProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <TouchableOpacity
      style={[styles.itemContainer, isActive && styles.activeItemContainer]}
      onPressIn={startHold}
      onPressOut={cancelHold}
      activeOpacity={0.7}
      accessibilityLabel={`Hold to open ${label}`}
    >
      <Animated.View style={[styles.itemHoldFill, { width: holdFillWidth }]} />
      <IconSymbol
        size={22}
        name={icon as any}
        color="#FFFFFF"
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
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#2E8CA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
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
    backgroundColor: 'rgba(46, 140, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46, 140, 166, 0.3)',
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
  itemHoldFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 140, 166, 0.22)',
  },
  footerSection: {
    marginTop: 'auto',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  logoutFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 140, 166, 0.3)',
  },
  logoutLabel: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 14,
  },
});