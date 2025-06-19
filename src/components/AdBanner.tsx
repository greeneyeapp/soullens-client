// src/components/AdBanner.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '../config/admobConfig';

const { width } = Dimensions.get('window');

const AdBanner = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // Kişiselleştirilmemiş reklamlar iste
        }}
        onAdFailedToLoad={error => {
          console.error('Banner Ad Failed to Load: ', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8, // Üstteki içerikle arasında biraz boşluk bırakmak için
    backgroundColor: '#fdf2f8', // Ekran arka plan rengiyle uyumlu hale getirin
  },
});

export default AdBanner;
