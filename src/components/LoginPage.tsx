import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';
import { Label } from './ui/Label';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userData: any) => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const user = await apiService.login(formData.email, formData.password);
        
        // Debug: Log user data
        console.log('=== LOGIN DEBUG ===');
        console.log('Login response:', user);
        console.log('User name:', user.name);
        console.log('User username:', user.username);
        console.log('User object keys:', Object.keys(user));
        console.log('==================');
        
        // Save user data to AsyncStorage
        await AsyncStorage.setItem('diy_current_user', JSON.stringify(user));
        
        Toast.show({ type: 'success', text1: `Selamat datang, ${user.name || user.username}!` });
        onLogin(user);
        onNavigate('home');
      } catch (error: any) {
        setErrors({ password: error.message || 'Email atau password salah' });
        Toast.show({ 
          type: 'error', 
          text1: 'Login gagal', 
          text2: error.message || 'Periksa kembali email dan password Anda.' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Login</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size={60} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Selamat Datang Kembali!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Masuk untuk melanjutkan belajar</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={{ gap: 16 }}>
            <View>
              <Label>Email</Label>
              <Input
                placeholder="nama@email.com"
                value={formData.email}
                onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View>
              <Label>Password</Label>
              <Input
                placeholder="Masukkan password"
                value={formData.password}
                onChangeText={(text: string) => setFormData({ ...formData, password: text })}
                secureTextEntry
                error={!!errors.password}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <Button onPress={handleSubmit} style={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Login</Text>
              )}
            </Button>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => onNavigate('register')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Daftar di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  backIcon: { fontSize: 28, color: '#374151', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  content: { paddingHorizontal: 16, paddingVertical: 32, alignItems: 'center' },
  logoContainer: { marginBottom: 24 },
  logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  submitBtn: { marginTop: 8, height: 52, backgroundColor: '#dc2626' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6b7280' },
  footerLink: { fontSize: 14, color: '#dc2626', fontWeight: '600' },
});
