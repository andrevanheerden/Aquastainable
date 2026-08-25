import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  onHold: () => void;
  label?: string;
};

export default function HoldToOpenButton({ onHold, label = 'Hold to add water test' }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  const start = () => {
    triggered.current = false;
    timer.current = setTimeout(() => {
      triggered.current = true;
      onHold();
    }, 500);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPressIn={start}
      onPressOut={cancel}
      onPress={cancel}
      activeOpacity={0.8}
      accessibilityLabel={label}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#1B1D26', borderRadius: 18, paddingVertical: 15, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  text: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
