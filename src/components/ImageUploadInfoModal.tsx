import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const COLORS = {
  primary: '#db2777',
  primaryLight: '#fce7f3',
  text: '#1f2937',
  textSecondary: '#4b5563',
  white: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.65)',
  border: '#fbcfe8',
};

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ImageUploadInfoModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="information-circle-outline" size={28} color={COLORS.primary} style={styles.headerIcon} />
            <Text style={styles.modalTitle}>{t('image_upload.info_modal_title')}</Text>
          </View>

          <Image
            source={require('../../assets/images/true-face.png')}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <Text style={styles.modalMessage}>
            {t('image_upload.info_modal_message')}
          </Text>

          <TouchableOpacity style={styles.confirmButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>{t('image_upload.info_modal_close')}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    width: '95%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: SPACING.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    color: COLORS.text,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 180,
    marginBottom: SPACING.xl,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    }),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl + SPACING.sm,
    borderRadius: 12,
    marginTop: SPACING.sm,
    width: '90%',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    fontSize: 16,
  },
});