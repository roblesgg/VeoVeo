import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectTier: (tierKey: any) => void;
  fontFamily: string;
};

const TIER_OPTIONS = [
  { key: 'tierObraMaestra', label: 'Obra Maestra' },
  { key: 'tierMuyBuena', label: 'Muy Buena' },
  { key: 'tierBuena', label: 'Buena' },
  { key: 'tierMala', label: 'Mala' },
  { key: 'tierNefasta', label: 'Nefasta' },
] as const;

export const MoveMovieModal = React.memo(({ visible, onClose, onSelectTier, fontFamily }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalCard}>
          <Text style={[styles.modalTitle, { fontFamily }]}>Mover película</Text>
          {TIER_OPTIONS.map((def) => (
            <Pressable key={def.key} style={styles.modalOption} onPress={() => onSelectTier(def.key)}>
              <Text style={[styles.modalOptionText, { fontFamily }]}>{def.label}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.modalCancel} onPress={onClose}>
            <Text style={[styles.modalCancelText, { fontFamily }]}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 24, elevation: 8 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalOption: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
  modalOptionText: { color: '#fff', fontSize: 16 },
  modalCancel: { marginTop: 16, alignItems: 'center', padding: 12 },
  modalCancelText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
});
