import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS, SIZES } from '../theme';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SuccessModal from './SuccessModal';

interface MyRoomsScreenProps {
  onBack: () => void;
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
  creatorName?: string;
  creatorEmail?: string;
  createdAt?: string;
}

const MyRoomsScreen: React.FC<MyRoomsScreenProps> = ({ onBack, onRoomDetail }) => {
  const [user, setUser] = useState<User | null>(null);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user);
          loadMyRooms(user.email);
        }
      } catch (error) {
      }
    };
    getUser();
  }, []);

  const loadMyRooms = async (userEmail: string) => {
    try {
      const response = await fetch('http://192.168.1.12:3001/rooms');
      const data = await response.json();
      if (data.success) {
        const userRooms = data.rooms.filter((room: Room) => 
          room.creatorEmail === userEmail
        );
        setMyRooms(userRooms);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoom = async () => {
    if (!user || !roomToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://192.168.1.12:3001/rooms/${roomToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMyRooms(prevRooms => prevRooms.filter(room => room.id !== roomToDelete.id));
        setShowDeleteModal(false);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la salle');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
  };

  const handleRoomPress = (room: Room) => {
    onRoomDetail(room);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mes salles</Text>
          <Text style={styles.subtitle}>
            {user ? `${user.name} • ${myRooms.length} salle${myRooms.length > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : myRooms.length > 0 ? (
          <View style={styles.roomsContainer}>
            {myRooms.map((room) => (
              <View key={room.id} style={styles.roomCard}>
                <TouchableOpacity 
                  style={styles.roomContent}
                  onPress={() => handleRoomPress(room)}
                >
                  <View style={styles.roomHeader}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomDate}>
                        Créée le {room.createdAt ? formatDate(room.createdAt) : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.capacityBadge}>
                      <Text style={styles.capacityText}>{room.capacity} places</Text>
                    </View>
                  </View>
                  
                  {room.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {room.description}
                    </Text>
                  )}
                  
                  {room.equipment && room.equipment.length > 0 && (
                    <View style={styles.equipmentContainer}>
                      <Text style={styles.equipmentTitle}>Équipements :</Text>
                      <View style={styles.equipmentList}>
                        {room.equipment.slice(0, 3).map((equipment, index) => (
                          <View key={index} style={styles.equipmentTag}>
                            <Text style={styles.equipmentText}>{equipment}</Text>
                          </View>
                        ))}
                        {room.equipment.length > 3 && (
                          <View style={styles.moreEquipmentTag}>
                            <Text style={styles.moreEquipmentText}>+{room.equipment.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRoom(room)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune salle créée</Text>
            <Text style={styles.emptyStateSubtext}>
              Vous n'avez pas encore créé de salles. Créez votre première salle pour commencer !
            </Text>
          </View>
        )}
      </ScrollView>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        title="Supprimer la salle"
        message={`Êtes-vous sûr de vouloir supprimer la salle "${roomToDelete?.name}" ?`}
        onCancel={handleCancelDelete}
        onConfirm={confirmDeleteRoom}
        isLoading={isDeleting}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Salle supprimée"
        message="La salle a été supprimée avec succès."
        onConfirm={handleSuccessConfirm}
      />
    </View>
  );
};

export default MyRoomsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backIcon: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
  },
  roomsContainer: {
    gap: 12,
  },
  roomCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  roomContent: {
    flex: 1,
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  roomDate: {
    fontSize: 12,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
  },
  capacityBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  equipmentContainer: {
    marginTop: 4,
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.subtitle,
    marginBottom: 6,
    fontFamily: FONTS.bold,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  equipmentText: {
    color: COLORS.accent,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  moreEquipmentTag: {
    backgroundColor: COLORS.inputBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  moreEquipmentText: {
    color: COLORS.subtitle,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  deleteButton: {
    width: 50,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 