import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
  BackHandler,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useStepFlow } from '../stores/useStepFlow';
import api from '@/lib/axiosInstance';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '@/stores/useUserStore';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
  premiumBorder: '#FBBF24',
  premiumText: '#92400E',
  premiumBadgeBg: '#FEF9C3',
  premiumGlowStart: '#FEF9C3',
  premiumGlowEnd: '#FDE047',
  fastGlowEnd: '#F9A8D4',
  error: '#EF4444',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const NO_FACE_ERROR_SIGNATURE = "[no human face detected or low confidence]";

export default function LoadingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { analysisType, mode } = useStepFlow();
  const image = (route.params as any)?.image;

  const [currentStep, setCurrentStep] = useState(0);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiRequestCtrlRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const fileUriToUploadRef = useRef<string | null>(image?.uri || null);
  const originalImageUriRef = useRef<string | null>(image?.uri || null);

  const isPremiumMode = mode === 'deep' && analysisType !== 'self';
  const [includeExtraStep, setIncludeExtraStep] = useState(false);

  const loadingSteps = React.useMemo(() => {
    const steps = isPremiumMode
      ? [t('loading.deep.step1'), t('loading.deep.step2'), t('loading.deep.step3'), t('loading.deep.step4'), t('loading.deep.step5'), t('loading.deep.step6')]
      : [t('loading.fast.step1'), t('loading.fast.step2'), t('loading.fast.step3'), t('loading.fast.step4'), t('loading.fast.step5'), t('loading.fast.step6')];
    return includeExtraStep ? [...steps, t('loading.extra')] : steps;
  }, [isPremiumMode, t, includeExtraStep]);

  useEffect(() => {
    isMountedRef.current = true;
    const extraStepTimeout = setTimeout(() => {
      if (isMountedRef.current) setIncludeExtraStep(true);
    }, 50000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(extraStepTimeout);
    };
  }, []);

  const getRandomTone = (): 'ciddi' | 'esprili' | 'iyi niyetli' | 'iğneleyici' => {
    const tones = ['ciddi', 'esprili', 'iyi niyetli', 'iğneleyici'] as const;
    return tones[Math.floor(Math.random() * tones.length)];
  };

  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    );
    glowAnimation.start();

    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setMinDelayPassed(true);
        return prev;
      });
    }, 2500);

    apiRequestCtrlRef.current = new AbortController();

    const sendAnalysisRequest = async () => {
      let didReachApi = false;

      if (!image || !image.uri) {
        if (isMountedRef.current && !hasNavigated) {
          setHasNavigated(true);
          navigation.replace('Error', { reason: 'invalid_image' });
        }
        return;
      }

      originalImageUriRef.current = image.uri;
      fileUriToUploadRef.current = image.uri;

      const fileExtension = originalImageUriRef.current.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `upload_image_${Date.now()}.${fileExtension}`;
      const copiedFilePath = `${FileSystem.documentDirectory}${filename}`;

      try {
        if (Platform.OS !== 'web' && originalImageUriRef.current.startsWith('file://')) {
          await FileSystem.copyAsync({ from: originalImageUriRef.current, to: copiedFilePath });
          fileUriToUploadRef.current = copiedFilePath;
        }
      } catch (err) {
        console.warn("Dosya kopyalanamadı:", err);
        if (isMountedRef.current && !hasNavigated) {
          setHasNavigated(true);
          navigation.replace('Error', { reason: 'invalid_image' });
        }
        return;
      }

      let endpointUrl = analysisType === 'self' ? '/analyze' : '/analyze/premium';
      const uploadUrl = (api.defaults.baseURL || Constants.expoConfig?.extra?.API_URL || '') + endpointUrl;

      const parameters: Record<string, string> = { lang: i18n.language };
      if (analysisType !== 'self') {
        parameters.analysis_type = analysisType;
        parameters.speed = mode;
        parameters.tone = getRandomTone();
      }

      let token = null;
      try {
        token = await SecureStore.getItemAsync('custom_jwt');
      } catch (e) {
        console.error("SecureStore hatası:", e);
        if (isMountedRef.current && !hasNavigated) {
          setHasNavigated(true);
          navigation.replace('Error', { reason: 'invalid_image' });
        }
        return;
      }

      if (!token) {
        if (isMountedRef.current && !hasNavigated) {
          setHasNavigated(true);
          navigation.replace('Error', { reason: 'invalid_image' });
        }
        if (fileUriToUploadRef.current && fileUriToUploadRef.current !== originalImageUriRef.current && Platform.OS !== 'web') {
          await FileSystem.deleteAsync(fileUriToUploadRef.current, { idempotent: true }).catch(() => { });
        }
        return;
      }

      try {
        didReachApi = true;

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUriToUploadRef.current!, {
          fieldName: 'image',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          parameters,
          headers: {
            'Accept': 'application/json',
            'x-auth-token': `Bearer ${token}`,
          },
        });

        let parsedBody;
        try {
          parsedBody = JSON.parse(uploadResult.body);
        } catch {
          if (isMountedRef.current && !hasNavigated) {
            setHasNavigated(true);
            navigation.replace('Error', { reason: 'server_error' });
          }
          return;
        }

        if (!parsedBody.success || !parsedBody.basic_result) {
          const isNoFace =
            parsedBody.result?.error_details === NO_FACE_ERROR_SIGNATURE ||
            parsedBody.error === NO_FACE_ERROR_SIGNATURE ||
            parsedBody.error?.toLowerCase?.().includes('no human face') ||
            parsedBody.message?.toLowerCase?.().includes('no human face');

          const errorReason = isNoFace ? 'no_face_detected' : 'server_error';

          if (isMountedRef.current && !hasNavigated) {
            setHasNavigated(true);
            navigation.replace('Error', { reason: errorReason });
          }
          return;
        }

        if (parsedBody.creditsLeft !== undefined && analysisType !== 'self') {
          useUserStore.getState().setUserCredits(parsedBody.creditsLeft);
        }

        if (isMountedRef.current) {
          setApiResult({ ...parsedBody, imageUri: fileUriToUploadRef.current });
        }
      } catch (err: any) {
        if (!isMountedRef.current || hasNavigated) return;
        setHasNavigated(true);

        const reason = err.name === 'AbortError' || err.message?.includes('aborted')
          ? null
          : didReachApi
            ? 'network'
            : 'invalid_image';

        if (reason) navigation.replace('Error', { reason });
      }
    };


    sendAnalysisRequest();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (apiRequestCtrlRef.current) {
        apiRequestCtrlRef.current.abort("LoadingScreen unmounted");
        apiRequestCtrlRef.current = null;
      }
      glowAnimation.stop();
      // Dosya silme işlemi buradan kaldırıldı. ResultScreen kendi cleanup'ında halledecek.
      // Ancak, API isteği başarısız olursa ve ResultScreen'e hiç gidilmezse,
      // kopyalanan dosya burada silinmeli. Bu, sendAnalysisRequest içindeki hata bloklarında yapılıyor.
    };
  }, []);

  useEffect(() => {
    if (apiResult && minDelayPassed && !hasNavigated && isMountedRef.current) {
      setHasNavigated(true);
      navigation.replace('Result', {
        data: JSON.stringify(apiResult),
        analysisType,
        mode,
      });
    }
  }, [apiResult, minDelayPassed, hasNavigated, navigation, analysisType, mode]);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const currentGlowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isPremiumMode ? [COLORS.premiumGlowStart, COLORS.premiumGlowEnd] : [COLORS.primaryLight, COLORS.fastGlowEnd],
  });
  const currentProgressBarColor = isPremiumMode ? COLORS.premiumBorder : COLORS.primary;

  return (
    <SafeAreaView style={styles.safeArea}>
      <BlurView intensity={Platform.OS === 'ios' ? 15 : 30} tint="light" style={StyleSheet.absoluteFill} />
      {analysisType !== 'self' && (
        <View style={[styles.badgeBase, isPremiumMode ? styles.premiumBadge : styles.fastBadge]}>
          <Text style={isPremiumMode ? styles.premiumBadgeText : styles.fastBadgeText}>
            {t(`loading.badge.${isPremiumMode ? 'premium' : 'fast'}`)}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <LottieView source={require('../../assets/animations/loading.json')} autoPlay loop style={styles.lottie} />
        <Animated.View style={[styles.messageBox, { shadowColor: currentGlowColor }]}>
          <Text style={styles.stepText}>
            {includeExtraStep
              ? t('loading.extra')
              : loadingSteps[currentStep] || loadingSteps[loadingSteps.length - 1]}
          </Text>
        </Animated.View>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressBar, {
            width: `${Math.min((currentStep + 1) / loadingSteps.length, 1) * 100}%`
            , backgroundColor: currentProgressBarColor
          }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  badgeBase: { position: 'absolute', top: Platform.OS === 'ios' ? Constants.statusBarHeight + SPACING.sm : SPACING.md + SPACING.sm, alignSelf: 'center', paddingVertical: SPACING.sm - 2, paddingHorizontal: SPACING.md + 2, borderRadius: 20, borderWidth: 1.5, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 4 },
  premiumBadge: { backgroundColor: COLORS.premiumBadgeBg, borderColor: COLORS.premiumBorder },
  premiumBadgeText: {
    fontSize: 14,
    color: COLORS.premiumText,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  fastBadge: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  fastBadgeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  lottie: { width: 180, height: 180, marginBottom: SPACING.lg },
  messageBox: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: 18, marginBottom: SPACING.xl, backgroundColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  stepText: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
    color: COLORS.text,
  },
  progressBackground: { width: '70%', maxWidth: 300, height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 6 },
});