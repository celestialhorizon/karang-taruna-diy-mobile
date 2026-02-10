import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle } from 'react-native';

interface ImageWithFallbackProps {
  src: string;
  alt?: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

export function ImageWithFallback({ src, alt, style, containerStyle }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  if (didError || !src) {
    return (
      <View style={[styles.fallback, containerStyle, style as any]}>
        <View style={styles.fallbackInner}>
          <View style={styles.fallbackIcon}>
            <View style={styles.iconRect} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      style={[styles.image, style]}
      onError={() => setDidError(true)}
      resizeMode="cover"
      accessibilityLabel={alt}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 192,
  },
  fallback: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 192,
  },
  fallbackInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    opacity: 0.3,
  },
  iconRect: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 6,
  },
});
