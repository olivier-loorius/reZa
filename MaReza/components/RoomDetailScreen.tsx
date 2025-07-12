import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, Alert, ImageBackground } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS, SIZES } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SuccessModal from './SuccessModal';
import ReservationModal from './ReservationModal';

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
}

interface RoomDetailScreenProps {
  room: Room;
  onBack: () => void;
}

const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({ room, onBack }) => {
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const allEquipment = [...room.equipment, ...room.customEquipment];

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
      }
    };
    getUser();
    loadReservations();
  }, []);

  useEffect(() => {
    if (showDeleteSuccess) {
      const timer = setTimeout(() => {
        setShowDeleteSuccess(false);
        onBack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showDeleteSuccess]);

  const loadReservations = async () => {
    try {
      const response = await fetch(`http://192.168.1.12:3001/reservations/room/${room.id}`);
      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations);
      }
    } catch (error) {
    }
  };

  const handleReservation = async (date: string, time: string, duration: number): Promise<boolean> => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour réserver une salle.');
      return false;
    }

    setIsLoading(true);
    try {
      const reservations = [];
      
      if (duration === 8) {
        for (let hour = 9; hour <= 20; hour++) {
          reservations.push({
            roomId: room.id,
            roomName: room.name,
            date: date,
            time: `${hour.toString().padStart(2, '0')}:00`,
            userName: user.name,
            userEmail: user.email,
          });
        }
      } else {
        for (let i = 0; i < duration; i++) {
          const hour = parseInt(time.split(':')[0]) + i;
          if (hour < 24) {
            reservations.push({
              roomId: room.id,
              roomName: room.name,
              date: date,
              time: `${hour.toString().padStart(2, '0')}:00`,
              userName: user.name,
              userEmail: user.email,
            });
          }
        }
      }

      const promises = reservations.map(reservation =>
        fetch('http://192.168.1.12:3001/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservation),
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      const hasError = results.some(result => !result.success);
      
      if (!hasError) {
        loadReservations();
        return true;
      } else {
        Alert.alert('Erreur', 'Erreur lors de la création de la réservation');
        return false;
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = () => {
    setShowDeleteModal(true);
  };
  const confirmDeleteRoom = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://192.168.1.12:3001/rooms/${room.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorEmail: user?.email }),
      });
      const data = await response.json();
      if (data.success) {
        setShowDeleteModal(false);
        setShowDeleteSuccess(true);
      } else {
        Alert.alert('Erreur', data.message || 'Suppression impossible');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{room.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ImageBackground source={require('../assets/salle.jpg')} style={styles.cardImage} imageStyle={{ borderRadius: 24 }}>
            <View style={styles.cardOverlay}>
              <View style={styles.cardOverlayBg} />
              <View style={styles.cardOverlayContent}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{room.name}</Text>
                    <View style={styles.capacityBadgeLarge}>
                      <Text style={styles.capacityTextLarge}>{room.capacity} places</Text>
                    </View>
                    {room.creatorName && (
                      <Text style={styles.creatorText}>Ajoutée par : {room.creatorName}</Text>
                    )}
                  </View>
                  {user && room.creatorEmail && user.email === room.creatorEmail && (
                    <TouchableOpacity onPress={handleDeleteRoom} style={styles.deleteIconBtn}>
                      <Ionicons name="trash" size={28} color={COLORS.accent} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
        {room.floor && (
          <View style={styles.floorBadgeHighlightLeft}>
            <Text style={styles.floorTextHighlightLeft}>Étage : {room.floor}</Text>
          </View>
        )}
        {room.description !== undefined && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionPlaceholder}>
              <Text style={styles.cardDescription}>{room.description || 'Aucune description.'}</Text>
            </View>
          </>
        )}

        {/* Equipment */}
        {allEquipment.length > 0 && (
          <View style={styles.equipmentSection}>
            <Text style={styles.sectionTitle}>Équipements</Text>
            <View style={styles.equipmentListModern}>
              {allEquipment.map((equipment, index) => (
                <View key={index} style={styles.equipmentBadge}>
                  <Text style={styles.equipmentBadgeText}>{equipment}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reservation Button */}
        <TouchableOpacity 
          style={styles.reservationButtonModern}
          onPress={() => setShowReservationModal(true)}
        >
          <Text style={styles.reservationButtonTextModern}>Réserver cette salle</Text>
        </TouchableOpacity>

        {/* Existing Reservations */}
        {reservations.length > 0 && (
          <View style={styles.reservationsSection}>
            <Text style={styles.sectionTitle}>Réservations existantes</Text>
            {reservations.map((reservation) => (
              <View key={reservation.id} style={styles.reservationItem}>
                <View style={styles.reservationInfo}>
                  <Text style={styles.reservationDate}>
                    {new Date(reservation.date).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.reservationTime}>{reservation.time}</Text>
                  <Text style={styles.reservationUser}>Réservé par {reservation.userName}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ReservationModal
        visible={showReservationModal}
        roomName={room.name}
        existingReservations={reservations}
        onCancel={() => setShowReservationModal(false)}
        onConfirm={handleReservation}
        onSuccess={() => {
          setShowReservationModal(false);
          onBack();
        }}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        visible={showDeleteModal}
        title="Supprimer la salle"
        message="Es-tu sûr de vouloir supprimer cette salle ?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteRoom}
        isLoading={isDeleting}
      />

      <SuccessModal
        visible={showDeleteSuccess}
        title="Salle supprimée"
        message="La salle a bien été supprimée."
        onConfirm={() => {
          setShowDeleteSuccess(false);
          onBack();
        }}
      />
    </View>
  );
};

export default RoomDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 0,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.background,
    fontFamily: FONTS.bold,
    marginBottom: 10,
  },
  floorBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  floorText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  capacityBadgeLarge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  capacityTextLarge: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  cardDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginTop: 8,
    fontFamily: FONTS.regular,
  },
  roomInfo: {
    marginBottom: 24,
  },
  capacityBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  capacityText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: 16,
    color: COLORS.subtitle,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  equipmentSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  equipmentText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  reservationButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  reservationButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reservationModal: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: FONTS.bold,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  dateButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dateButtonText: {
    color: COLORS.subtitle,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  dateButtonNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  dateButtonTextSelected: {
    color: COLORS.background,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  timeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginRight: 8,
    marginBottom: 8,
  },
  timeButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  timeButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  timeButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  timeButtonTextSelected: {
    color: COLORS.background,
  },
  timeButtonTextDisabled: {
    color: '#b0b0b0',
  },
  modalButtons: {
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
  confirmButtonDisabled: {
    backgroundColor: COLORS.inputBorder,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  reservationsSection: {
    marginBottom: 32,
  },
  reservationItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  reservationInfo: {
    gap: 4,
  },
  reservationDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  reservationTime: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  reservationUser: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
  },
  equipmentListModern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  equipmentBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  equipmentBadgeText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  reservationButtonModern: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    alignSelf: 'center',
  },
  reservationButtonTextModern: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  cardImage: {
    width: '100%',
    height: 140,
    flex: 1,
    borderRadius: 24,
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    justifyContent: 'flex-end',
  },
  cardOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 24,
  },
  cardOverlayContent: {
    padding: 18,
    alignItems: 'flex-start',
  },
  floorBadgeOutside: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginLeft: 4,
    marginTop: -8,
  },
  descriptionContainer: {
    marginBottom: 18,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  floorBadgeHighlight: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignSelf: 'center',
    marginBottom: 18,
    marginTop: -8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  floorTextHighlight: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  descriptionPlaceholder: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    padding: 18,
    marginBottom: 18,
    marginTop: 2,
    alignSelf: 'stretch',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  floorBadgeHighlightLeft: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
    marginTop: -6,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  floorTextHighlightLeft: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  creatorText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 6,
    opacity: 0.7,
  },
  deleteIconBtn: {
    marginLeft: 12,
    marginTop: 2,
    padding: 4,
  },

}); 