import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

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
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

import CreditDisplay from '@/components/CreditDisplay';
import AnalysisSpeedSelector from '@/components/AnalysisSpeedSelector';
import { useStepFlow } from '@/stores/useStepFlow';

export default function SpeedSelectionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { mode } = useStepFlow();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const handleContinue = () => {
    if (!mode) return;
    navigation.navigate('Upload' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <CreditDisplay />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent} // Stil burada uygulanıyor
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('analysis_speed.title')}</Text>

        <AnalysisSpeedSelector />

        <TouchableOpacity
          style={[styles.continueButton, !mode ? styles.disabledButton : {}]}
          disabled={!mode}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={[styles.continueText, !mode ? styles.disabledText : {}]}>
            {t('home.continueButton')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={!mode ? COLORS.disabledText : COLORS.white} style={{ marginLeft: SPACING.sm }} />
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md, // Butonun etrafında yeterli tıklama alanı olması için
  },
  scrollContent: {
    alignItems: 'center', // Yatayda ortalar
    justifyContent: 'center', // Dikeyde ortalar (flex-start'tan center'a değiştirildi)
    flexGrow: 1, // ScrollView içeriğinin mevcut alanı doldurmasını sağlar
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl, // En altta biraz boşluk bırakır
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    marginBottom: SPACING.sm, // Başlık ve sonraki eleman arası boşluk
    // marginTop: SPACING.md, // Bu satır kaldırılabilir veya ayarlanabilir, çünkü justifyContent: 'center' genel dikey ortalamayı sağlar
    textAlign: 'center',
    padding: 10, // Başlığın kendi iç boşluğu
  },
  subtitle: { // Bu stil şu anki kodda kullanılmıyor, ancak tanımlı
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl, // Önceki elemanla arasında boşluk
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignSelf: 'center', // Zaten alignItems: 'center' var scrollContent'te, bu ekstra olabilir ama zararı yok.
    width: '100%', // Genişliği konteynerin %100'ü yapar
    maxWidth: 340, // Maksimum genişlik sınırı
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  disabledText: {
    color: COLORS.disabledText,
  },
});
