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
  border: '#FBCFE8',
  overlay: 'rgba(0,0,0,0.5)',
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
  credit: number; // This will be 0 if isFreeAnalysis is true
  onConfirm: () => void;
  onCancel: () => void;
  isFreeAnalysis?: boolean; // New prop to indicate if the analysis is free
}

export default function ModalConfirm({
  visible,
  credit,
  onConfirm,
  onCancel,
  isFreeAnalysis = false, // Default to false
}: Props) {
  const { t } = useTranslation();

  const title = isFreeAnalysis
    ? t('modal_confirm.free_title')
    : t('modal_confirm.paid_title'); // Or your existing 'confirm_title'

  const message = isFreeAnalysis
    ? t('modal_confirm.free_message')
    : t('modal_confirm.paid_message', { credit: credit, count: credit }); // Pass credit for interpolation

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Ionicons
            name={isFreeAnalysis ? "gift-outline" : "alert-circle"} // Different icon for free
            size={48}
            color={COLORS.primary}
            style={styles.icon}
          />
          <Text style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>
            {message}
            {!isFreeAnalysis && credit > 0 && ( // Only show credit amount if it's a paid analysis and cost > 0
              <Text style={styles.creditHighlight}> </Text> // The message already contains it via interpolation
            )}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.buttonBase, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonTextBase, styles.cancelText]}>
                {t('modal_confirm.cancel_button') || 'İptal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonBase, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonTextBase, styles.confirmText]}>
                {t('modal_confirm.confirm_button') || 'Evet, başla'}
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
    color: COLORS.primary,
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
  creditHighlight: { // This style might not be explicitly needed if message is interpolated
    color: COLORS.textSecondary, // Kept for consistency if used elsewhere
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Changed from space-between if buttons can have varying widths
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
  confirmButton: {
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
    color: COLORS.primary,
  },
  confirmText: {
    color: COLORS.white,
  },
});
