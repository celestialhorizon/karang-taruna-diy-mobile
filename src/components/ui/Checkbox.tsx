import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  style?: ViewStyle;
}

export function Checkbox({ checked, onCheckedChange, style }: CheckboxProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={() => onCheckedChange(!checked)}
      activeOpacity={0.7}
      style={[
        styles.checkbox, 
        {
          borderColor: colors.border,
          backgroundColor: checked ? colors.primary : 'transparent',
        },
        style
      ]}
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
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
});
