import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  vistas: number;
  porVer: number;
  resenas: number;
  fontFamily: string;
};

export const ProfileStats = React.memo(({ vistas, porVer, resenas, fontFamily }: Props) => {
  return (
    <View style={styles.statsRow}>
      <StatItem num={String(vistas)} label={'Películas\nVistas'} ff={fontFamily} />
      <StatItem num={String(porVer)} label={'Por\nVer'} ff={fontFamily} />
      <StatItem num={String(resenas)} label="Reseñas" ff={fontFamily} />
    </View>
  );
});

const StatItem = ({ num, label, ff }: { num: string; label: string; ff: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statNum}>{num}</Text>
    <Text style={[styles.statLabel, { fontFamily: ff }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', marginBottom: 40 },
  statItem: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#d3d3d3', fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 16 },
});
