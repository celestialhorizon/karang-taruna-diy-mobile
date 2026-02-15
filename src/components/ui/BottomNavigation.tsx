import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface BottomNavigationProps {
  activeTab: 'home' | 'learning' | 'profile';
  onNavigate: (page: string) => void;
  user: any;
}

export function BottomNavigation({ activeTab, onNavigate, user }: BottomNavigationProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => onNavigate('home')}
      >
        <MaterialIcons 
          name="home" 
          size={22} 
          color={activeTab === 'home' ? colors.primary : colors.textSecondary} 
        />
        <Text style={[
          styles.navLabel, 
          { color: activeTab === 'home' ? colors.primary : colors.textSecondary }
        ]}>
          Beranda
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => user ? onNavigate('my-learning') : onNavigate('login')}
      >
        <MaterialIcons 
          name="menu-book" 
          size={22} 
          color={activeTab === 'learning' ? colors.primary : colors.textSecondary} 
        />
        <Text style={[
          styles.navLabel, 
          { color: activeTab === 'learning' ? colors.primary : colors.textSecondary }
        ]}>
          Belajar
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => onNavigate('profile')}
      >
        <MaterialIcons 
          name="person" 
          size={22} 
          color={activeTab === 'profile' ? colors.primary : colors.textSecondary} 
        />
        <Text style={[
          styles.navLabel, 
          { color: activeTab === 'profile' ? colors.primary : colors.textSecondary }
        ]}>
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    borderTopWidth: 1, 
    flexDirection: 'row', 
    paddingVertical: 8 
  },
  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    gap: 2 
  },
  navLabel: { 
    fontSize: 12 
  }
});
