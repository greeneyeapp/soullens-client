import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import CreditDisplay from '@/components/CreditDisplay';
import AnalysisTypeSelector, { AnalysisType } from '@/components/AnalysisTypeSelector';
import FreePremiumBanner from '@/components/FreePremiumBanner';
import { useStepFlow } from '@/stores/useStepFlow';
import { useUserStore } from '@/stores/useUserStore';
import AdBanner from '@/components/AdBanner';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
  disabled: '#F3F4F6',
  disabledText: '#9CA3AF',
  link: '#1d4ed8',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function AnalysisTypeScreen() {
  const { t, i18n, ready } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { analysisType: initialType, setStepData, resetFlowState, isRecovering, setRecovering } = useStepFlow();
  const [selectedType, setSelectedType] = useState<AnalysisType>('self');
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAndSetUserData = useUserStore((state) => state.fetchAndSetUserData);
  const hasDailyFreePremium = useUserStore((state) => state.has_daily_free_premium_analysis);

  const goToCreditsScreen = () => {
    navigation.navigate('CreditsScreen');
  };

  const goToHelpScreen = () => {
    navigation.navigate('HelpScreen');
  };

  useFocusEffect(
    useCallback(() => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);

      const currentParams = route.params as { image?: any;[key: string]: any };
      if (currentParams?.image) {
        navigation.setParams({ image: undefined });
      }

      fetchAndSetUserData();

      resetTimeoutRef.current = setTimeout(() => {
        resetFlowState();
        setSelectedType('self');

        recoveryTimeoutRef.current = setTimeout(() => {
          setRecovering(false);
        }, 100);
      }, 10);

      return () => {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
      };
    }, [resetFlowState, navigation, route.params, setRecovering, fetchAndSetUserData])
  );

  useEffect(() => {
    if (!ready) return;

    const backAction = () => {
      Alert.alert(
        i18n.t('exit_title'),
        i18n.t('exit_message'),
        [
          { text: i18n.t('cancel'), style: 'cancel', onPress: () => null },
          { text: i18n.t('exit'), onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [ready, i18n]);


  const handleContinue = () => {
    if (isRecovering) {
      return;
    }
    setStepData({ analysisType: selectedType });
    if (selectedType === 'self') {
      navigation.navigate('Upload');
    } else {
      navigation.navigate('SpeedSelection');
    }
  };

  const goToLanguageSettings = () => {
    navigation.navigate('LanguageSettings');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.headerButton, styles.headerLeftItem]} onPress={goToLanguageSettings}>
          <Ionicons name="globe-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.headerButton, styles.headerCenterItem]} onPress={goToHelpScreen}>
          <Ionicons name="help-circle-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={[styles.headerRightItem]}>
          <CreditDisplay />
        </View>
      </View>

      <FreePremiumBanner visible={hasDailyFreePremium === true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AnalysisTypeSelector
          selected={selectedType}
          onSelect={setSelectedType}
        />
        <TouchableOpacity
          style={[styles.continueButton, isRecovering && styles.disabledButton]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={isRecovering}
        >
          <Text style={[styles.continueText, isRecovering && styles.disabledButtonText]}>
            {isRecovering ? t('recovering_state') || 'Bekleyin...' : t('home.continueButton')}
          </Text>
          {!isRecovering && <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: SPACING.sm }} />}
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={goToCreditsScreen} activeOpacity={0.7}>
          <Text style={styles.creditsLink}>{t('about_us') || 'Hakkımda'}</Text>
        </TouchableOpacity>
      </View>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.sm,
    paddingBottom: SPACING.sm,
    width: '100%',
  },
  headerLeftItem: {
    // Sol item için özel bir flex tanımına gerek yok, space-between halleder.
    // padding: SPACING.sm, // headerButton'dan gelecek
  },
  headerCenterItem: {
    // Orta item, space-between sayesinde ortalanır (sağ ve sol item'lar benzer genişlikteyse)
    // padding: SPACING.sm, // headerButton'dan gelecek
  },
  headerRightItem: {
    // Sağ item için özel bir flex tanımına gerek yok.
    // CreditDisplay kendi padding/margin'ine sahip olabilir.
  },
  headerButton: {
    padding: SPACING.sm,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 17,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    shadowColor: 'transparent',
    elevation: 0,
  },
  disabledButtonText: {
    color: COLORS.disabledText,
  },
  footer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  creditsLink: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.link,
  },
});