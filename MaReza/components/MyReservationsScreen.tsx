import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS, SIZES } from '../theme';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SuccessModal from './SuccessModal';

interface MyReservationsScreenProps {
  onBack: () => void;
}

interface User {
  name: string;
  email: string;
}

interface Reservation {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  time: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

const MyReservationsScreen: React.FC<MyReservationsScreenProps> = ({ onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user);
          loadMyReservations(user.email);
        }
      } catch (error) {
      }
    };
    getUser();
  }, []);

  const loadMyReservations = async (userEmail: string) => {
    try {
      const response = await fetch('http://192.168.1.12:3001/reservations');
      const data = await response.json();
      if (data.success) {
        const userReservations = data.reservations.filter((reservation: Reservation) => 
          reservation.userEmail === userEmail
        );
        setMyReservations(userReservations);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
  };

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://192.168.1.12:3001/reservations/${reservationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMyReservations(prevReservations => 
          prevReservations.filter(reservation => reservation.id !== reservationToDelete.id)
        );
        setShowDeleteModal(false);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la réservation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setReservationToDelete(null);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo_reza-removebg-preview (1).png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Mes ReZa</Text>
          <Text style={styles.subtitle}>
            {user ? `${user.name} • ${myReservations.length} réservation${myReservations.length > 1 ? 's' : ''}` : ''}
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
        ) : myReservations.length > 0 ? (
          <View style={styles.reservationsContainer}>
            {myReservations.map((reservation) => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.reservationContent}>
                  <View style={styles.reservationHeader}>
                    <View style={styles.reservationInfo}>
                      <Text style={styles.roomName}>{reservation.roomName}</Text>
                      <Text style={styles.reservationDate}>
                        {formatDate(reservation.date)}
                      </Text>
                    </View>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeText}>{formatTime(reservation.time)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.reservationDetails}>
                    Réservé le {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReservation(reservation)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune réservation</Text>
            <Text style={styles.emptyStateSubtext}>
              Vous n'avez pas encore de réservations. Réservez votre première salle pour commencer !
            </Text>
          </View>
        )}
      </ScrollView>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        title="Annuler la réservation"
        message={`Êtes-vous sûr de vouloir annuler votre réservation pour "${reservationToDelete?.roomName}" ?`}
        onCancel={handleCancelDelete}
        onConfirm={confirmDeleteReservation}
        confirmText="Annuler la réservation"
        isLoading={isDeleting}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Réservation annulée"
        message="Votre réservation a été annulée avec succès."
        onConfirm={handleSuccessConfirm}
      />
    </View>
  );
};

export default MyReservationsScreen;

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
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    width: 40,
    height: 40,
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
  reservationsContainer: {
    gap: 12,
  },
  reservationCard: {
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
  reservationContent: {
    flex: 1,
    padding: 16,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reservationInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  reservationDate: {
    fontSize: 12,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
  },
  timeBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  reservationDetails: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
    lineHeight: 20,
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