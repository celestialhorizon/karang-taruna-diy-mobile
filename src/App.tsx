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
import { ThemeProvider, useTheme } from './context/ThemeContext';
import apiService from './services/api';

type Page = 'register' | 'login' | 'home' | 'detail' | 'my-learning' | 'profile';

function AppContent() {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>('1');

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('diy_current_user');
        console.log('=== APP LOAD USER DEBUG ===');
        console.log('Stored user from AsyncStorage:', storedUser);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user:', parsedUser);
          console.log('User name:', parsedUser.name);
          console.log('User username:', parsedUser.username);
          console.log('User keys:', Object.keys(parsedUser));
          setCurrentUser(parsedUser);
        }
        console.log('============================');
      } catch (e) {
        console.error('Failed to load user', e);
      }
    };
    loadUser();
  }, []);

  const handleNavigate = (page: string, tutorialId?: string) => {
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
    await apiService.logout();
    setCurrentUser(null);
    setCurrentPage('home');
    Toast.show({ type: 'success', text1: 'Logged out', text2: 'Anda telah keluar' });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
      {currentPage === 'profile' && (
        <HomePage
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          initialTab="profile"
        />
      )}
      <Toast 
        position="bottom"
        bottomOffset={20}
      />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}