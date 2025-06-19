import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Platform, BackHandler, Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import PremiumOfferCard from '@/components/PremiumOfferCard';
import { useStepFlow } from '@/stores/useStepFlow';
import * as FileSystem from 'expo-file-system';
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
  fastBadgeBg: '#FCE7F3',
  fastBadgeBorder: '#db2777',
  fastBadgeText: '#db2777',
  fastGlowEnd: '#F9A8D4',
  happyBg: '#FFFBEB', sadBg: '#EFF6FF', angryBg: '#FEF2F2', fearBg: '#F5F3FF',
  surpriseBg: '#FFFBEB', disgustBg: '#F0FDF4', neutralBg: '#F9FAFB',
  genderBlockBg: '#E0F2FE', raceBlockBg: '#EDE9FE', vibeBlockBg: '#FCE7F3',
  error: '#EF4444',
};

const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

const emojiMap: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', fear: '😨',
  surprise: '😮', disgust: '🤢', neutral: '😐',
  male: '👨', female: '👩',
  white: '🤍', black: '🖤', asian: '🈶', indian: '🪷',
  'middle_eastern': '🕌', 'latino_hispanic': '🌞'
};

export default function ResultScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchAndSetUserData = useUserStore((state) => state.fetchAndSetUserData);

  const apiResponse = (route.params as any)?.data ? JSON.parse((route.params as any).data) : null;
  const basicData = apiResponse?.basic_result;
  const premiumData = apiResponse?.premium_result;
  const imageUri = apiResponse?.imageUri;

  const analysisType: 'self' | 'partner' | 'ex' | 'crush' | null | undefined = (route.params as any)?.analysisType;
  const mode: 'fast' | 'deep' | null | undefined = (route.params as any)?.mode;

  const [step, setStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(true);
  const resetFlowState = useStepFlow((state) => state.resetFlowState);

  const isNonSelfAnalysis = analysisType !== 'self';
  const isPremiumStyle = isNonSelfAnalysis && mode === 'deep';

  const emotionColorMap: Record<string, string> = {
    happy: COLORS.happyBg, sad: COLORS.sadBg, angry: COLORS.angryBg,
    fear: COLORS.fearBg, surprise: COLORS.surpriseBg, disgust: COLORS.disgustBg, neutral: COLORS.neutralBg
  };
  const blockColorMap: Record<number, string> = {
    1: emotionColorMap[basicData?.top_emotion ?? 'neutral'] || COLORS.neutralBg,
    2: COLORS.genderBlockBg,
    3: COLORS.raceBlockBg,
    4: COLORS.vibeBlockBg,
  };

  useEffect(() => {
    fetchAndSetUserData();
  }, [fetchAndSetUserData]);

  useEffect(() => {
    const handleBackPress = () => {
      if (step < 5) { return true; }
      resetFlowState();
      navigation.navigate('AnalysisType');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [step, navigation, resetFlowState]);

  useEffect(() => {
    if (step === 5 && showCelebration) {
      const timer = setTimeout(() => { setShowCelebration(false); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, showCelebration]);

  useEffect(() => {
    return () => {
      if (imageUri && imageUri.startsWith(FileSystem.documentDirectory || '') && Platform.OS !== 'web') {
        FileSystem.deleteAsync(imageUri, { idempotent: true })
            .then(() => console.log("ResultScreen unmount: Temp image deleted", imageUri))
            .catch(err => console.error("ResultScreen unmount: Failed to delete temp image:", imageUri, err));
      }
    };
  }, [imageUri]);

  useEffect(() => {
    if (scrollViewRef.current && step < 5) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [step]);

  if (!apiResponse || !basicData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>{t('result.load_error_message') || 'Sonuçlar yüklenemedi.'}</Text>
          <TouchableOpacity onPress={() => { resetFlowState(); navigation.navigate('AnalysisType');}} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>{t('errorScreen.back_home') || 'Ana Sayfaya Dön'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderBlock = (emoji: string, title: string, description: string | undefined | null, bg = COLORS.neutralBg) => (
    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300 }} style={[styles.block, { backgroundColor: bg }]}>
      <Text style={styles.blockTitle}>{emoji} {title}</Text>
      <Text style={styles.blockText}>{description || t('result.no_data') || 'Detay bulunamadı.'}</Text>
    </MotiView>
  );

  const handleNext = () => setStep(prev => prev + 1);

  const stepTitles = [
    t('result.summaryTitle'),
    t('result.emotionTitle'),
    t('result.genderTitle'),
    t('result.raceTitle'),
    t('result.vibeTitle'),
  ];

  const getGlowColor = (currentStep: number): string => {
    if (isPremiumStyle) {
      const colors = [COLORS.premiumGlowStart, COLORS.premiumBorder, COLORS.premiumGlowEnd, COLORS.premiumBorder, COLORS.premiumGlowStart];
      return colors[currentStep % colors.length] || COLORS.premiumGlowStart;
    } else {
      const colors = [COLORS.primaryLight, COLORS.border, COLORS.fastGlowEnd, COLORS.border, COLORS.primaryLight];
      return colors[currentStep % colors.length] || COLORS.primaryLight;
    }
  };
  const nextButtonBgColor = isPremiumStyle ? COLORS.premiumBorder : COLORS.primary;

  const renderSteps = () => (
    <ScrollView
      ref={scrollViewRef}
      style={styles.stepScroll}
      contentContainerStyle={styles.stepScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepSubheading}>{stepTitles[step] || ''}</Text>
      <MotiView key={step} from={{ opacity: 0, translateY: 30, shadowOpacity: 0 }} animate={{ opacity: 1, translateY: 0, shadowOpacity: 0.3 }} transition={{ type: 'timing', duration: 350 }} style={[styles.stepMotiView, { shadowColor: getGlowColor(step) }]}>
        {step === 0 && (
          <View style={[styles.block, styles.summaryBlock]}>
            <Text style={styles.blockEmojiTitle}>🔍 {t('result.quickOverview')}</Text>
            <View style={styles.summaryLines}>
              <Text style={styles.heroLine}>🎭 {t(`emotion.${basicData?.top_emotion}`)}</Text>
              <Text style={styles.heroLine}>🧠 {t(`gender.${basicData?.gender}`)}</Text>
              <Text style={styles.heroLine}>🌍 {t(`race.${basicData?.race}`)}</Text>
              <Text style={styles.heroLine}>🎂 {t('age_group_label', { age: basicData?.age })}</Text>
            </View>
          </View>
        )}
        {step === 1 && renderBlock(emojiMap[basicData?.top_emotion ?? 'neutral'] || '❓', t(`emotion.${basicData?.top_emotion}`), (isNonSelfAnalysis && premiumData?.emotion) ? premiumData.emotion : basicData?.texts?.emotion, blockColorMap[1])}
        {step === 2 && renderBlock(emojiMap[basicData?.gender ?? 'unknown'] || '👤', t(`gender.${basicData?.gender}`), (isNonSelfAnalysis && premiumData?.gender) ? premiumData.gender : basicData?.texts?.gender, blockColorMap[2])}
        {step === 3 && renderBlock(emojiMap[basicData?.race ?? 'unknown'] || '🌍', t(`race.${basicData?.race}`), (isNonSelfAnalysis && premiumData?.race_skin) ? premiumData.race_skin : basicData?.texts?.race_skin, blockColorMap[3])}
        {step === 4 && renderBlock('💫', t('result.vibeCardTitle'), (isNonSelfAnalysis && premiumData?.vibe) ? premiumData.vibe : basicData?.texts?.vibe, blockColorMap[4])}
      </MotiView>
      <MotiView from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'timing', duration: 250 }} style={styles.stepButtonContainer}>
        <TouchableOpacity onPress={handleNext} style={[styles.nextButton, { backgroundColor: nextButtonBgColor }]}>
          <Text style={styles.nextText}>{t('result.continue')}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: SPACING.sm }} />
        </TouchableOpacity>
      </MotiView>
    </ScrollView>
  );

  const renderCelebration = () => (
    <View style={styles.fullCelebration}>
      <LottieView source={require('../../assets/animations/confetti.json')} autoPlay loop={false} style={styles.celebrationLottie} />
      <Text style={styles.celebrationBigText}>🎉 {t('result.summaryFinished')}</Text>
    </View>
  );

  const renderFullResults = () => (
    <ScrollView style={styles.fullResultScroll} contentContainerStyle={styles.fullResultContent} showsVerticalScrollIndicator={false}>
      {isNonSelfAnalysis && (
        <View style={[styles.badgeBase, isPremiumStyle ? styles.premiumBadge : styles.fastBadge]}>
          <Text style={isPremiumStyle ? styles.premiumBadgeText : styles.fastBadgeText}>
            {isPremiumStyle ? t('loading.badge.premium') : t('loading.badge.fast')}
          </Text>
        </View>
      )}
      <View style={[styles.resultBox, { borderColor: isPremiumStyle ? COLORS.premiumBorder : COLORS.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => { resetFlowState(); navigation.navigate('AnalysisType'); }} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.resultTitle}>{t('result.detailsTitle')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 350 }}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          <View style={styles.heroBox}>
            <Text style={styles.heroLine}>🎭 {t(`emotion.${basicData?.top_emotion}`)}</Text>
            <Text style={styles.heroLine}>🧠 {t(`gender.${basicData?.gender}`)}</Text>
            <Text style={styles.heroLine}>🌍 {t(`race.${basicData?.race}`)}</Text>
            <Text style={styles.heroLine}>🎂 {t('age_group_label', { age: basicData?.age })}</Text>
          </View>
          {renderBlock(emojiMap[basicData?.top_emotion ?? 'neutral'] || '❓', t(`emotion.${basicData?.top_emotion}`), (isNonSelfAnalysis && premiumData?.emotion) ? premiumData.emotion : basicData?.texts?.emotion, emotionColorMap[basicData?.top_emotion ?? 'neutral'])}
          {renderBlock(emojiMap[basicData?.gender ?? 'unknown'] || '👤', t(`gender.${basicData?.gender}`), (isNonSelfAnalysis && premiumData?.gender) ? premiumData.gender : basicData?.texts?.gender, COLORS.genderBlockBg)}
          {renderBlock(emojiMap[basicData?.race ?? 'unknown'] || '🌍', t(`race.${basicData?.race}`), (isNonSelfAnalysis && premiumData?.race_skin) ? premiumData.race_skin : basicData?.texts?.race_skin, COLORS.raceBlockBg)}
          {renderBlock('💫', t('result.vibeCardTitle'), (isNonSelfAnalysis && premiumData?.vibe) ? premiumData.vibe : basicData?.texts?.vibe, COLORS.vibeBlockBg)}
        </MotiView>
      </View>
      <View style={styles.premiumOfferContainer}><PremiumOfferCard analysisType={analysisType} mode={mode} /></View>
      <View style={styles.disclaimerContainer}><Text style={styles.disclaimerText}>{t('result.disclaimer')}</Text></View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {step >= 5 ? (showCelebration ? renderCelebration() : renderFullResults()) : renderSteps()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  errorText: {
    fontSize: 18,
    color: COLORS.error || '#cc0000',
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    textAlign: 'center',
  },
  errorButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: 12, marginTop: SPACING.lg },
  errorButtonText: {
    color: COLORS.white,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    fontSize: 16,
  },
  stepScroll: { flex: 1, backgroundColor: COLORS.background },
  stepScrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, paddingBottom: 100 },
  stepSubheading: {
    fontSize: 20,
    marginBottom: SPACING.xl,
    color: COLORS.primary,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
  },
  stepMotiView: { width: '95%', maxWidth: 400, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  block: { marginBottom: SPACING.lg, borderRadius: 18, padding: SPACING.lg, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  summaryBlock: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderWidth: 1.5 },
  blockEmojiTitle: {
    fontSize: 18,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  blockTitle: {
    fontSize: 18,
    marginBottom: SPACING.sm,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
  },
  blockText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
  },
  summaryLines: { marginTop: SPACING.md },
  heroLine: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.text,
    marginVertical: SPACING.xs,
    textAlign: 'center',
  },
  stepButtonContainer: { alignItems: 'center', marginTop: SPACING.xl },
  nextButton: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: 12, alignSelf: 'center', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5 },
  nextText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  fullCelebration: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  celebrationLottie: { width: 240, height: 240 },
  celebrationBigText: {
    fontSize: 28,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.primary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  fullResultScroll: { flex: 1, backgroundColor: COLORS.background },
  fullResultContent: { paddingTop: SPACING.xl + SPACING.lg, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl * 2, alignItems: 'center', position: 'relative' },
  badgeBase: {
    position: 'absolute',
    top: SPACING.lg - 10,
    alignSelf: 'center',
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  premiumBadge: { backgroundColor: COLORS.premiumBadgeBg, borderColor: COLORS.premiumBorder },
  premiumBadgeText: {
    fontSize: 14,
    color: COLORS.premiumText,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  fastBadge: { backgroundColor: COLORS.fastBadgeBg, borderColor: COLORS.fastBadgeBorder },
  fastBadgeText: {
    fontSize: 14,
    color: COLORS.fastBadgeText,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  resultBox: { width: '100%', backgroundColor: COLORS.white, borderRadius: 24, padding: SPACING.lg, borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, maxWidth: 500, overflow: 'hidden', marginTop: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  headerBackButton: { padding: SPACING.xs },
  resultTitle: {
    fontSize: 22,
    textAlign: 'center',
    color: COLORS.text,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  headerPlaceholder: { width: 28 + SPACING.xs * 2 },
  previewImage: { width: '100%', height: 200, borderRadius: 14, marginBottom: SPACING.lg, alignSelf: 'center' },
  heroBox: { padding: SPACING.md, borderRadius: 16, marginBottom: SPACING.lg, alignItems: 'center', borderWidth: 1.5, backgroundColor: COLORS.primaryLight, borderColor: COLORS.border },
  premiumOfferContainer: { width: '100%', maxWidth: 500, marginTop: SPACING.lg, marginBottom: SPACING.md },
  disclaimerContainer: { marginTop: SPACING.md, paddingHorizontal: SPACING.md, width: '100%', maxWidth: 500 },
  disclaimerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    lineHeight: 18,
  },
});