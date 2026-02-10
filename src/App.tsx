import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { DetailPage } from './components/DetailPage';
import { MyLearningPage } from './components/MyLearningPage';

type Page = 'register' | 'login' | 'home' | 'detail' | 'my-learning';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTutorialId, setSelectedTutorialId] = useState<number>(1);

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('diy_current_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      }
    };
    loadUser();
  }, []);

  // Initialize test account
  useEffect(() => {
    const initTestAccount = async () => {
      try {
        const usersJson = await AsyncStorage.getItem('diy_users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        const testUserExists = users.find((u: any) => u.email === 'test@mail.com');

        if (!testUserExists) {
          const testUser = {
            name: 'Test User',
            username: 'testuser',
            email: 'test@mail.com',
            password: 'test123',
            karangTarunaName: 'Karang Taruna Test',
            address: {
              provinsi: 'DKI Jakarta',
              kabupatenKota: 'Jakarta Selatan',
              kecamatan: 'Kebayoran Baru',
              jalan: 'Jl. Test No. 123',
            },
            phone: '081234567890',
            interests: ['Pertukangan Kayu', 'Pengecatan'],
            skillLevel: 'Pemula',
            role: 'Anggota',
            createdAt: new Date().toISOString(),
          };
          users.push(testUser);
          await AsyncStorage.setItem('diy_users', JSON.stringify(users));
        }
      } catch (e) {
        console.error('Failed to init test account', e);
      }
    };
    initTestAccount();
  }, []);

  const handleNavigate = (page: string, tutorialId?: number) => {
    setCurrentPage(page as Page);
    if (tutorialId) {
      setSelectedTutorialId(tutorialId);
    }
  };

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('diy_current_user');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {currentPage === 'register' && (
        <RegisterPage onNavigate={handleNavigate} />
      )}
      {currentPage === 'login' && (
        <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}
      {currentPage === 'home' && (
        <HomePage
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'detail' && currentUser && (
        <DetailPage
          tutorialId={selectedTutorialId}
          user={currentUser}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'my-learning' && currentUser && (
        <MyLearningPage
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      <Toast />
    </SafeAreaProvider>
  );
}