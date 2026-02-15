import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ImageWithFallback } from './ImageWithFallback';
import { useTheme } from '../../context/ThemeContext';

interface ImageZoomModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageZoomModal({ visible, imageUrl, onClose }: ImageZoomModalProps) {
  const { colors } = useTheme();
  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);

  if (!imageUrl) return null;

  const handlePinchGestureStart = () => {
    setLastScale(scale);
  };

  const handlePinchGestureChange = (event: any) => {
    const newScale = lastScale * event.nativeEvent.scale;
    setScale(Math.min(Math.max(newScale, 1), 3)); // Limit scale between 1 and 3
  };

  const handleDoubleTap = () => {
    setScale(scale === 1 ? 2 : 1);
  };

  const resetScale = () => {
    setScale(1);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Gambar Langkah</Text>
          <TouchableOpacity onPress={resetScale} style={styles.resetBtn}>
            <MaterialIcons name="zoom-out-map" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Image Container */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          centerContent
        >
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={handleDoubleTap}
            activeOpacity={1}
          >
            <ImageWithFallback
              src={imageUrl}
              alt="Step image"
              style={{
                width: '100%',
                height: 300,
                resizeMode: 'contain',
                transform: [{ scale }]
              }}
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.card }]}>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • Ketuk dua kali untuk zoom in/out
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • Usap untuk berpindah
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • Tombol reset untuk ukuran normal
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  closeBtn: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetBtn: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  instructions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionText: {
    fontSize: 12,
    marginBottom: 2,
  },
});
