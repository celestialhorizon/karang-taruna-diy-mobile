import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  error?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({ error, style, containerStyle, ...props }: InputProps) {
  const { colors } = useTheme();
  
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.input, 
        {
          borderColor: error ? '#ef4444' : colors.border,
          color: colors.text,
          backgroundColor: colors.card,
        },
        error && styles.error,
        style
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  error: {
    borderWidth: 2,
  },
});
