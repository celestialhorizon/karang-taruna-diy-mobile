import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
}

export function Button({ children, onPress, variant = 'default', disabled, style, textStyle, loading }: ButtonProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e5e7eb' };
      case 'secondary':
        return { backgroundColor: '#f3f4f6' };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: '#dc2626' };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
        return '#374151';
      case 'secondary':
        return '#374151';
      case 'ghost':
        return '#374151';
      default:
        return '#ffffff';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        getVariantStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        typeof children === 'string' ? (
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{children}</Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
