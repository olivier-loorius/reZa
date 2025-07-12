import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: COLORS.subtitle,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
}); 