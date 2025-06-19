import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
  headerText: '#111827',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const CreditsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.title}>About greeneye app</Text>
          <Text style={styles.text}>
            SoulLens was brought to life by greeneye app — a team passionate about blending art, technology, and human emotion. Every feature is designed to inspire curiosity, spark imagination, and create unforgettable experiences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy</Text>

          <Text style={styles.text}>
            Last Updated: May 29, 2025
          </Text>

          <Text style={styles.subtitle}>1. Data We Collect</Text>
          <Text style={styles.text}>
            a) User-Provided Data: Photos uploaded for analysis are processed temporarily and deleted immediately after processing. This applies to all features including “partner”, “ex”, or “crush”.
          </Text>
          <Text style={styles.text}>
            b) Automatically Collected Data: Device type, OS, language, country, feature usage, and approximate location.
          </Text>
          <Text style={styles.text}>
            c) Third-Party Data: We receive purchase confirmations from Google Play or App Store (no payment data). Abstracted facial traits may be sent to OpenAI to generate premium text responses.
          </Text>

          <Text style={styles.subtitle}>2. How We Use Data</Text>
          <Text style={styles.text}>
            We use data to generate AI insights, track credit usage, deliver features, enhance experience, and ensure fraud protection.
          </Text>

          <Text style={styles.subtitle}>3. Data Storage and Retention</Text>
          <Text style={styles.text}>
            All photos are automatically deleted after analysis. Credit and history data is stored locally. OpenAI processes abstracted data in-memory and does not store it.
          </Text>

          <Text style={styles.subtitle}>3.1 Face Data Handling</Text>
          <Text style={styles.text}>
            SoulLens uses face data only during the moment of analysis. Photos are never stored — they are erased instantly after processing.
          </Text>
          <Text style={styles.text}>
            Only extracted features (e.g., "neutral expression", "appears 25 years old") are securely sent to OpenAI. The photo itself is never shared. OpenAI does not retain any of the data after the response.
          </Text>
          <Text style={styles.text}>
            SoulLens never stores, reuses, or sells any face data.
          </Text>

          <Text style={styles.subtitle}>4. Data Sharing</Text>
          <Text style={styles.text}>
            No user data is sold. Trusted third-parties: OpenAI (AI), Google/Apple (payments), Firebase & Sentry (analytics).
          </Text>

          <Text style={styles.subtitle}>5. User Rights</Text>
          <Text style={styles.text}>
            Delete the app to remove local data. Do not upload a photo if undesired. Request data removal or access at: support@greeneyeapp.com
          </Text>
          <Text style={styles.text}>
            To request data deletion directly, visit:{' '}
            <Text style={{ color: COLORS.primary }} onPress={() => Linking.openURL('https://greeneyeapp.com/data-deletion.html')}>
              https://greeneyeapp.com/data-deletion.html
            </Text>
          </Text>

          <Text style={styles.subtitle}>6. Data Security</Text>
          <Text style={styles.text}>
            All communication is encrypted. Photos are deleted immediately. Local data is stored securely.
          </Text>

          <Text style={styles.subtitle}>7. Children’s Privacy</Text>
          <Text style={styles.text}>
            The app is not intended for users under 13. If we identify such data, we delete it immediately.
          </Text>

          <Text style={styles.subtitle}>8. Changes to This Policy</Text>
          <Text style={styles.text}>
            Policy may change. Major updates will be shown in-app. Latest version is always accessible here.
          </Text>

          <Text style={styles.subtitle}>9. Contact</Text>
          <Text style={styles.text}>
            Questions or requests? Contact: support@greeneyeapp.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Used Libraries</Text>
          <Text style={styles.subtitle}>Deepface</Text>
          <Text style={styles.licenseTitle}>MIT License</Text>
          <Text style={styles.licenseText}>Copyright (c) 2019 Sefik Ilkin Serengil</Text>
          <Text style={styles.licenseText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
          </Text>
          <Text style={styles.licenseText}>
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
          </Text>
          <Text style={styles.licenseText}>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.headerText,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.textSecondary,
  },
  licenseTitle: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  licenseText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
});

export default CreditsScreen;