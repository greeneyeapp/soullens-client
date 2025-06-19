import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';

const COLORS = {
  gradientStart: '#FFFDE7',
  gradientEnd: '#FFF9C3',
  premiumBannerBorder: '#FDE047',
  premiumBannerText: '#78350F',
  sparkleIconColor: '#F59E0B',
  shadowColor: '#D97706',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
};

interface FreePremiumBannerProps {
  visible: boolean;
}

const AnimatedSparkle: React.FC<{ delay?: number; left?: boolean }> = ({ delay = 0, left = false }) => {
  return (
    <MotiView
      from={{ scale: 0.7, opacity: 0.5, rotate: left ? '15deg' : '-15deg' }}
      animate={{
        scale: [1, 1.15, 1, 1.15, 1],
        opacity: [0.7, 1, 0.7, 1, 0.7],
        rotate: left ? ['15deg', '-5deg', '10deg', '-10deg', '15deg'] : ['-15deg', '5deg', '-10deg', '10deg', '-15deg'],
      }}
      transition={{
        type: 'timing',
        duration: 2800,
        loop: true,
        delay: delay,
      }}
      style={styles.sparkleWrapper}
    >
      <Ionicons name="sparkles-outline" size={24} color={COLORS.sparkleIconColor} />
    </MotiView>
  );
};

const FreePremiumBanner: React.FC<FreePremiumBannerProps> = ({ visible }) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.85, translateY: -30 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.8, delay: 100 }}
      style={styles.bannerOuterContainer}
    >
      <View style={styles.bannerInnerContainer}>
        <AnimatedSparkle left delay={0} />
        <Text style={styles.bannerText}>
          {t('free_premium_banner.available_today_message')}
        </Text>
        <AnimatedSparkle delay={400} />
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  bannerOuterContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    borderRadius: 18,
  },
  bannerInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gradientStart,
    paddingVertical: SPACING.md - 1,
    paddingHorizontal: SPACING.md,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.premiumBannerBorder,
    overflow: 'hidden',
  },
  sparkleWrapper: {
    paddingHorizontal: SPACING.sm - 2,
  },
  bannerText: {
    fontSize: Platform.OS === 'ios' ? 14.5 : 14,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: COLORS.premiumBannerText,
    textAlign: 'center',
    marginHorizontal: SPACING.xs,
    lineHeight: Platform.OS === 'ios' ? 18 : 20,
  },
});

export default FreePremiumBanner;