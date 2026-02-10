import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  error?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({ error, style, containerStyle, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor="#9ca3af"
      style={[styles.input, error && styles.error, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  error: {
    borderColor: '#ef4444',
  },
});
