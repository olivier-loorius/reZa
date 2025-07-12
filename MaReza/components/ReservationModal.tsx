import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import AdvancedCalendarModal from './AdvancedCalendarModal';
import SuccessModal from './SuccessModal';

interface ReservationModalProps {
  visible: boolean;
  roomName: string;
  existingReservations: any[];
  onCancel: () => void;
  onConfirm: (date: string, time: string, duration: number) => Promise<boolean>;
  onSuccess: () => void;
  isLoading?: boolean;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  roomName,
  existingReservations,
  onCancel,
  onConfirm,
  onSuccess,
  isLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [showAdvancedCalendar, setShowAdvancedCalendar] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    if (!visible) {
      setSelectedDate('');
      setSelectedTime('');
      setShowConfirmationModal(false);
      setShowSuccessModal(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmReservation = async () => {
    setShowConfirmationModal(false);
    const success = await onConfirm(selectedDate, selectedTime, selectedDuration);
    if (success) {
      setShowSuccessModal(true);
    }
  };

  const handleReservationSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  const handleAdvancedCalendarSelect = (date: string) => {
    setSelectedDate(date);
    setShowAdvancedCalendar(false);
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayNumber = date.getDate();
      
      dates.push({
        dateStr,
        dayName,
        dayNumber,
        isToday: i === 0,
      });
    }
    return dates;
  };

  const isTimeSlotReserved = (date: string, time: string, duration: number = 1) => {
    if (selectedDuration === 8) {
      return existingReservations.some(
        reservation => reservation.date === date
      );
    }
    
    const timeSlots = [];
    for (let i = 0; i < duration; i++) {
      const hour = parseInt(time.split(':')[0]) + i;
      if (hour < 24) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }
    
    return timeSlots.some(slot => 
      existingReservations.some(
        reservation => reservation.date === date && reservation.time === slot
      )
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDurationText = (duration: number) => {
    switch (duration) {
      case 1: return '1 heure';
      case 2: return '2 heures';
      case 3: return '3 heures';
      case 4: return '4 heures';
      case 8: return 'journée complète';
      default: return `${duration} heures`;
    }
  };

  const getEndTime = (startTime: string, duration: number) => {
    if (duration === 8) return '20:00';
    const hour = parseInt(startTime.split(':')[0]) + duration;
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Réserver {roomName}</Text>
            
            {/* Date Selection */}
            <View style={styles.dateSectionHeader}>
              <Text style={styles.sectionTitle}>Sélectionner une date</Text>
              <TouchableOpacity 
                style={styles.advancedCalendarButton}
                onPress={() => setShowAdvancedCalendar(true)}
              >
                <Ionicons name="calendar" size={20} color={COLORS.accent} />
                <Text style={styles.advancedCalendarButtonText}>Plus</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.dateContainer}
              contentContainerStyle={styles.dateContentContainer}
            >
              {generateDates().map(({ dateStr, dayName, dayNumber, isToday }) => (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.dateButton,
                    selectedDate === dateStr && styles.dateButtonSelected,
                    isToday && styles.dateButtonToday
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text style={[
                    styles.dateButtonText,
                    selectedDate === dateStr && styles.dateButtonTextSelected,
                    isToday && styles.dateButtonTextToday
                  ]}>
                    {dayName}
                  </Text>
                  <Text style={[
                    styles.dateButtonNumber,
                    selectedDate === dateStr && styles.dateButtonTextSelected,
                    isToday && styles.dateButtonTextToday
                  ]}>
                    {dayNumber}
                  </Text>
                  {isToday && (
                    <View style={styles.todayIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Duration Selection */}
            {selectedDate && (
              <>
                <Text style={styles.sectionTitle}>Durée de la réservation</Text>
                <View style={styles.durationContainer}>
                  {[
                    { value: 1, label: '1 heure' },
                    { value: 2, label: '2 heures' },
                    { value: 3, label: '3 heures' },
                    { value: 4, label: '4 heures' },
                    { value: 8, label: 'Journée complète' },
                  ].map((duration) => (
                    <TouchableOpacity
                      key={duration.value}
                      style={[
                        styles.durationButton,
                        selectedDuration === duration.value && styles.durationButtonSelected
                      ]}
                      onPress={() => setSelectedDuration(duration.value)}
                    >
                      <Text style={[
                        styles.durationButtonText,
                        selectedDuration === duration.value && styles.durationButtonTextSelected
                      ]}>
                        {duration.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Time Selection */}
            {selectedDate && (
              <>
                <Text style={styles.sectionTitle}>
                  Sélectionner un créneau pour le {formatDate(selectedDate)}
                </Text>
                <View style={styles.timeContainer}>
                  {timeSlots.map((time) => {
                    const isReserved = isTimeSlotReserved(selectedDate, time, selectedDuration);
                    
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeButton,
                          selectedTime === time && styles.timeButtonSelected,
                          isReserved && styles.timeButtonDisabled
                        ]}
                        onPress={() => !isReserved && setSelectedTime(time)}
                        disabled={isReserved}
                      >
                        <Text style={[
                          styles.timeButtonText,
                          selectedTime === time && styles.timeButtonTextSelected,
                          isReserved && styles.timeButtonTextDisabled
                        ]}>
                          {time}
                        </Text>
                        {isReserved && (
                          <Text style={styles.reservedIndicator}>Réservé</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  (!selectedDate || !selectedTime || isLoading) && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirm}
                disabled={!selectedDate || !selectedTime || isLoading}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Création...' : 'Confirmer la réservation'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationModalTitle}>Confirmer la réservation</Text>
            
            <View style={styles.confirmationDetails}>
              <View style={styles.confirmationDetailRow}>
                <Text style={styles.confirmationDetailLabel}>Salle :</Text>
                <Text style={styles.confirmationDetailValue}>{roomName}</Text>
              </View>
              
              <View style={styles.confirmationDetailRow}>
                <Text style={styles.confirmationDetailLabel}>Date :</Text>
                <Text style={styles.confirmationDetailValue}>{formatDate(selectedDate)}</Text>
              </View>
              
              <View style={styles.confirmationDetailRow}>
                <Text style={styles.confirmationDetailLabel}>Heure :</Text>
                <Text style={styles.confirmationDetailValue}>
                  {selectedTime} - {getEndTime(selectedTime, selectedDuration)}
                </Text>
              </View>
              
              <View style={styles.confirmationDetailRow}>
                <Text style={styles.confirmationDetailLabel}>Durée :</Text>
                <Text style={styles.confirmationDetailValue}>{getDurationText(selectedDuration)}</Text>
              </View>
            </View>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.confirmationCancelButton}
                onPress={() => setShowConfirmationModal(false)}
                disabled={isLoading}
              >
                <Text style={styles.confirmationCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmationConfirmButton, isLoading && styles.confirmationConfirmButtonDisabled]}
                onPress={handleConfirmReservation}
                disabled={isLoading}
              >
                <Text style={styles.confirmationConfirmButtonText}>
                  {isLoading ? 'Création...' : 'Confirmer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Réservation créée !"
        message="Votre réservation a été créée avec succès. Vous allez être redirigé vers la liste des salles."
        onConfirm={handleSuccessConfirm}
        confirmText="Retour aux salles"
      />

      <AdvancedCalendarModal
        visible={showAdvancedCalendar}
        onCancel={() => setShowAdvancedCalendar(false)}
        onSelectDate={handleAdvancedCalendarSelect}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default ReservationModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
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
    marginBottom: 24,
    fontFamily: FONTS.bold,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  advancedCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  advancedCalendarButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    marginLeft: 4,
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateContentContainer: {
    paddingRight: 20,
  },
  dateButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 70,
    position: 'relative',
  },
  dateButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dateButtonToday: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  dateButtonText: {
    color: COLORS.subtitle,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  dateButtonNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginTop: 2,
  },
  dateButtonTextSelected: {
    color: COLORS.background,
  },
  dateButtonTextToday: {
    color: COLORS.primary,
  },
  todayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  timeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 80,
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
    color: COLORS.text,
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
  reservedIndicator: {
    fontSize: 10,
    color: '#ff4444',
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  durationButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginRight: 8,
    marginBottom: 8,
  },
  durationButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  durationButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  durationButtonTextSelected: {
    color: COLORS.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.subtitle,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
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
  confirmationModal: {
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
  confirmationModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: FONTS.bold,
  },
  confirmationDetails: {
    marginBottom: 24,
  },
  confirmationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  confirmationDetailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.subtitle,
    fontFamily: FONTS.bold,
  },
  confirmationDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmationCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationCancelButtonText: {
    color: COLORS.subtitle,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  confirmationConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  confirmationConfirmButtonDisabled: {
    backgroundColor: COLORS.inputBorder,
  },
  confirmationConfirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
}); 