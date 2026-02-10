import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Label({ children, style }: LabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
});
