import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/stores/useUserStore';

const COLORS = {
  primary: '#db2777',
  primaryLight: '#FCE7F3',
  white: '#FFFFFF',
  border: '#FBCFE8',
  iconColor: '#db2777',
  textColor: '#db2777',
  badgeBackground: '#FFFFFF',
};

const SPACING = {
  xs: 4,
  sm: 6,
  md: 12,
};

export default function CreditDisplay() {
  const navigation = useNavigation();
  const credits = useUserStore((state) => state.credits);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Purchase' as never)}
      activeOpacity={0.7}
    >
      <Ionicons name="diamond-outline" size={18} color={COLORS.iconColor} />
      <Text style={styles.creditText}>{credits !== null ? credits : '-'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeBackground,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  creditText: {
    marginLeft: SPACING.sm,
    color: COLORS.textColor,
    fontSize: 15,
    fontFamily: Platform.select({
      ios: 'Roboto-Regular',
      android: 'Montserrat-Regular',
    })
  },
});