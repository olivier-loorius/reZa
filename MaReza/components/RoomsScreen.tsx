import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS, SIZES } from '../theme';
import RoomCard from './RoomCard';

interface RoomsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onCreateRoom: () => void;
  onGoToLogin: () => void;
  onRoomDetail: (room: Room) => void;
}

interface User {
  name: string;
  email: string;
}

interface Room {
  id: string;
  name: string;
  capacity: string;
  equipment: string[];
  customEquipment: string[];
  description?: string;
  floor?: string;
}

const RoomsScreen: React.FC<RoomsScreenProps> = ({ onBack, onLogout, onCreateRoom, onGoToLogin, onRoomDetail }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Erreur lors de la récupération des données utilisateur');
      }
    };
    getUser();
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch('http://192.168.1.12:3001/rooms');
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      } else {
        console.log('Erreur lors du chargement des salles');
      }
    } catch (error) {
      console.log('Erreur lors du chargement des salles:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
      setShowUserMenu(false);
      onLogout();
    } catch (error) {
      console.log('Erreur lors de la déconnexion');
    }
  };

  const handleUserPress = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleCreateRoomPress = () => {
    if (!user) {
      setShowLoginWarning(true);
    } else {
      onCreateRoom();
    }
  };

  const handleRoomPress = (room: Room) => {
    onRoomDetail(room);
  };

  return (
    <View style={styles.container}>
      {/* Fixed Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo_reza-removebg-preview (1).png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Nos salles</Text>
        <Text style={styles.subtitle}>Découvre nos espaces disponibles</Text>
        
        <TouchableOpacity style={styles.createRoomButton} onPress={handleCreateRoomPress}>
          <Text style={styles.createRoomButtonText}>+ Créer une salle</Text>
        </TouchableOpacity>
        
        {/* Rooms List */}
        {rooms.length > 0 ? (
          <View style={styles.roomsContainer}>
            <Text style={styles.roomsTitle}>Salles disponibles ({rooms.length})</Text>
            {rooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onPress={() => handleRoomPress(room)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune salle créée</Text>
            <Text style={styles.emptyStateSubtext}>Créez votre première salle pour commencer</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed User Status - Bottom Right */}
      <TouchableOpacity style={styles.userStatusContainer} onPress={handleUserPress}>
        <View style={styles.userCircle}>
          <Text style={styles.userInitials}>
            {user ? getInitials(user.name) : 'U'}
          </Text>
          {user && <View style={styles.connectionIndicator} />}
        </View>
      </TouchableOpacity>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenu}>
            <Text style={styles.userMenuTitle}>
              {user ? user.name : 'Utilisateur'}
            </Text>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Se déconnecter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItemSecondary} onPress={onGoToLogin}>
              <Text style={styles.menuItemTextSecondary}>Retour au login</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Login Warning Modal */}
      <Modal
        visible={showLoginWarning}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningTitle}>Connexion requise</Text>
            <Text style={styles.warningText}>
              Vous devez être connecté pour créer une salle.
            </Text>
            <View style={styles.warningButtons}>
              <TouchableOpacity 
                style={styles.warningCancelButton} 
                onPress={() => setShowLoginWarning(false)}
              >
                <Text style={styles.warningCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.warningLoginButton} 
                onPress={() => {
                  setShowLoginWarning(false);
                  onGoToLogin();
                }}
              >
                <Text style={styles.warningLoginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RoomsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 140,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.subtitle,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    marginBottom: 30,
  },
  createRoomButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
    width: '80%',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  createRoomButtonText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  roomsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  roomsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontFamily: FONTS.bold,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.subtitle,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  userStatusContainer: {
    position: 'absolute',
    bottom: 80,
    right: 25,
    zIndex: 1000,
  },
  userCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
    position: 'relative',
  },
  userInitials: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  connectionIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#57cc99',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMenu: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.primary,
  },
  menuItemSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  menuItemText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  menuItemTextSecondary: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  warningModal: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: FONTS.bold,
  },
  warningText: {
    fontSize: 16,
    color: COLORS.subtitle,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: FONTS.regular,
  },
  warningButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  warningCancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  warningCancelButtonText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  warningLoginButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  warningLoginButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
}); 