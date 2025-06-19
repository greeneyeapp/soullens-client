import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const COLORS = {
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.5)',
  warning: '#f97316',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface Props {
  visible: boolean;
  requiredCredits: number;
  currentCredits: number | null | undefined;
  onClose: () => void;
  onPurchase: () => void;
}

export default function ModalInsufficientCredits({
  visible,
  requiredCredits,
  currentCredits,
  onClose,
  onPurchase
}: Props) {
  const { t } = useTranslation();

  const displayCurrentCredits = currentCredits ?? 0;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Ionicons name="alert-sharp" size={48} color={COLORS.warning} style={styles.icon} />

          <Text style={styles.title}>
            {t('insufficient_credit_title') || 'Yetersiz Kredi'}
          </Text>

          <Text style={styles.message}>
            {t('insufficient_credit_message', {
              required: requiredCredits,
              current: displayCurrentCredits
            }) || `Bu analiz için ${requiredCredits} krediye ihtiyacınız var. Mevcut krediniz: ${displayCurrentCredits}. Kredi almak ister misiniz?`}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.buttonBase, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonTextBase, styles.cancelText]}>
                {t('cancel') || 'İptal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonBase, styles.purchaseButton]}
              onPress={onPurchase}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonTextBase, styles.purchaseText]}>
                {t('purchase_credits_button') || 'Kredi Al'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalBox: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 8,
  },
  icon: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.warning,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonBase: {
    paddingVertical: SPACING.md - 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonTextBase: {
    fontSize: 15,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  cancelText: {
    color: COLORS.textSecondary,
  },
  purchaseText: {
    color: COLORS.white,
  },
});