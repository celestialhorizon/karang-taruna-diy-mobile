# Karang Taruna DIY Mobile

Aplikasi mobile Karang Taruna DIY dibangun dengan React Native dan Expo, dengan target platform Android.

## Prerequisites

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (untuk emulator) atau Expo Go app di perangkat Android

## Getting Started

```bash
npm install
npx expo start
```

Scan QR code dengan Expo Go app, atau tekan `a` untuk membuka di Android emulator.

## Build Android APK

```bash
npx eas build --platform android --profile preview
```