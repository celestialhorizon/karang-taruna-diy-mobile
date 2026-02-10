import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ProgressProps {
  value: number;
  style?: ViewStyle;
  height?: number;
}

export function Progress({ value, style, height = 6 }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${clampedValue}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: '#dc2626',
    borderRadius: 9999,
  },
});
