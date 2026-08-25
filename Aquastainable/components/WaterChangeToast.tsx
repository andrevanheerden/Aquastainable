import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, StyleSheet, Text, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebase';
import { useTankApi } from '@/app/hooks/useTankApi';
import useWaterTestApi, { WaterTestRecord } from '@/app/hooks/useWaterTestApi';

type Reminder = {
  id: string;
  tankName: string;
  reminder: string;
};

export default function WaterChangeToast() {
  const { getUserTanks } = useTankApi();
  const { getTankWaterTests } = useWaterTestApi();
  const [visible, setVisible] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const shownUserRef = useRef<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = null;
    Animated.timing(translateX, { toValue: -420, duration: 180, useNativeDriver: true }).start(() => setVisible(false));
  }, [translateX]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        shownUserRef.current = null;
        return;
      }
      if (shownUserRef.current === user.uid) return;
      shownUserRef.current = user.uid;

      try {
        const tanks = await getUserTanks(user.uid);
        const nextReminders = await Promise.all((Array.isArray(tanks) ? tanks : []).map(async (tank) => {
          const tankDocumentId = tank.id || tank.tankId;
          const tests = await getTankWaterTests(tankDocumentId).catch(() => [] as WaterTestRecord[]);
          const latestTest = [...tests].sort((left, right) => new Date(right.testedAt).getTime() - new Date(left.testedAt).getTime())[0];
          return {
            id: String(tankDocumentId),
            tankName: tank.tankName || 'Unnamed tank',
            reminder: latestTest?.nextWaterChange || 'Water change timing is not available yet.',
          };
        }));

        if (!nextReminders.length) return;
        setReminders(nextReminders);
        translateX.setValue(0);
        setVisible(true);
        dismissTimer.current = setTimeout(dismiss, 15000);
      } catch {
        // A reminder should never block the user from entering the app.
      }
    });

    return () => {
      unsubscribe();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [dismiss, getTankWaterTests, getUserTanks, translateX]);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dx < -8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -70) dismiss();
      else Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    },
  })).current;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={dismiss}>
      <View pointerEvents="box-none" style={styles.modalLayer}>
        <Animated.View {...panResponder.panHandlers} style={[styles.toastStack, { transform: [{ translateX }] }]}>
          {reminders.map((item) => (
            <View key={item.id} style={styles.toast}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.eyebrow}>AQUA CARE</Text>
                  <Text style={styles.title}>Water change reminder</Text>
                </View>
              </View>
              <View style={styles.reminderRow}>
                <View style={styles.dot} />
                <View style={styles.reminderText}>
                  <Text style={styles.tankName}>{item.tankName}</Text>
                  <Text style={styles.reminder}>{item.reminder}</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalLayer: {
    flex: 1,
  },
  toastStack: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 20,
    gap: 10,
  },
  toast: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#17232A',
    borderWidth: 1,
    borderColor: 'rgba(137, 217, 224, 0.35)',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  eyebrow: { color: '#7FD5D9', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginTop: 3 },
  reminderRow: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 9, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 10, backgroundColor: '#F2B66D' },
  reminderText: { flex: 1 },
  tankName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  reminder: { color: '#B8C8CC', fontSize: 12, marginTop: 2 },
});
