import { useEffect, useState, useRef, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { interstitialAdUnitId } from '../config/admobConfig';

export const useInterstitialAd = () => {
  const [ad, setAd] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadAd = useCallback(() => {
    if (ad || loaded || loading) {
      console.log('Ad already loaded or loading');
      return;
    }

    setLoading(true);
    console.log('Starting to load interstitial ad...');

    const newAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['lifestyle', 'entertainment', 'photography'],
    });

    const loadListener = newAd.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
      console.log('Interstitial ad loaded successfully.');
      
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    });

    const errorListener = newAd.addAdEventListener(AdEventType.ERROR, error => {
      console.error('Interstitial ad failed to load: ', error);
      setLoaded(false);
      setLoading(false);
      setAd(null);
      
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    });

    // 30 saniye sonra timeout
    loadTimeoutRef.current = setTimeout(() => {
      if (loading && !loaded) {
        console.warn('Interstitial ad load timeout');
        setLoading(false);
        loadListener.remove();
        errorListener.remove();
      }
    }, 30000);

    newAd.load();
    setAd(newAd);

    return () => {
      loadListener.remove();
      errorListener.remove();
    };
  }, [ad, loaded, loading]);

  const showAd = useCallback((onAdClosed?: () => void) => {
    if (!ad || !loaded) {
      console.log('Ad not ready, calling onAdClosed immediately');
      onAdClosed?.();
      return;
    }

    console.log('Showing interstitial ad...');

    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed.');
      onAdClosed?.();
      closeListener.remove();
      
      // Reklam gösterildikten sonra sıfırla
      setAd(null);
      setLoaded(false);
      
      // Yeni reklam yükle
      setTimeout(() => {
        loadAd();
      }, 1000);
    });

    ad.show();
  }, [ad, loaded, loadAd]);

  // Component unmount olduğunda cleanup
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadAd,
    showAd,
    isAdLoaded: loaded,
    isAdLoading: loading,
  };
};