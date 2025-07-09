import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS, SIZES } from '../theme';

interface LoginFormProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async () => {
    if (isRedirecting) return; // Éviter les appels multiples
    
    try {
      const response = await fetch('http://192.168.1.12:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('Connexion réussie, redirection vers les salles...');
        setMessage('Connexion réussie !');
        setMessageType('success');
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
        
        // Rediriger immédiatement vers la page des salles
        setIsRedirecting(true);
        console.log('Appel de onLoginSuccess...');
        onLoginSuccess();
        console.log('onLoginSuccess appelé');
      } else {
        if (data.message === 'Mot de passe incorrect') {
          setMessage('Mot de passe incorrect ou utilisateur non enregistré.');
        } else if (data.message === 'Nom, email et mot de passe requis') {
          setMessage('Veuillez remplir tous les champs.');
        } else {
          setMessage(data.message || 'Erreur de connexion');
        }
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.formContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={40}
    >
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../assets/logo_reza-removebg-preview (1).png')}
          style={styles.logoForm}
          resizeMode="contain"
        />
        <Text style={styles.loginTitle}>Connexion</Text>
        {message !== '' && (
          <View style={[
            styles.messageBox,
            messageType === 'success' ? styles.successBox : styles.errorBox
          ]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#888"
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, paddingHorizontal: 0 }]}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={16}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.ctaForm} onPress={handleLogin}>
          <Text style={styles.ctaTextForm}>Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 260,
    marginBottom: 16,
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 8,
  },
  showPasswordText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginLeft: 8,
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
  messageBox: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  successBox: {
    backgroundColor: '#57cc99',
  },
  errorBox: {
    backgroundColor: '#e63946',
  },
  messageText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 