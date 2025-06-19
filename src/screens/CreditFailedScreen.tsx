import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStepFlow } from '@/stores/useStepFlow';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  white: '#FFFFFF',
  errorBg: '#fef2f2',
  errorText: '#b91c1c',
};

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function CreditFailedScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const resetFlowState = useStepFlow((state) => state.resetFlowState);

  useEffect(() => {
    const timeout = setTimeout(() => {
      resetFlowState();
      navigation.navigate('AnalysisType' as never);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigation, resetFlowState]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/animations/sad-error.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
        <Text style={styles.text}>{t('credit_failed.message')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.errorBg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  lottie: {
    width: 200,
    height: 200,
    marginBottom: SPACING.xl,
  },
  text: {
    fontSize: 20,
    color: COLORS.errorText,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});
