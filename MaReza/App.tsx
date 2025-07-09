import React, { useState, useEffect, useRef } from 'react';
import * as Font from 'expo-font';
import { Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import SplashScreenComponent from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import LoginForm from './components/LoginForm';

SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showPreload, setShowPreload] = useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Chargement de la police Roboto
  useEffect(() => {
    Font.loadAsync({
      'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  // Cache le splash natif Expo dès que tout est prêt côté JS, puis affiche le préload React 2s
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2500, // fondu de 2,5 secondes
        useNativeDriver: true,
      }).start();
      setTimeout(() => setShowPreload(false), 4000); // préload affiché 4 secondes
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || showPreload) {
    return <SplashScreenComponent fadeAnim={fadeAnim} />;
  }

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />;
  }

  return <HomeScreen onGo={() => setShowLogin(true)} />;
};

export default App; 