// src/config/admobConfig.ts
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const adMobConfig = {
  // Gerçek Uygulama ve Reklam Birimi ID'leriniz
  production: {
    android: {
      appId: 'ca-app-pub-5658124024438456~5200880813',
      banner: 'ca-app-pub-5658124024438456/3779987930',
      interstitial: 'ca-app-pub-5658124024438456/9372884267',
    },
    ios: {
      appId: 'ca-app-pub-5658124024438456~3161859075',
      banner: 'ca-app-pub-5658124024438456/5213307345',
      interstitial: 'ca-app-pub-5658124024438456/7377286312',
    },
  },
  // Geliştirme/Test için Google'ın sağladığı test ID'leri
  test: {
    android: {
      appId: 'ca-app-pub-3940256098942544~3347511713', // Bu genellikle kullanılmaz, config'e konulur
      banner: TestIds.BANNER,
      interstitial: TestIds.INTERSTITIAL,
    },
    ios: {
      appId: 'ca-app-pub-3940256098942544~1458002511', // Bu genellikle kullanılmaz, config'e konulur
      banner: TestIds.BANNER,
      interstitial: TestIds.INTERSTITIAL,
    },
  },
};

// Geliştirme ortamında olup olmadığımızı kontrol et
const isDevelopment = __DEV__;

// Ortama göre uygun ID'leri seç
const selectedConfig = isDevelopment ? adMobConfig.test : adMobConfig.production;

// Platforma özel reklam birimi ID'lerini dışa aktar
export const bannerAdUnitId = Platform.select({
  ios: selectedConfig.ios.banner,
  android: selectedConfig.android.banner,
}) as string;

export const interstitialAdUnitId = Platform.select({
  ios: selectedConfig.ios.interstitial,
  android: selectedConfig.android.interstitial,
}) as string;

// Uygulama ID'leri app.config.js'de kullanılacak
export const androidAppId = adMobConfig.production.android.appId;
export const iosAppId = adMobConfig.production.ios.appId;
