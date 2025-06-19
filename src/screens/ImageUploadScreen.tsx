import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStepFlow } from '@/stores/useStepFlow';
import CreditDisplay from '@/components/CreditDisplay';
import ModalConfirm from '@/components/ModalConfirm'; // Updated ModalConfirm
import { useUserStore } from '@/stores/useUserStore';
import ImageUploadInfoModal from '@/components/ImageUploadInfoModal';
import { useCreditCosts } from '@/stores/useCreditCosts';
import ModalInsufficientCredits from '@/components/ModalInsufficientCredits';

const COLORS = {
  background: '#fdf2f8',
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#FBCFE8',
  placeholderBg: '#FCE7F3',
  placeholderBorder: '#FBCFE8',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function ImageUploadScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { analysisType, mode } = useStepFlow();

  // --- User Store Data ---
  // It's crucial that App.tsx correctly populates has_daily_free_premium_analysis in the store.
  const currentUserCredits = useUserStore((state) => state.credits);
  const hasDailyFreePremium = useUserStore((state) => state.has_daily_free_premium_analysis);
  // Fetch user data function if you need to refresh it, e.g., after an analysis
  // const fetchUserData = useUserStore((state) => state.fetchUserData); // Assuming you have this

  const creditCosts = useCreditCosts((state) => state.creditCosts);

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  const [costForCurrentAnalysis, setCostForCurrentAnalysis] = useState<number>(0);
  const [isAttemptFree, setIsAttemptFree] = useState<boolean>(false);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => handler.remove();
  }, [navigation]);

  useEffect(() => {
    // Show info modal on screen load, only once
    setIsInfoModalVisible(true);
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('error_title'), t('no_permission'));
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8, // Consider image size for uploads
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert(t('error_title'), t('image_pick_error') || 'Resim seçilemedi.');
    }
  };

  const getActualCreditCost = (): number => {
    const currentAnalysisType = analysisType || 'self';
    const currentMode = mode || 'fast';

    if (currentAnalysisType === 'self') {
      return 0;
    }
    if (!creditCosts || !creditCosts.analysis_types || !creditCosts.speeds) {
      console.warn('Credit costs not loaded yet in getActualCreditCost.');
      // Return a high cost or handle this case more gracefully,
      // e.g., by disabling the analyze button until costs are loaded.
      return 999; // Placeholder for unloaded costs
    }
    const analysisCost = creditCosts.analysis_types[currentAnalysisType] || 0;
    const speedCost = creditCosts.speeds[currentMode] || 0;
    return analysisCost + speedCost;
  };

  const handlePurchaseNavigation = () => {
    setShowInsufficientCreditsModal(false);
    navigation.navigate('Purchase' as never);
  };

  const handleAnalyzePress = () => {
    if (!image) {
      Alert.alert(t('error_title'), t('image_upload.select_first'));
      return;
    }

    const currentAnalysisType = analysisType || 'self';

    if (currentAnalysisType === 'self') {
      // "Self" analysis is always free and doesn't consume the daily free right.
      // It also doesn't need credit confirmation.
      setCostForCurrentAnalysis(0); // For clarity, though not strictly needed for direct navigation
      setIsAttemptFree(true);      // For clarity
      navigation.navigate('Loading' as never, { image } as never);
      return;
    }

    // For non-"self" types, check for daily free premium analysis
    // hasDailyFreePremium can be true, false, or null (if not loaded yet from the store)
    if (hasDailyFreePremium === true) {
      console.log('Attempting to use daily free premium analysis.');
      setCostForCurrentAnalysis(0); // Free analysis means 0 cost for this attempt
      setIsAttemptFree(true);
      setShowConfirmModal(true); // Show confirmation modal for using the free analysis
    } else {
      // Daily free premium not available (false) or not yet determined (null).
      // Proceed with normal credit check.
      if (hasDailyFreePremium === null) {
        console.warn('hasDailyFreePremium flag is null (user data might still be loading or not set). Proceeding as if no free analysis is available.');
        // Optionally, you could show a loading state or prevent action until the flag is determined.
        // For now, it falls through to paid analysis logic.
      }
      console.log('Daily free premium not available or already used. Checking credits.');
      const requiredCredits = getActualCreditCost();
      setCostForCurrentAnalysis(requiredCredits);
      setIsAttemptFree(false);

      if (currentUserCredits === null || currentUserCredits === undefined) {
        Alert.alert(t('error_title'), t('credit_info_loading'));
        return;
      }

      if (currentUserCredits >= requiredCredits) {
        setShowConfirmModal(true); // Show confirmation modal for paid analysis
      } else {
        setShowInsufficientCreditsModal(true); // Not enough credits
      }
    }
  };

  const onConfirmAnalysis = () => {
    setShowConfirmModal(false);
    // The backend will handle whether it's free or deducts credits.
    // Client doesn't send an "isFree" flag for the /analyze/premium call.
    // After analysis, you might want to refresh user data to update
    // hasDailyFreePremium and credits, e.g., in ResultScreen or on focus here.
    navigation.navigate('Loading' as never, { image } as never);
  };

  const renderPlaceholder = () => (
    <TouchableOpacity style={styles.placeholderContainer} onPress={pickImage} activeOpacity={0.7}>
      <MaterialCommunityIcons name="image-plus" size={52} color={COLORS.primary} />
      <Text style={styles.placeholderText}>{t('image_upload_load_text')}</Text>
    </TouchableOpacity>
  );

  const renderImagePreview = () => (
    <>
      <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
        <Image source={{ uri: image?.uri }} style={styles.preview} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryButton} onPress={handleAnalyzePress} activeOpacity={0.8}>
        <Ionicons name="analytics-outline" size={20} color={COLORS.white} style={{ marginRight: SPACING.sm }} />
        <Text style={styles.buttonText}>{t('image_upload.analyze')}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <CreditDisplay />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('image_upload.title')}</Text>
        {image ? renderImagePreview() : renderPlaceholder()}
      </ScrollView>

      <ModalConfirm
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={onConfirmAnalysis}
        credit={costForCurrentAnalysis} // Will be 0 if isAttemptFree is true
        isFreeAnalysis={isAttemptFree}  // Pass the flag to ModalConfirm
      />

      <ModalInsufficientCredits
        visible={showInsufficientCreditsModal}
        requiredCredits={costForCurrentAnalysis} // This will be the actual cost if not free
        currentCredits={currentUserCredits ?? 0} // Provide a fallback for currentCredits
        onClose={() => setShowInsufficientCreditsModal(false)}
        onPurchase={handlePurchaseNavigation}
      />

      <ImageUploadInfoModal
        visible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
      />
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
  backButton: {
    padding: SPACING.sm,
    // marginRight: SPACING.md, // Can be adjusted based on CreditDisplay width
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  placeholderContainer: {
    width: '100%',
    maxWidth: 300,
    height: 280,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.placeholderBorder,
    borderStyle: 'dashed',
    backgroundColor: COLORS.placeholderBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  placeholderText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.primary,
    textAlign: 'center',
  },
  preview: {
    width: 280,
    height: 280,
    resizeMode: 'cover',
    borderRadius: 16,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    fontSize: 16,
    textAlign: 'center',
  },
});
