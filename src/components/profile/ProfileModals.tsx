import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AccentBorder } from '../../theme/colors';

type UsernameModalProps = {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (val: string) => Promise<boolean>;
  fontFamily: string;
};

export const UsernameModal = ({ visible, initialValue, onClose, onSave, fontFamily }: UsernameModalProps) => {
  const [val, setVal] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => { setVal(initialValue); }, [initialValue]);

  const handleSave = async () => {
    setLoading(true);
    const ok = await onSave(val);
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={[styles.modalTitle, { fontFamily }]}>Cambiar nombre</Text>
          <TextInput
            value={val}
            onChangeText={setVal}
            style={[styles.modalInput, { fontFamily }]}
            placeholder="Usuario..."
            placeholderTextColor="#888"
          />
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.btnSec}><Text style={{color:'#fff', fontFamily}}>Cancelar</Text></Pressable>
            {loading ? <ActivityIndicator color={AccentBorder} /> : (
              <Pressable onPress={handleSave} style={styles.btnPri}><Text style={{color:'#fff', fontFamily, fontWeight:'700'}}>Guardar</Text></Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

type AvatarModalProps = {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (val: string) => Promise<boolean>;
  fontFamily: string;
};

export const AvatarModal = ({ visible, initialValue, onClose, onSave, fontFamily }: AvatarModalProps) => {
  const [val, setVal] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => { setVal(initialValue); }, [initialValue]);

  const handleSave = async () => {
    setLoading(true);
    const ok = await onSave(val);
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={[styles.modalTitle, { fontFamily }]}>Enlace de tu foto</Text>
          <TextInput
            value={val}
            onChangeText={setVal}
            style={[styles.modalInput, { fontFamily }]}
            placeholder="https://..."
            placeholderTextColor="#888"
          />
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.btnSec}><Text style={{color:'#fff', fontFamily}}>Cancelar</Text></Pressable>
            {loading ? <ActivityIndicator color={AccentBorder} /> : (
              <Pressable onPress={handleSave} style={styles.btnPri}><Text style={{color:'#fff', fontFamily, fontWeight:'700'}}>Guardar</Text></Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 24 },
  btnSec: { padding: 12 },
  btnPri: { backgroundColor: AccentBorder, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
});
