import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Karang Taruna DIY',
  slug: 'karang-taruna-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.karangtaruna_faisal_binus.diy', // Ganti dengan package name yang Anda inginkan
    // @ts-ignore
    usesCleartextTraffic: true,
    networkSecurityConfig: './network-security-config.xml',
  },
  scheme: 'karangtaruna',
  extra: {
    apiBaseUrlDev: process.env.API_BASE_URL_DEV || 'http://192.168.1.32:5000/api',
    apiBaseUrlProd: 'https://karang-taruna-diy-backend.onrender.com/api',
    eas: {
      projectId: '938b968f-b1b7-474c-8586-54b2cfd16eb3',
    },
  },
  plugins: ['expo-asset', 'expo-video'],
});
