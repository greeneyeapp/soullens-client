import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

type Props = {
  analysisType: 'self' | 'partner' | 'ex' | 'crush';
  mode: 'fast' | 'deep';
};

export default function PremiumOfferCard({ analysisType, mode }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('premium_offer.title')}</Text>
      <Text style={styles.description}>
        {t(`premium_offer.descriptions.${analysisType}.${mode}`)}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Purchase' as never)}
        style={styles.button}
      >
        <Ionicons name="diamond" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.buttonText}>{t('premium_offer.button')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    padding: 20,
    marginTop: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    color: '#92400e',
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#78350f',
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
});

