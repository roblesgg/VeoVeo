import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

type OptionProps = {
  texto: string;
  icon: any;
  onPress: () => void;
  destructive?: boolean;
  fontFamily: string;
};

const OpcionRow = ({ texto, icon, onPress, destructive, fontFamily }: OptionProps) => (
  <Pressable style={styles.opcionRow} onPress={onPress}>
    <Text style={[styles.opcionText, destructive && { color: '#ff4444' }, { fontFamily }]}>
      {texto}
    </Text>
    <Ionicons name={icon} size={20} color={destructive ? '#ff4444' : '#888'} />
  </Pressable>
);

type Props = {
  onAjustes: () => void;
  onBloqueados: () => void;
  onLogout: () => void;
  fontFamily: string;
};

export const ProfileOptions = React.memo(
  ({ onAjustes, onBloqueados, onLogout, fontFamily }: Props) => {
    return (
      <View style={styles.optionsCard}>
        <OpcionRow
          texto="Ajustes de la aplicación"
          icon="settings-outline"
          onPress={onAjustes}
          fontFamily={fontFamily}
        />
        <View style={styles.divider} />
        <OpcionRow
          texto="Usuarios bloqueados"
          icon="close-outline"
          onPress={onBloqueados}
          fontFamily={fontFamily}
        />
        <View style={styles.divider} />
        <OpcionRow
          texto="Cerrar sesión"
          icon="log-out-outline"
          onPress={onLogout}
          destructive
          fontFamily={fontFamily}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  optionsCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  opcionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    width: '100%',
  },
  opcionText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(128,128,128,0.3)' },
});
