import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, variant === 'secondary' ? styles.secondary : styles.default, style]}>
      {typeof children === 'string' ? (
        <Text style={[styles.text, variant === 'secondary' ? styles.secondaryText : styles.defaultText, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: '#dc2626',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  defaultText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#374151',
  },
});
