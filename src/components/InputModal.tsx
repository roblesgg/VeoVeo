import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, Pressable, View, KeyboardAvoidingView, Platform as RNPlatform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AccentBorder } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  placeholder: string;
  fontFamily: string;
};

export const InputModal = ({ visible, onClose, onConfirm, title, placeholder, fontFamily }: Props) => {
  const [value, setValue] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.centered}
      >
        <BlurView intensity={80} tint="dark" style={styles.container}>
          <Text style={[styles.title, { fontFamily }]}>{title}</Text>
          <TextInput
            style={[styles.input, { fontFamily }]}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            autoFocus
            value={value}
            onChangeText={setValue}
          />
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.btn}>
              <Text style={[styles.btnText, { fontFamily, opacity: 0.6 }]}>Cancelar</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                onConfirm(value);
                setValue('');
              }} 
              style={[styles.btn, styles.confirmBtn]}
            >
              <Text style={[styles.btnText, { fontFamily, color: '#fff' }]}>Confirmar</Text>
            </Pressable>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  container: { width: '85%', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  confirmBtn: { backgroundColor: AccentBorder },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});
