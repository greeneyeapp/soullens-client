import 'dotenv/config';

// Uygulama ID'leri
const androidAppId = 'ca-app-pub-5658124024438456~5200880813';
const iosAppId = 'ca-app-pub-5658124024438456~3161859075';

const versionCode = 15;
const buildNumber = '15';

export default {
  name: 'SoulLens: AI Face Analyzer',
  slug: 'soullens',
  version: '1.2.3',
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
    permissions: [
      'android.permission.READ_MEDIA_IMAGES',
      'com.android.vending.BILLING',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '0fb8d8bb-a11c-4358-aedd-989dcfbb3191',
    },
    API_URL: process.env.API_URL,
    ADMOB_ANDROID_APP_ID: androidAppId,
    ADMOB_IOS_APP_ID: iosAppId,
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
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0",
          kotlinVersion: '1.9.23',
          composeCompilerVersion: '1.5.11',
        },
      },
    ],
  ],
};