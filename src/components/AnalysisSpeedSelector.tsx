import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// === YENİ PEMBE TEMA RENKLERİ ===
const COLORS = {
  background: '#fdf2f8', // Ekran tarafından ayarlanır
  primary: '#db2777', // Ana Pembe
  primaryLight: '#FCE7F3', // Açık Pembe
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8', // Açık Pembe Kenarlık
  // Premium renkleri korunuyor
  premiumBorder: '#FBBF24',
  premiumText: '#D97706',
  premiumBadgeBg: '#FEF3C7',
};

// Boşluk Sabitleri
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Store ve hook yolları
import { useStepFlow } from '@/stores/useStepFlow';
import { useCreditCosts } from '@/stores/useCreditCosts';

export default function AnalysisSpeedSelector() {
  const { t } = useTranslation();
  const { mode, setStepData } = useStepFlow();
  const { creditCosts } = useCreditCosts();

  const speeds = [
    {
      value: 'fast',
      icon: 'flash-outline',
      title: t('analysis_speed.fast_title'),
      desc: t('analysis_speed.fast_description'),
      cost: creditCosts?.speeds?.fast || 0,
      isPremium: false,
    },
    {
      value: 'deep',
      icon: 'pulse-outline',
      title: t('analysis_speed.deep_title'),
      desc: t('analysis_speed.deep_description'),
      cost: creditCosts?.speeds?.deep || 0,
      isPremium: true,
    },
  ];

  return (
    <View style={styles.wrapper}>
      {speeds.map((opt) => {
        const isSelected = mode === opt.value;

        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.85}
            onPress={() => setStepData({ mode: opt.value as 'fast' | 'deep' })}
            // Premium kart için farklı kenarlık ve stil uyguluyoruz
            style={[
              styles.card,
              opt.isPremium && styles.premiumCard, // Premium stili önce gelir
              isSelected && (opt.isPremium ? styles.selectedPremiumCard : styles.selectedCard), // Seçili stil (premium ise farklı)
            ]}
          >
            {/* İkon Alanı */}
            <View style={[
              styles.iconContainer,
              // Premium kartın ikon arka planı farklı olabilir
              opt.isPremium && styles.premiumIconContainer,
              isSelected && styles.selectedIconContainer
            ]}>
              <Ionicons
                name={opt.icon as any}
                size={28}
                // Seçili ise beyaz, değilse ana pembe ikon (premium'da da aynı)
                color={isSelected ? COLORS.white : COLORS.primary}
              />
            </View>

            {/* Metin Alanı */}
            <View style={styles.textBox}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                  {opt.title}
                </Text>
                {opt.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>{t('loading.badge.premium')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.desc}>{opt.desc}</Text>
              <Text style={[styles.credits, isSelected && styles.selectedCredits]}>
                💎 {opt.cost} {t('analysis_speed.credit')}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 110,
  },
  premiumCard: {
    borderColor: COLORS.premiumBorder,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedPremiumCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  premiumIconContainer: {

  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 17,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    flexShrink: 1,
    marginRight: SPACING.sm,
  },
  selectedTitle: {
    color: COLORS.primary,
  },
  desc: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  credits: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.primary,
  },
  selectedCredits: {
    // color: COLORS.primary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.premiumBadgeBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 12,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.premiumText,
    marginLeft: SPACING.xs,
  },
});
