import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

interface LoginFormProps {
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack }) => {
  return (
    <View style={styles.formContainer}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={require('../assets/logo_reza-removebg-preview (1).png')}
        style={styles.logoForm}
        resizeMode="contain"
      />
      <Text style={styles.loginTitle}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.ctaForm} onPress={() => alert('Connexion à venir !')}>
        <Text style={styles.ctaTextForm}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // même que sur l'accueil
  },
  backButtonContainer: {
    position: 'absolute',
    top: 30,
    left: 15,
    zIndex: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 12,
  },
  backIcon: {
    fontSize: 38,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  logoForm: {
    width: 250,
    height: 250,
    marginTop: 0,
    marginBottom: 10,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  input: {
    width: 260,
    height: 48,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.inputBg,
    fontSize: SIZES.input,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  ctaForm: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: SIZES.borderRadius,
    marginTop: 18,
    elevation: 2,
    alignSelf: 'center',
  },
  ctaTextForm: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
  },
}); 