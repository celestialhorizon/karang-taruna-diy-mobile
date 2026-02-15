import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Logo } from './ui/Logo';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';
import { ThemeToggle } from './ui/ThemeToggle';
import { Select } from './ui/Select';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/api';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const CATEGORIES = ['Pertukangan Kayu', 'Pengecatan', 'Listrik', 'Plambing', 'Perawatan'];
const SKILL_LEVELS = [
  { label: 'Pemula', value: 'Pemula' },
  { label: 'Menengah', value: 'Menengah' },
  { label: 'Mahir', value: 'Mahir' },
];

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '',
    karangTarunaName: '', provinsi: '', kabupatenKota: '', kecamatan: '', jalan: '',
    phone: '', interests: [] as string[], skillLevel: '', peranAnggota: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Nama lengkap wajib diisi';
    if (!formData.username.trim()) e.username = 'Username wajib diisi';
    if (!formData.email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Format email tidak valid';
    if (!formData.password) e.password = 'Password wajib diisi';
    else if (formData.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Password tidak sama';
    if (!formData.karangTarunaName.trim()) e.karangTarunaName = 'Nama karang taruna wajib diisi';
    if (!formData.peranAnggota.trim()) e.peranAnggota = 'Peran anggota wajib diisi';
    if (!formData.provinsi.trim()) e.provinsi = 'Provinsi wajib diisi';
    if (!formData.kabupatenKota.trim()) e.kabupatenKota = 'Kabupaten/Kota wajib diisi';
    if (!formData.kecamatan.trim()) e.kecamatan = 'Kecamatan wajib diisi';
    if (!formData.jalan.trim()) e.jalan = 'Jalan wajib diisi';
    if (!formData.phone.trim()) e.phone = 'Nomor telepon wajib diisi';
    
    setErrors(e);
    
    // Auto scroll to first error field
    if (Object.keys(e).length > 0) {
      const firstErrorField = Object.keys(e)[0];
      setTimeout(() => {
        // Find the field and scroll to it
        const fieldOrder = ['name', 'username', 'email', 'password', 'confirmPassword', 'karangTarunaName', 'peranAnggota', 'provinsi', 'kabupatenKota', 'kecamatan', 'jalan', 'phone', 'skillLevel'];
        const fieldIndex = fieldOrder.indexOf(firstErrorField);
        if (fieldIndex !== -1 && scrollViewRef.current) {
          // Scroll to approximate position of the error field
          const scrollPosition = fieldIndex * 100; // Approximate height per field
          scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
        }
      }, 100);
    }
    
    return Object.keys(e).length === 0;
  };

  const handleInterestChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked ? [...prev.interests, category] : prev.interests.filter(i => i !== category),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await apiService.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        karangTarunaName: formData.karangTarunaName,
        provinsi: formData.provinsi,
        kabupatenKota: formData.kabupatenKota,
        kecamatan: formData.kecamatan,
        jalan: formData.jalan,
        phone: formData.phone,
        interests: formData.interests,
        skillLevel: formData.skillLevel,
        peranAnggota: formData.peranAnggota,
      });
      
      // Save user data to AsyncStorage
      await AsyncStorage.setItem('diy_current_user', JSON.stringify(user));
      
      Toast.show({ 
        type: 'success', 
        text1: 'Registrasi berhasil!', 
        text2: `Selamat bergabung, ${user.username}!` 
      });
      
      // Navigate to home after successful registration
      onNavigate('home');
    } catch (error: any) {
      console.log('Registration error:', error); // Debug log
      console.log('Error data:', error.data); // Debug backend response
      
      // Extract detailed error from backend response
      let errorMessage = 'Registrasi gagal';
      let errorField = 'email'; // default field
      
      if (error.data) {
        // Prioritize errors object over message
        if (error.data.errors && typeof error.data.errors === 'object') {
          // Get first error from object
          const firstField = Object.keys(error.data.errors)[0];
          const firstError = Object.values(error.data.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
          errorField = firstField;
        } else if (error.data.errors && Array.isArray(error.data.errors)) {
          // If errors is an array, join them
          errorMessage = error.data.errors.join(', ');
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.error) {
          errorMessage = error.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Final error message:', errorMessage, 'Field:', errorField);
      
      // Set error to specific field and show appropriate toast
      let scrollField = errorField; // Default field for scrolling
      
      if (errorMessage.includes('User already exists') || errorMessage.includes('email')) {
        setErrors({ email: 'Email sudah terdaftar' });
        scrollField = 'email';
        Toast.show({ 
          type: 'error', 
          text1: 'Email Sudah Terdaftar', 
          text2: 'Silakan gunakan email lain atau coba login.' 
        });
      } else if (errorMessage.includes('username')) {
        setErrors({ username: 'Username sudah digunakan' });
        scrollField = 'username';
        Toast.show({ 
          type: 'error', 
          text1: 'Username Tidak Tersedia', 
          text2: 'Silakan pilih username lain.' 
        });
      } else if (errorField === 'password') {
        setErrors({ password: errorMessage });
        scrollField = 'password';
        Toast.show({ 
          type: 'error', 
          text1: 'Password Tidak Valid', 
          text2: errorMessage 
        });
      } else if (errorField === 'name') {
        setErrors({ name: errorMessage });
        scrollField = 'name';
        Toast.show({ 
          type: 'error', 
          text1: 'Nama Tidak Valid', 
          text2: errorMessage 
        });
      } else {
        // Generic error - show in email field as fallback
        setErrors({ [errorField]: errorMessage });
        scrollField = errorField;
        Toast.show({ 
          type: 'error', 
          text1: 'Registrasi Gagal', 
          text2: errorMessage 
        });
      }
      
      // Auto scroll to error field after setting errors
      setTimeout(() => {
        const fieldOrder = ['name', 'username', 'email', 'password', 'confirmPassword', 'karangTarunaName', 'peranAnggota', 'provinsi', 'kabupatenKota', 'kecamatan', 'jalan', 'phone', 'skillLevel'];
        const fieldIndex = fieldOrder.indexOf(scrollField);
        if (fieldIndex !== -1 && scrollViewRef.current) {
          const scrollPosition = fieldIndex * 100; // Approximate height per field
          scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (label: string, key: string, placeholder: string, opts?: any) => (
    <View style={{ marginBottom: 12 }}>
      <Label>{label}</Label>
      <Input
        placeholder={placeholder}
        value={(formData as any)[key]}
        onChangeText={(text: string) => setFormData({ ...formData, [key]: text })}
        error={!!errors[key]}
        {...opts}
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Daftar Akun</Text>
          <View style={{ flex: 1 }} />
          <ThemeToggle />
        </View>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content}>
        
        {/* Data Pribadi */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}><MaterialIcons name="person" size={16} color={colors.textSecondary} /> Data Pribadi</Text>
          {renderField('Nama Lengkap *', 'name', 'Nama lengkap Anda')}
          {renderField('Username *', 'username', 'Username unik')}
          {renderField('Email *', 'email', 'nama@email.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}
          {renderField('Password *', 'password', 'Minimal 6 karakter', { secureTextEntry: true })}
          {renderField('Konfirmasi Password *', 'confirmPassword', 'Ulangi password', { secureTextEntry: true })}
          {renderField('Nomor Telepon *', 'phone', '081234567890', { keyboardType: 'phone-pad' })}
        </View>

        {/* Karang Taruna */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informasi Karang Taruna</Text>
          {renderField('Nama Karang Taruna *', 'karangTarunaName', 'Karang Taruna Mekar Jaya')}
          {renderField('Peran Anggota *', 'peranAnggota', 'Ketua, Sekretaris, Anggota, dll.')}
        </View>

        {/* Alamat */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Wilayah Domisili</Text>
          {renderField('Provinsi *', 'provinsi', 'Jawa Barat')}
          {renderField('Kabupaten/Kota *', 'kabupatenKota', 'Bandung')}
          {renderField('Kecamatan *', 'kecamatan', 'Cibiru')}
          {renderField('Jalan *', 'jalan', 'Jl. Raya Cibiru No. 123')}
        </View>

        {/* Minat & Keahlian */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Minat & Keahlian</Text>
          <Label>Minat DIY</Label>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>Pilih kategori yang Anda minati</Text>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.checkboxRow}
              onPress={() => handleInterestChange(cat, !formData.interests.includes(cat))}
              activeOpacity={0.7}
            >
              <Checkbox
                checked={formData.interests.includes(cat)}
                onCheckedChange={(checked) => handleInterestChange(cat, checked)}
              />
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>{cat}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ marginTop: 12 }}>
            <Label>Tingkat Keahlian</Label>
            <Select
              value={formData.skillLevel}
              onValueChange={(val) => setFormData({ ...formData, skillLevel: val })}
              options={SKILL_LEVELS}
              placeholder="Pilih tingkat keahlian"
            />
          </View>
        </View>

        {/* Submit */}
        <Button onPress={handleSubmit} style={styles.submitBtn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Daftar Sekarang</Text>
          )}
        </Button>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => onNavigate('login')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Login di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  backIcon: { fontSize: 28, color: '#374151', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  content: { paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 48 },
  logoRow: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontWeight: '600', fontSize: 15, color: '#111827', marginBottom: 16 },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  hintText: { fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, marginBottom: 8 },
  checkboxLabel: { fontSize: 14, color: '#374151', flex: 1 },
  submitBtn: { height: 52, backgroundColor: '#dc2626', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6b7280' },
  footerLink: { fontSize: 14, color: '#dc2626', fontWeight: '600' },
});
