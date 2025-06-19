import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
};

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const languages = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'id', label: '🇮🇩 Bahasa Indonesia' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'tl', label: '🇵🇭 Filipino' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'he', label: '🇮🇱 עברית' }
];

const USER_LANGUAGE_KEY = 'user_language';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      await SecureStore.setItemAsync(USER_LANGUAGE_KEY, lang);
      console.log(`Dil değiştirildi ve kaydedildi: ${lang}`);
    } catch (error) {
      console.error("Dil tercihi kaydedilemedi:", error);
    }
    navigation.goBack();
  };

  const currentLanguageCode = i18n.language;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('change_language') ?? 'Change Language'}</Text>

        {languages.map(lang => {
          const isSelected = currentLanguageCode === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                isSelected && styles.selectedLanguageButton
              ]}
              onPress={() => changeLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageText,
                isSelected && styles.selectedLanguageText
              ]}>
                {lang.label}
              </Text>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} style={styles.checkIcon} />}
            </TouchableOpacity>
          );
        })}

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
  headerBackButton: {
    padding: SPACING.sm,
  },
  headerPlaceholder: {
    width: 28 + SPACING.sm * 2,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: 24,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    color: COLORS.primary,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
    width: '100%',
    maxWidth: 500,
  },
  selectedLanguageButton: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  languageText: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.text,
    flex: 1,
  },
  selectedLanguageText: {
    color: COLORS.primary,
  },
  checkIcon: {
    marginLeft: SPACING.md,
  },
});
