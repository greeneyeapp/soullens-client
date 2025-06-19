// src/hooks/useInterstitialAd.ts
import { useEffect, useState } from 'react';
import {
  InterstitialAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { interstitialAdUnitId } from '../config/admobConfig';

export const useInterstitialAd = () => {
  const [ad, setAd] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Reklamı oluştur ve yükle
  const loadAd = () => {
    // Eğer zaten bir reklam varsa veya yüklüyorsa tekrar yükleme
    if (ad || loaded) {
      return;
    }

    const newAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const loadListener = newAd.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
      console.log('Interstitial ad loaded.');
    });

    const errorListener = newAd.addAdEventListener(AdEventType.ERROR, error => {
      console.error('Interstitial ad failed to load: ', error);
      setLoaded(false); // Hata durumunda yüklendi durumunu sıfırla
    });

    newAd.load();
    setAd(newAd); // Oluşturulan reklamı state'e ata

    // Hook unmount olduğunda listener'ları temizle
    return () => {
      loadListener.remove();
      errorListener.remove();
    };
  };

  // Reklamı göster
  const showAd = (onAdClosed: () => void) => {
    if (ad && loaded) {
      const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed.');
        onAdClosed(); // Reklam kapandığında geri çağırım fonksiyonunu çalıştır
        closeListener.remove();
        setAd(null); // Reklamı sıfırla ki tekrar yüklenebilsin
        setLoaded(false);
      });

      ad.show();
    } else {
      console.log('Ad not loaded, skipping show.');
      onAdClosed(); // Reklam yoksa bile devam et
    }
  };

  return {
    loadAd,
    showAd,
    isAdLoaded: loaded,
  };
};
