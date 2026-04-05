import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch, // 🆕 El interruptor real
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { GradientBackground } from '../components/GradientBackground';
import { BlurView } from 'expo-blur';
import { SHADOWS } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import { useMontserrat } from '../theme/useMontserrat';
import * as preferences from '../storage/preferences';
import { tmdbApi } from '../services/tmdbClient';
import { COLORS } from '../theme/colors';

export function AjustesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { fontFamily: ff } = useMontserrat();
  const fontFamily = ff || 'System';

  const [adulto, setAdulto] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);
  const [allPlataformas, setAllPlataformas] = useState<any[]>([]);
  const [busquedaPlataforma, setBusquedaPlataforma] = useState('');
  const [cargandoPlats, setCargandoPlats] = useState(false);

  useEffect(() => {
    void preferences.cargarPreferenciaAdulto().then(setAdulto);
    void preferences.cargarPlataformas().then(res => setMisPlataformas(res.map(Number)));

    void (async () => {
      setCargandoPlats(true);
      try {
        const res = await tmdbApi.obtenerProveedoresRegion('ES');
        setAllPlataformas(agruparPlataformas(res.results));
      } catch (e) {
        console.error(e);
      } finally {
        setCargandoPlats(false);
      }
    })();
  }, []);

  const handleToggleAdulto = async (val: boolean) => {
    setAdulto(val);
    await preferences.guardarPreferenciaAdulto(val);
  };

  const handleTogglePlataforma = async (ids: number[]) => {
    let next: number[];
    const isPresent = ids.some(id => misPlataformas.includes(id));
    if (isPresent) {
      next = misPlataformas.filter(id => !ids.includes(id));
    } else {
      next = [...misPlataformas, ...ids];
    }
    setMisPlataformas(next);
    await preferences.guardarPlataformas(next.map(String));
    if (user) {
      void require('../services/userPreferences').guardarPreferenciaFirestore(user.uid, 'plataformas', next);
    }
  };

  const filteredPlats = useMemo(() => {
    const q = busquedaPlataforma.trim().toLowerCase();
    if (!q) return allPlataformas;
    return allPlataformas.filter(p => p.searchTerms.includes(q) || p.name.toLowerCase().includes(q));
  }, [allPlataformas, busquedaPlataforma]);


  return (
    <GradientBackground style={styles.flex}>
      <BlurView intensity={95} tint="dark" style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <Text style={[styles.titulo, { fontFamily }]}>Ajustes</Text>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 90, paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily }]}>Privacidad y Contenido</Text>
          <View style={[styles.card, SHADOWS.macLight]}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { fontFamily }]}>Mostrar contenido para adultos</Text>
                <Text style={[styles.cardDesc, { fontFamily }]}>Incluye resultados de cine erótico y mayores de +18 años.</Text>
             </View>
             <Switch
                value={adulto}
                onValueChange={handleToggleAdulto}
                trackColor={{ false: "#334155", true: COLORS.primary }}
                thumbColor={adulto ? "#fff" : "#94a3b8"}
             />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily }]}>Mis Plataformas de Streaming</Text>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoText, { fontFamily }]}>
                Selecciona las plataformas que pagas para que marquemos con colores dónde ver cada película:
              </Text>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: '#2ecc71' }]} />
                <Text style={styles.legendText}>Disponible en tus plataformas</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: '#f39c12' }]} />
                <Text style={styles.legendText}>Disponible (streaming o alquiler)</Text>
              </View>
            </View>
          </View>

          <TextInput 
            value={busquedaPlataforma} 
            onChangeText={setBusquedaPlataforma} 
            placeholder="Buscar (ej: Amazon, Movistar, HBO...)" 
            placeholderTextColor="rgba(255,255,255,0.4)" 
            style={[styles.platSearch, { fontFamily }]} 
          />
          <View style={styles.platsContainer}>
            {cargandoPlats ? <ActivityIndicator color="#fff" /> : 
              filteredPlats.map(p => (
                <Pressable 
                  key={p.name} 
                  onPress={() => handleTogglePlataforma(p.ids)} 
                  style={[styles.platItem, p.ids.some((id: number) => misPlataformas.includes(id)) && styles.platItemActive]}
                >
                  <Image source={{ uri: `https://image.tmdb.org/t/p/original${p.logo}` }} style={styles.platLogo} />
                  <Text style={[styles.platName, { fontFamily }]} numberOfLines={1}>{p.name}</Text>
                  {p.ids.some((id: number) => misPlataformas.includes(id)) && <Ionicons name="checkmark-circle" size={16} color="#000" style={styles.check} />}
                </Pressable>
              ))
            }
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

// 🍿 IDs Oficiales de TMDB para España (Logic unchanged)
function agruparPlataformas(lista: any[]) {
  const grupos: { [nombre: string]: { ids: number[], name: string, logo: string, searchTerms: string } } = {};
  lista.forEach(p => {
    let name = p.provider_name;
    let alias = name.toLowerCase();
    if (name.includes('Amazon') || name.includes('Prime Video')) { name = 'Prime Video'; alias += ' amazon prime amz'; }
    else if (name.includes('Apple TV')) { name = 'Apple TV+'; alias += ' itunes apple+'; }
    else if (name.includes('Disney')) { name = 'Disney+'; alias += ' dsn disneyplus'; }
    else if (name.includes('HBO')) { name = 'HBO Max'; alias += ' hbomax max'; }
    else if (name.includes('Netflix')) { name = 'Netflix'; alias += ' nflx netf'; }
    else if (name.includes('SkyShowtime')) { name = 'SkyShowtime'; alias += ' sky showtime'; }
    else if (name.includes('Movistar')) { name = 'Movistar Plus+'; alias += ' m+ movstar movistar+'; }

    if (!grupos[name]) { grupos[name] = { ids: [], name, logo: p.logo_path, searchTerms: alias }; }
    grupos[name].ids.push(p.provider_id);
    grupos[name].searchTerms += ` ${alias}`;
  });
  return Object.values(grupos).sort((a, b) => a.name.localeCompare(b.name));
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#020617' },
  header: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    zIndex: 100, 
    backgroundColor: 'rgba(2, 6, 23, 0.92)', // Fallback sólido
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)' 
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { padding: 4 },
  titulo: { color: '#fff', fontSize: 22, fontWeight: '900', marginLeft: 8 },
  scroll: { paddingHorizontal: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 14, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  infoText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  platsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  platItem: { width: '31%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  platItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  platLogo: { width: 36, height: 36, borderRadius: 10, marginBottom: 8 },
  platName: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  check: { position: 'absolute', top: 4, right: 4 },
  platSearch: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});
