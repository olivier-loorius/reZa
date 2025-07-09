import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

interface HomeScreenProps {
  onGo: () => void;
  onRooms: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGo, onRooms }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo_reza-removebg-preview (1).png')}
        style={styles.logoAccueil}
        resizeMode="contain"
      />
      <View style={styles.centerContent}>
        <Text style={styles.title}>Bienvenue sur RéZa !</Text>
        <Text style={styles.subtitle}>L'appli pour réserver la salle qui te faut</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.ctaAccueil} onPress={onGo}>
          <Text style={styles.ctaText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roomsButton} onPress={onRooms}>
          <Text style={styles.roomsButtonText}>Nos salles</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: '900', 
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
  buttonContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  ctaAccueil: {
    backgroundColor:'#57cc99',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: SIZES.borderRadius,
    elevation: 2,
    alignSelf: 'center',
    marginBottom: 20,
    width: 200,
    alignItems: 'center',
  },
  ctaText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  roomsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: SIZES.borderRadius,
    elevation: 2,
    alignSelf: 'center',
    width: 200,
    alignItems: 'center',
  },
  roomsButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
}); 