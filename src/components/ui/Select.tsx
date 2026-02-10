import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, ViewStyle } from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  style?: ViewStyle;
}

export function Select({ value, onValueChange, options, placeholder = 'Pilih...', style }: SelectProps) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={styles.trigger}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>{selectedLabel}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                  style={[styles.option, item.value === value && styles.selectedOption]}
                >
                  <Text style={[styles.optionText, item.value === value && styles.selectedOptionText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  triggerText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  placeholder: {
    color: '#9ca3af',
  },
  arrow: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: 300,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#fef2f2',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
