// app.config.js
import 'dotenv/config';

const androidAppId = 'ca-app-pub-5658124024438456~5200880813';
const iosAppId = 'ca-app-pub-5658124024438456~3161859075';

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
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.greeneyeapp.soullens',
    buildNumber: '15',
    infoPlist: {
      GADApplicationIdentifier: iosAppId,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo/adaptive-icon.png',
      backgroundColor: '#ff6b83',
    },
    package: 'com.greeneyeapp.soullens',
    versionCode: 15,
    permissions: [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'com.google.android.gms.permission.AD_ID'
    ],
  },
  extra: {
    eas: {
      projectId: '0fb8d8bb-a11c-4358-aedd-989dcfbb3191',
    },
    API_URL: process.env.API_URL || 'https://api-soullens.greeneyeapp.com',
  },
  owner: 'muhammedbozkurt',
  plugins: [
    'expo-localization',
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
        compileSdkVersion: 34,  // 35'ten 34'e geri döndür
        targetSdkVersion: 34,
        buildToolsVersion: '34.0.0',
        kotlinVersion: '1.9.23',  // Orijinal versiyona geri döndür
        },
        ios: {
          deploymentTarget: '15.1'
        }
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: androidAppId,
        iosAppId: iosAppId,
      },
    ],
  ],
};