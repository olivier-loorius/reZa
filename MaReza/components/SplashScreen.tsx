import React from 'react';
import { View, Animated, StyleSheet, ImageStyle } from 'react-native';
import { COLORS } from '../theme';

interface SplashScreenProps {
  fadeAnim: Animated.Value;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ fadeAnim }) => {
  return (
    <View style={styles.splashContainer}>
      <Animated.Image
        source={require('../assets/logo_reza-removebg-preview (1).png')}
        style={[styles.logoSplash as ImageStyle, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSplash: {
    width: 450,
    height: 450,
  },
}); 