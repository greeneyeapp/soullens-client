import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import CreditDisplay from '@/components/CreditDisplay';
import api from '@/lib/axiosInstance';
import { useUserStore } from '@/stores/useUserStore';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import type { StoreTransaction } from 'react-native-purchases';
import animation from 'assets/animations/diamond.json';
import localizedPackages from '../locales/packages-localized.json';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
  iconColor: '#db2777',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function PurchaseScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { setUserCredits } = useUserStore();
  const [rcPackages, setRcPackages] = useState<PurchasesPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [errorLoadingPackages, setErrorLoadingPackages] = useState(false);

  const fetchRcPackages = useCallback(async () => {
    setLoadingPackages(true);
    setErrorLoadingPackages(false);
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const sorted = [...offerings.current.availablePackages].sort(
          (a, b) => a.product.price - b.product.price
        );
        setRcPackages(sorted);
      } else {
        setRcPackages([]);
        setErrorLoadingPackages(true);
      }
    } catch (e: any) {
      console.error('RevenueCat fetch error (PurchaseScreen):', e.message, e.code);
      setRcPackages([]);
      setErrorLoadingPackages(true);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    fetchRcPackages();
  }, [fetchRcPackages, i18n.language]);

  const handlePurchase = async (selectedPackage: PurchasesPackage) => {
    if (purchasingId) return;

    setPurchasingId(selectedPackage.identifier);

    try {
      const purchaseResult = await Purchases.purchasePackage(selectedPackage);

      const storeProductIdentifier = purchaseResult.productIdentifier; // Satın alınan ürünün Store ID'si
      const transaction: StoreTransaction | null | undefined = purchaseResult.transaction;
      const customerInfo = purchaseResult.customerInfo;

      if (!transaction || !transaction.transactionIdentifier) {
        console.error('Purchase Error (PurchaseScreen): StoreTransaction or its transactionIdentifier is missing.');
        throw new Error('StoreTransaction or transactionIdentifier missing after purchase. Ensure react-native-purchases is v5.0.0+ and the purchase completed on the store.');
      }

      const uniqueStoreTransactionId = transaction.transactionIdentifier;

      const revenueCatAppUserId = customerInfo?.originalAppUserId || await Purchases.getAppUserID();
      if (!revenueCatAppUserId) {
        console.error('Purchase Error (PurchaseScreen): Could not retrieve RevenueCat App User ID.');
        throw new Error('Could not retrieve RevenueCat App User ID.');
      }

      const payload = {
        product_id: storeProductIdentifier,
        store_transaction_id: uniqueStoreTransactionId,
        rc_app_user_id: revenueCatAppUserId,
        lang: i18n.language,
        platform: Platform.OS,
      };

      const res = await api.post('/user/purchase', payload);
      if (res.data?.success) {
        if (typeof res.data.new_credits === 'number') {
          setUserCredits(res.data.new_credits);
        }
        navigation.navigate('CreditSuccess');
      } else {
        console.warn('Purchase backend processing failed (PurchaseScreen):', res.data);
        navigation.navigate('CreditFailed');
      }
    } catch (error: any) {
      console.error('Purchase error (PurchaseScreen):', error.message, error.code, error.userCancelled);
      if (error.userCancelled !== true && error.code !== '1') {
        navigation.navigate('CreditFailed');
      }
    } finally {
      setPurchasingId(null);
    }
  };

  const renderPackages = () =>
    rcPackages.map((pack) => {
      const isPurchasing = purchasingId === pack.identifier;
      const localData = localizedPackages[pack.identifier];
      const title = localData?.labels?.[i18n.language] || pack.product.title;
      const description = localData?.descriptions?.[i18n.language] || pack.product.description;
      const creditAmount = localData?.credits ?? null;

      return (
        <TouchableOpacity
          key={pack.identifier}
          style={[styles.card, isPurchasing && styles.disabledCard]}
          onPress={() => handlePurchase(pack)}
          disabled={!!purchasingId}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="diamond-outline" size={24} color={COLORS.iconColor} />
            {creditAmount && <Text style={styles.creditsAmount}>{creditAmount}</Text>}
          </View>
          <View style={styles.cardText}>
            <Text style={styles.creditText}>{title}</Text>
            <Text style={styles.packageDescription}>{description}</Text>
          </View>
          {isPurchasing && (
            <View style={styles.purchaseLoadingOverlay}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
        </TouchableOpacity>
      );
    });

  const NoPackagesView = () => (
    <View style={styles.centeredMessageContainer}>
      <Text style={styles.centeredMessageText}>
        {t('purchase.no_packages_found', 'Kredi paketleri şu anda yüklenemedi. Lütfen internet bağlantınızı kontrol edin ve daha sonra tekrar deneyin.')}
      </Text>
      <TouchableOpacity onPress={fetchRcPackages} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>{t('purchase.retry', 'Tekrar Dene')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <CreditDisplay />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LottieView source={animation} autoPlay loop style={styles.lottie} />
        <Text style={styles.title}>{t('purchase.title')}</Text>
        <Text style={styles.subtitle}>{t('purchase.subtitle')}</Text>
        {loadingPackages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('loading_packages') || 'Loading packages...'}</Text>
          </View>
        ) : errorLoadingPackages || rcPackages.length === 0 ? (
          <NoPackagesView />
        ) : (
          renderPackages()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.sm,
    paddingBottom: SPACING.sm,
    width: '100%',
  },
  headerBackButton: { padding: SPACING.sm, marginRight: SPACING.md },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  lottie: {
    width: 120,
    height: 120,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    minHeight: 200,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  disabledCard: { opacity: 0.6 },
  iconContainer: { alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  creditsAmount: {
    fontSize: 14,
    color: COLORS.iconColor,
    marginTop: 4,
    textAlign: 'center',
  },
  cardText: { flex: 1 },
  creditText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  packageDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  purchaseLoadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    minHeight: 200,
  },
  centeredMessageText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
