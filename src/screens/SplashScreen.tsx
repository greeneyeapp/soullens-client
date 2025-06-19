import React, { useEffect, useRef, useState  } from 'react';
import { StyleSheet, Dimensions, Animated, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function SplashScreenComponent() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messageFadeAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);
  const { t } = useTranslation();

  const messages = t('splash.messages', { returnObjects: true });

  useEffect(() => {
    // Logo fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Message cycling
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(messageFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change message
        setMessageIndex(prev => (prev + 1) % messages.length);
        // Fade in
        Animated.timing(messageFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <LinearGradient
      colors={['#fce7f3', '#fdf2f8']}
      style={styles.container}
    >
      <Animated.Image
        source={require('../../assets/logo/greeneye-logo.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />

      <Animated.Text style={[styles.message, { opacity: messageFadeAnim }]}>
        {messages[messageIndex]}
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
  },
  message: {
    marginTop: 24,
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    fontFamily: Platform.select({
      ios: 'Roboto-Bold',
      android: 'Montserrat-Bold',
    }),
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
