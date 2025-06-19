import 'dotenv/config';

// Uygulama ID'leri
const androidAppId = 'ca-app-pub-5658124024438456~5200880813';
const iosAppId = 'ca-app-pub-5658124024438456~3161859075';

const versionCode = 18; // Sürümü güncelleyelim
const buildNumber = '18';

export default {
  name: 'SoulLens: AI Face Analyzer',
  slug: 'soullens',
  version: '1.2.6', // Sürümü güncelleyelim
  orientation: 'portrait',
  icon: './assets/logo/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/logo/soullens-splash-cover.png',
    resizeMode: 'contain',
    backgroundColor: '#ff6b83',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.greeneyeapp.soullens',
    buildNumber: buildNumber,
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        'We need access to your photo library so you can select photos for analysis.',
      ITSAppUsesNonExemptEncryption: false,
      GADApplicationIdentifier: iosAppId,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo/adaptive-icon.png',
      backgroundColor: '#ff6b83',
    },
    package: 'com.greeneyeapp.soullens',
    versionCode: versionCode,
    usesCleartextTraffic: true,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '0fb8d8bb-a11c-4358-aedd-989dcfbb3191',
    },
    API_URL: process.env.API_URL,
  },
  owner: 'muhammedbozkurt',
  newArchEnabled: true,
  plugins: [
    'expo-localization',
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
          // Tüm build ortamını net bir şekilde tanımlayarak çakışmaları önlüyoruz.
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0",
          // AdMob ve Expo'nun güncel SDK'ları ile uyumlu, stabil bir Kotlin sürümü seçiyoruz.
          kotlinVersion: '1.9.22',
          permissions: [
            'android.permission.READ_MEDIA_IMAGES',
            'com.android.vending.BILLING',
          ],
        },
      },
    ],
    // Reklam kütüphanesi eklentisi
    'react-native-google-mobile-ads',
  ],
  // Eklentinin doğru yapılandırması
  'react-native-google-mobile-ads': {
    android_app_id: androidAppId,
  },
};
