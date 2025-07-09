import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

interface HomeScreenProps {
  onGo: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGo }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo_reza-removebg-preview (1).png')}
        style={styles.logoAccueil}
        resizeMode="contain"
      />
      <View style={styles.centerContent}>
        <Text style={styles.title}>Bienvenue sur RéZa !</Text>
        <Text style={styles.subtitle}>L'appli pour réserver la salle qui te faut</Text>
      </View>
      <TouchableOpacity style={styles.ctaAccueil} onPress={onGo}>
        <Text style={styles.ctaText}>GO !</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoAccueil: {
    width:250,
    height: 250,
    marginBottom: 10,
  },
  centerContent: {
    marginBottom: 10,
    alignItems: 'center',
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: '900', // plus en gras
    marginBottom: 6,
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.subtitle,
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: FONTS.regular,
  },
  ctaAccueil: {
    backgroundColor:'#57cc99',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: SIZES.borderRadiusLarge,
    marginBottom: 600,
    elevation: 2,
    alignSelf: 'center',
    marginTop: 100, 
  },
  ctaText: {
    color: '#222',
    fontWeight: '900', // plus en gras
    fontSize: SIZES.button + 6, // un peu plus grand
    letterSpacing: 2,
    fontFamily: FONTS.bold,
  },
}); 