// src/components/AdBanner.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { BannerAd, BannerAdSize, AdEventType } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '../config/admobConfig';

const { width } = Dimensions.get('window');

const AdBanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdLoaded = useCallback(() => {
    setIsLoaded(true);
    setError(null);
    console.log('Banner Ad Loaded Successfully');
  }, []);

  const handleAdFailedToLoad = useCallback((error: any) => {
    setIsLoaded(false);
    setError(error.message || 'Ad failed to load');
    console.error('Banner Ad Failed to Load: ', error);
  }, []);

  const handleAdOpened = useCallback(() => {
    console.log('Banner Ad Opened');
  }, []);

  const handleAdClosed = useCallback(() => {
    console.log('Banner Ad Closed');
  }, []);

  // Hata durumunda hiçbir şey gösterme
  if (error && !isLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['lifestyle', 'entertainment', 'photography'], // İlgili anahtar kelimeler
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={handleAdOpened}
        onAdClosed={handleAdClosed}
      />
      {!isLoaded && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Loading ad...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    backgroundColor: '#fdf2f8',
    minHeight: 60, // Minimum yükseklik
  },
  placeholder: {
    width: '100%',
    height: 50,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default AdBanner;