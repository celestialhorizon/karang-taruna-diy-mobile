import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  style?: any;
}

export function Logo({ size = 40, style }: LogoProps) {
  // Using require with the correct path
  const logoSource = require('../../../assets/images/logo.png');
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="Karang Taruna Logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
