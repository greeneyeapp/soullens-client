import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStepFlow } from '@/stores/useStepFlow';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  white: '#FFFFFF',
  text: '#1F2937',
  errorBg: '#FEF2F2',
  errorTitleText: '#DC2626',
  errorMessageText: '#B91C1C',
};
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};


export default function ErrorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t } = useTranslation();
  const resetFlowState = useStepFlow((state) => state.resetFlowState);

  const params = route.params as { reason?: string; statusCode?: number } | undefined;

  let displayTitle = t('errorScreen.error_title');
  let displayMessage = t('errorScreen.error_message');

  if (params?.reason === 'no_face_detected') {
    displayTitle = t('errorScreen.no_face_title');
    displayMessage = t('errorScreen.no_face_message');
  }

  if (params?.reason === 'invalid_image') {
    displayTitle = t('errorScreen.no_face_title');
    displayMessage = t('image_upload.info_modal_message');
  }


  const handleGoHome = () => {
    resetFlowState();
    navigation.navigate('AnalysisType');
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (navigation.isFocused()) { // Sadece ekran odaktaysa yönlendir
        handleGoHome();
      }
    }, 6000); // Süreyi biraz daha uzattım, kullanıcı hem mesajı okuyabilsin hem de butonu fark edebilsin diye

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <LottieView
            source={require('../../assets/animations/sad-error.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>

          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Ionicons name="home-outline" size={20} color={COLORS.white} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.homeButtonText}>{t('errorScreen.back_home')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.errorBg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  lottie: {
    width: 180,
    height: 180,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    color: COLORS.errorTitleText,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: 16,
    color: COLORS.errorMessageText,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
});