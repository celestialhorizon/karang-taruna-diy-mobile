import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  style?: ViewStyle;
}

export function Checkbox({ checked, onCheckedChange, style }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={() => onCheckedChange(!checked)}
      activeOpacity={0.7}
      style={[styles.checkbox, checked && styles.checked, style]}
    >
      {checked && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
});
