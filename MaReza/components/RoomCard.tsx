import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

interface Room {
  id: string;
  name: string;
  capacity: string;
  equipment: string[];
  customEquipment: string[];
  description?: string;
}

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
  const allEquipment = [...room.equipment, ...room.customEquipment];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.roomName}>{room.name}</Text>
        <View style={styles.capacityBadge}>
          <Text style={styles.capacityText}>{room.capacity} places</Text>
        </View>
      </View>
      
      {allEquipment.length > 0 && (
        <View style={styles.equipmentContainer}>
          <Text style={styles.equipmentTitle}>Équipements :</Text>
          <View style={styles.equipmentList}>
            {allEquipment.slice(0, 3).map((equipment, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Text style={styles.equipmentText}>{equipment}</Text>
              </View>
            ))}
            {allEquipment.length > 3 && (
              <View style={styles.moreEquipmentTag}>
                <Text style={styles.moreEquipmentText}>+{allEquipment.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {room.description && (
        <Text style={styles.description} numberOfLines={2}>
          {room.description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    flex: 1,
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
  equipmentContainer: {
    marginBottom: 8,
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
  description: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
}); 