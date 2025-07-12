import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

interface AdvancedCalendarModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

const AdvancedCalendarModal: React.FC<AdvancedCalendarModalProps> = ({
  visible,
  onCancel,
  onSelectDate,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = dayDate.getMonth() === month;
      const isPast = dayDate < currentDate;
      const isToday = dayDate.toDateString() === currentDate.toDateString();
      const dateStr = dayDate.toISOString().split('T')[0];
      
      days.push({
        date: dayDate,
        dateStr,
        day: dayDate.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected: selectedDate === dateStr,
      });
    }
    
    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dateStr: string) => {
    onSelectDate(dateStr);
    onCancel();
  };

  const calendarDays = generateCalendarDays(currentMonth);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionner une date</Text>
          
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => changeMonth('prev')}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>
              {getMonthName(currentMonth)}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => changeMonth('next')}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekDaysHeader}>
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <Text key={day} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !day.isCurrentMonth && styles.calendarDayOtherMonth,
                  day.isPast && styles.calendarDayPast,
                  day.isToday && styles.calendarDayToday,
                  day.isSelected && styles.calendarDaySelected,
                ]}
                onPress={() => !day.isPast && day.isCurrentMonth && handleDateSelect(day.dateStr)}
                disabled={day.isPast || !day.isCurrentMonth}
              >
                <Text style={[
                  styles.calendarDayText,
                  !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                  day.isPast && styles.calendarDayTextPast,
                  day.isToday && styles.calendarDayTextToday,
                  day.isSelected && styles.calendarDayTextSelected,
                ]}>
                  {day.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AdvancedCalendarModal;

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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: FONTS.bold,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.subtitle,
    fontFamily: FONTS.bold,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayPast: {
    opacity: 0.5,
  },
  calendarDayToday: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.accent,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  calendarDayTextOtherMonth: {
    color: COLORS.subtitle,
  },
  calendarDayTextPast: {
    color: COLORS.subtitle,
  },
  calendarDayTextToday: {
    color: COLORS.primary,
  },
  calendarDayTextSelected: {
    color: COLORS.background,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
  },
  cancelButtonText: {
    color: COLORS.subtitle,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
}); 