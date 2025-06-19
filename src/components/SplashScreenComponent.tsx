import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashScreenComponent() { 
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
    
  }, [fadeAnim]); 

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
});