import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { UsuarioPerfil } from '../../types/usuario';
import { ErrorRed } from '../../theme/colors';

type Props = {
  amigo: UsuarioPerfil;
  onPress: () => void;
  onEliminar: () => void;
  onBloquear: () => void;
  onChat?: () => void;
  fontFamily: string;
};

export const FriendRow = React.memo(({ amigo, onPress, onEliminar, onBloquear, onChat, fontFamily }: Props) => {
  const statusColor = amigo.estado === 'online' ? '#7CFC9A' : amigo.estado === 'ausente' ? '#FFB74D' : '#9E9E9E';

  return (
    <View style={styles.container}>
      <Pressable style={styles.main} onPress={onPress}>
        <View style={styles.avatar}>
          {amigo.fotoPerfil ? (
            <Image source={{ uri: amigo.fotoPerfil }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{(amigo.username || 'U').charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { fontFamily }]}>{amigo.username || amigo.email}</Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {amigo.estado === 'online' ? 'En línea' : amigo.estado === 'ausente' ? 'Ausente' : 'Desconectado'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        {onChat && (
          <Pressable style={styles.iconBtn} onPress={onChat}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#6C63FF" />
          </Pressable>
        )}
        <Pressable style={styles.iconBtn} onPress={() => Alert.alert('Eliminar', '¿Seguro?', [{text:'No'}, {text:'Sí', onPress:onEliminar}])}>
          <Ionicons name="person-remove-outline" size={20} color="rgba(255,255,255,0.5)" />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => Alert.alert('Bloquear', '¿Seguro?', [{text:'No'}, {text:'Sí', onPress:onBloquear}])}>
          <Ionicons name="ban-outline" size={20} color={ErrorRed} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 24 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  status: { fontSize: 12, fontWeight: '500', opacity: 0.8 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
});
