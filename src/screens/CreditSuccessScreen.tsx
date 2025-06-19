import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
};

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function CreditSuccessScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {

    const timeout = setTimeout(() => {
      navigation.navigate('AnalysisType' as never);
    }, 3500);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/animations/success.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
        <Text style={styles.successText}>{t('credit_success.message')}</Text>
        <Text style={styles.warningText}>{t('credit_success.device_warning')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  lottie: { width: 220, height: 220, marginBottom: SPACING.xl },
  successText: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
});

