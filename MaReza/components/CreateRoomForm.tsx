import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS, SIZES } from '../theme';
import { Picker } from '@react-native-picker/picker';

interface CreateRoomFormProps {
  onBack: () => void;
}

interface User {
  name: string;
  email: string;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onBack }) => {
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [customEquipment, setCustomEquipment] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipmentList, setCustomEquipmentList] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedFloor, setSelectedFloor] = useState('');

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setMessage('Vous devez être connecté pour créer une salle');
        setMessageType('error');
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (error) {
      console.log('Erreur lors de la vérification de connexion');
      setMessage('Erreur de vérification de connexion');
      setMessageType('error');
      setTimeout(() => {
        onBack();
      }, 2000);
    }
  };

  const predefinedEquipment = [
    'Vidéo projecteur',
    'Tableau',
    'Climatisé',
    'Câblé'
  ];

  const toggleEquipment = (equipment: string) => {
    if (selectedEquipment.includes(equipment)) {
      setSelectedEquipment(selectedEquipment.filter(item => item !== equipment));
    } else {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };

  const addCustomEquipment = () => {
    if (customEquipment.trim() && !customEquipmentList.includes(customEquipment.trim())) {
      setCustomEquipmentList([...customEquipmentList, customEquipment.trim()]);
      setCustomEquipment('');
    }
  };

  const removeCustomEquipment = (equipment: string) => {
    setCustomEquipmentList(customEquipmentList.filter(item => item !== equipment));
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !capacity.trim() || !selectedFloor) {
      setMessage('Veuillez remplir tous les champs obligatoires.');
      setMessageType('error');
      return;
    }

    if (!user) {
      setMessage('Vous devez être connecté pour créer une salle');
      setMessageType('error');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmCreateRoom = async () => {
    setShowConfirmation(false);
    
    try {
      const response = await fetch('http://192.168.1.12:3001/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName.trim(),
          capacity: capacity.trim(),
          floor: selectedFloor,
          equipment: selectedEquipment,
          customEquipment: customEquipmentList,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Salle créée avec succès !');
        setMessageType('success');
        
        // Reset form after success
        setTimeout(() => {
          setRoomName('');
          setCapacity('');
          setCustomEquipment('');
          setDescription('');
          setSelectedEquipment([]);
          setCustomEquipmentList([]);
          setMessage('');
          setMessageType('');
          onBack();
        }, 2000);
      } else {
        setMessage(data.message || 'Erreur lors de la création de la salle');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
    }
  };

  const cancelCreateRoom = () => {
    setShowConfirmation(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Vérification de connexion...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={40}
    >
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Créer une salle</Text>
        <Text style={styles.subtitle}>Ajoutez une nouvelle salle à votre espace</Text>
        
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
          placeholder="Nom de la salle *"
          value={roomName}
          onChangeText={setRoomName}
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Capacité *"
          value={capacity}
          onChangeText={setCapacity}
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
        <View style={[styles.input, { paddingHorizontal: 0, paddingVertical: 0, height: 48, justifyContent: 'center' }]}> 
          <Picker
            selectedValue={selectedFloor}
            onValueChange={setSelectedFloor}
            style={{ color: COLORS.text, fontFamily: FONTS.regular, width: '100%' }}
            dropdownIconColor={COLORS.text}
          >
            <Picker.Item label="Sélectionner l'étage *" value="" color="#888" />
            <Picker.Item label="RDC" value="RDC" />
            <Picker.Item label="1er étage" value="1er" />
            <Picker.Item label="2ème étage" value="2ème" />
            <Picker.Item label="3ème étage" value="3ème" />
          </Picker>
        </View>

        <Text style={styles.sectionTitle}>Équipements</Text>
        
        <View style={styles.equipmentContainer}>
          {predefinedEquipment.map((equipment) => (
            <TouchableOpacity
              key={equipment}
              style={[
                styles.equipmentButton,
                selectedEquipment.includes(equipment) && styles.equipmentButtonSelected
              ]}
              onPress={() => toggleEquipment(equipment)}
            >
              <Text style={[
                styles.equipmentButtonText,
                selectedEquipment.includes(equipment) && styles.equipmentButtonTextSelected
              ]}>
                {equipment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Équipements personnalisés ajoutés */}
        {customEquipmentList.length > 0 && (
          <View style={styles.customEquipmentContainer}>
            <Text style={styles.customEquipmentTitle}>Équipements personnalisés :</Text>
            {customEquipmentList.map((equipment, index) => (
              <View key={index} style={styles.customEquipmentItem}>
                <Text style={styles.customEquipmentText}>{equipment}</Text>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeCustomEquipment(equipment)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Ajout d'équipement personnalisé */}
        <View style={styles.addEquipmentContainer}>
          <TextInput
            style={[styles.input, styles.customEquipmentInput]}
            placeholder="Ajouter un équipement"
            value={customEquipment}
            onChangeText={setCustomEquipment}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addCustomEquipment}
            disabled={!customEquipment.trim()}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
          <Text style={styles.createButtonText}>Créer la salle</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmation */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelCreateRoom}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Confirmer la création</Text>
            <Text style={styles.confirmationText}>
              Êtes-vous sûr de vouloir créer la salle "{roomName}" ?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelCreateRoom}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmCreateRoom}>
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CreateRoomForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subtitle,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: FONTS.regular,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    alignSelf: 'flex-start',
    fontFamily: FONTS.bold,
  },
  input: {
    width: '100%',
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
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  equipmentButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  equipmentButtonSelected: {
    backgroundColor: COLORS.accent,
  },
  equipmentButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  equipmentButtonTextSelected: {
    color: COLORS.background,
  },
  customEquipmentContainer: {
    width: '100%',
    marginBottom: 16,
  },
  customEquipmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    fontFamily: FONTS.bold,
  },
  customEquipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  customEquipmentText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  addEquipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  customEquipmentInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: SIZES.borderRadius,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  messageBox: {
    padding: 12,
    borderRadius: SIZES.borderRadius,
    marginBottom: 20,
    width: '100%',
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationModal: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  confirmationText: {
    fontSize: 16,
    color: COLORS.subtitle,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.subtitle,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
}); 