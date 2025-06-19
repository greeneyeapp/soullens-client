import React, { useEffect, useState } from 'react';
import { View, Platform, BackHandler } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import * as Font from 'expo-font';
import NetInfo from '@react-native-community/netinfo';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import api from '@/lib/axiosInstance';
import { useCreditCosts } from '@/stores/useCreditCosts';
import { useUserStore } from '@/stores/useUserStore';

import CustomSplashScreen from '@/screens/SplashScreen';
import AnalysisTypeScreen from '@/screens/AnalysisTypeScreen';
import SpeedSelectionScreen from '@/screens/SpeedSelectionScreen';
import ImageUploadScreen from '@/screens/ImageUploadScreen';
import LoadingScreen from '@/screens/LoadingScreen';
import ResultScreen from '@/screens/ResultScreen';
import PurchaseScreen from '@/screens/PurchaseScreen';
import * as Localization from 'expo-localization';
import CreditSuccessScreen from '@/screens/CreditSuccessScreen';
import CreditFailedScreen from '@/screens/CreditFailedScreen';
import ErrorScreen from '@/screens/ErrorScreen';
import LanguageSettingsScreen from '@/screens/LanguageSettingsScreen';
import CreditsScreen from '@/screens/CreditsScreen';
import HelpScreen from '@/screens/HelpScreen';
import InternetErrorModal from '@/components/InternetErrorModal';
import { MobileAds } from 'react-native-google-mobile-ads';

const Stack = createNativeStackNavigator();
const CUSTOM_JWT_KEY = 'custom_jwt';
const DEVICE_ID_KEY = 'device_id';
const USER_LANGUAGE_KEY = 'user_language';

export default function App() {
  const { t } = useTranslation();
  const fetchCreditCosts = useCreditCosts(state => state.fetchCreditCosts);
  const setUserData = useUserStore(state => state.setUserData);
  const clearUserData = useUserStore(state => state.clearUserData);

  const [appIsInitializing, setAppIsInitializing] = useState(true);
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
        'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
      });
      setFontLoaded(true);
    } catch (error) {
      console.log('Error loading fonts:', error);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
    // AdMob'u initialize et
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialized:', adapterStatuses);
      })
      .catch(error => {
        console.error('AdMob initialization failed:', error);
      });

    // GDPR uyumluluğu için (isteğe bağlı)
    MobileAds()
      .setRequestConfiguration({
        // Test device ID'leri (development için)
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
        // Maksimum ad content rating
        maxAdContentRating: 'T', // Teen
        // Çocuk odaklı treatment
        tagForChildDirectedTreatment: false,
        // Alt yaş sınırı treatment
        tagForUnderAgeOfConsent: false,
      })
      .then(() => {
        console.log('AdMob request configuration set');
      });
  }, []);

  useEffect(() => {
    Purchases.configure({
      apiKey: Platform.select({
        ios: 'appl_dETVlfHqnROwLbXtLpPLAPgRCWj',
        android: 'goog_JXUHkkspLpkGgJHSwCXUKQrnXTC',
      }),
    });
  }, []);

  const waitForInternet = async () => {
    return new Promise<void>((resolve, reject) => {
      let resolved = false;
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          resolved = true;
          unsubscribe();
          resolve();
        }
      });
      setTimeout(() => {
        if (!resolved) {
          unsubscribe();
          reject(new Error('No internet connection'));
        }
      }, 5000);
    });
  };

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        // --- DİL YÜKLEME BAŞLANGICI ---
        let storedLanguage = null;
        try {
          storedLanguage = await SecureStore.getItemAsync(USER_LANGUAGE_KEY);
        } catch (e) {
          console.error("App.js: SecureStore'dan dil yüklenemedi", e);
        }

        // Cihaz dilini al (örneğin "tr-TR" -> "tr")
        const deviceLanguage = Localization.getLocales()[0]?.languageTag?.split('-')[0];
        // Öncelik sırası: Kayıtlı dil -> Cihaz dili -> Varsayılan 'en'
        const initialLang = storedLanguage || deviceLanguage || 'en';

        // Eğer i18n'in mevcut dili zaten hedef dil değilse değiştir.
        // Bu, gereksiz yere changeLanguage çağrısını ve olası yeniden render'ları engeller.
        if (i18n.language !== initialLang) {
          await i18n.changeLanguage(initialLang);
        }
        // --- DİL YÜKLEME SONU ---

        await new Promise(resolve => setTimeout(resolve, 1500));

        await waitForInternet();

        // 🔁 HEALTH ENDPOINT'E ULAŞILANA KADAR BEKLE
        let healthReady = false;
        for (let i = 0; i < 10; i++) {
          try {
            const healthResponse = await api.get('/health', { timeout: 3000 });
            if (healthResponse.status === 200) {
              healthReady = true;
              break;
            }
          } catch (err) {
            console.warn(`⌛ Backend sağlığı kontrol ediliyor (deneme ${i + 1}/10)...`);
            await new Promise(res => setTimeout(res, 1500)); // 1.5s bekle
          }
        }

        if (!healthReady) throw new Error('Backend health check failed');

        let currentId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (!currentId) {
          const uniqueId = Platform.OS === 'android'
            ? Application.getAndroidId()
            : await Application.getIosIdForVendorAsync();
          currentId = uniqueId || `unknown_${Platform.OS}_${Date.now()}`;
          await SecureStore.setItemAsync(DEVICE_ID_KEY, currentId);
        }

        const params = new URLSearchParams();
        params.append('device_id', currentId);

        const response = await api.post('/auth/token', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const accessToken = response.data?.access_token;
        const userData = response.data?.user;

        if (accessToken && userData?.device_id === currentId) {
          await SecureStore.setItemAsync(CUSTOM_JWT_KEY, accessToken);
          setUserData(userData);
          fetchCreditCosts();
        } else {
          throw new Error('Invalid user/token');
        }
      } catch (error) {
        await SecureStore.deleteItemAsync(CUSTOM_JWT_KEY);
        clearUserData();
        setIsNetworkError(true);
        setTimeout(() => setErrorModalVisible(true), 100);
      } finally {
        setAppIsInitializing(false);
        await SplashScreen.hideAsync();
        setNativeSplashHidden(true);
      }
    };

    prepareApp();
  }, [setUserData, clearUserData, fetchCreditCosts]);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashTimePassed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isReady = !appIsInitializing && minSplashTimePassed && nativeSplashHidden && fontLoaded;

  function forceExitApp() {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      setTimeout(() => {
        Updates.reloadAsync();
      }, 500);
    } else {
      BackHandler.exitApp();
    }
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {isReady ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="AnalysisType" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AnalysisType" component={AnalysisTypeScreen} />
            <Stack.Screen name="SpeedSelection" component={SpeedSelectionScreen} />
            <Stack.Screen name="Upload" component={ImageUploadScreen} />
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Purchase" component={PurchaseScreen} />
            <Stack.Screen name="CreditSuccess" component={CreditSuccessScreen} />
            <Stack.Screen name="CreditFailed" component={CreditFailedScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
            <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
            <Stack.Screen name="CreditsScreen" component={CreditsScreen} />
            <Stack.Screen name="HelpScreen" component={HelpScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <CustomSplashScreen />
      )}
      <InternetErrorModal
        visible={errorModalVisible}
        title={t('splash.no_connection_title')}
        message={t('splash.no_connection_message')}
        onClose={() => {
          setErrorModalVisible(false);
          setTimeout(() => {
            forceExitApp();
          }, 300);
        }}
      />
    </SafeAreaProvider>
  );
}
