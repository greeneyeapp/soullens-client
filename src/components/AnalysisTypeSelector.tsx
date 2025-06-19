import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCreditCosts } from '@/stores/useCreditCosts';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
  free: '#059669',
  freeBg: '#D1FAE5',
  loadingBadgeBg: '#E5E7EB', // Yükleniyor durumu için badge arkaplanı
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export type AnalysisType = 'self' | 'partner' | 'ex' | 'crush';

interface Props {
  onSelect: (type: AnalysisType) => void;
  selected: AnalysisType;
}

const icons: Record<AnalysisType, keyof typeof Ionicons.glyphMap> = {
  self: 'person-outline',
  partner: 'heart-outline',
  ex: 'skull-outline',
  crush: 'flame-outline',
};

export default function AnalysisTypeSelector({ onSelect, selected }: Props) {
  const { t } = useTranslation();
  const { creditCosts, loading: isLoadingCreditCosts } = useCreditCosts();
  const items: AnalysisType[] = ['self', 'partner', 'ex', 'crush'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analysis_type.title')}</Text>

      <View style={styles.gridContainer}>
        {items.map((type) => {
          const isActive = selected === type;
          let costDisplayElement: React.ReactNode;
          let actualCost = 0;
          let isActuallyFree = true;

          if (isLoadingCreditCosts) {
            costDisplayElement = <ActivityIndicator size="small" color={COLORS.primary} />;
          } else {
            actualCost = creditCosts?.analysis_types?.[type] ?? 0;
            isActuallyFree = actualCost === 0;
            costDisplayElement = (
              <Text style={[styles.creditText, isActuallyFree ? styles.freeText : (isActive ? styles.selectedCreditText : {})]}>
                {isActuallyFree ? t('analysis_type.free') : `💎 ${actualCost}`}
              </Text>
            );
          }

          return (
            <TouchableOpacity
              key={type}
              onPress={() => onSelect(type)}
              style={styles.cardWrapper}
              activeOpacity={0.85}
            >
              <View style={[styles.card, isActive && styles.selectedCard]}>
                <View style={[styles.iconContainer, isActive && styles.selectedIconContainer]}>
                  <Ionicons
                    name={icons[type]}
                    size={32}
                    color={isActive ? COLORS.white : COLORS.primary}
                  />
                </View>
                <Text style={[styles.label, isActive && styles.selectedLabel]}>
                  {t(`analysis_type.${type}`)}
                </Text>
                <View style={[
                  styles.creditBadge,
                  isLoadingCreditCosts ? styles.loadingBadge : (isActuallyFree ? styles.freeBadge : {})
                ]}>
                  {costDisplayElement}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    textAlign: 'center',
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  subtitle: {
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 160,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  selectedLabel: {
    color: COLORS.primary,
  },
  creditBadge: {
    minHeight: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
  },
  loadingBadge: {
    backgroundColor: COLORS.loadingBadgeBg,
  },
  freeBadge: {
    backgroundColor: COLORS.freeBg,
  },
  creditText: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.primary,
    textAlign: 'center',
  },
  selectedCreditText: {
  },
  freeText: {
    color: COLORS.free,
  },
});