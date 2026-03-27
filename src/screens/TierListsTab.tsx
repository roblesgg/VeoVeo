import React, { useState, useMemo } from 'react';
import { 
  ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, 
  Text, TextInput, View 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTierListData } from '../hooks/tierlist/useTierListData';
import { useTierListEditor } from '../hooks/tierlist/useTierListEditor';
import { nuevaTierListVacia, todasLasPeliculasTierList } from '../types/tierList';
import { AccentBorder, ErrorRed, CardSurface, GradientTop } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import { FilterSortMenu } from '../components/FilterSortMenu';

// Modular Components
import { TierListCard } from '../components/tierlist/TierListCard';
import { TierRow } from '../components/tierlist/TierRow';
import { TierListSelector } from '../components/tierlist/TierListSelector';
import { MoviePool } from '../components/tierlist/MoviePool';
import { MoveMovieModal } from '../components/tierlist/MoveMovieModal';

type Props = {
  fontFamily: string;
  pantalla: number;
  onPantallaChange: (p: number) => void;
  onPeliculaClick: (movieId: number) => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
};

const TIER_DEFS = [
  { key: 'tierObraMaestra', label: 'Obra Maestra' },
  { key: 'tierMuyBuena', label: 'Muy Buena' },
  { key: 'tierBuena', label: 'Buena' },
  { key: 'tierMala', label: 'Mala' },
  { key: 'tierNefasta', label: 'Nefasta' },
] as const;

export function TierListsTab({ fontFamily, pantalla, onPantallaChange, onPeliculaClick, onPerfilClick, userFoto }: Props) {
  const insets = useSafeAreaInsets();
  const [moviendoMovieId, setMoviendoMovieId] = useState<number | null>(null);
  const [textoBuscarPool, setTextoBuscarPool] = useState('');
  const [ordenPool, setOrdenPool] = useState<'recientes' | 'alpha' | 'valoracion'>('recientes');
  const [mostrarMenuPool, setMostrarMenuPool] = useState(false);
  const [pickedMovieId, setPickedMovieId] = useState<number | null>(null);

  const { 
    cargando: cargandoData, error: dataError, tierLists, 
    peliculasVistas, peliculasMap, textoBuscar, setTextoBuscar, recargar 
  } = useTierListData();

  const {
    tierListActual, setTierListActual, seleccionadas, setSeleccionadas,
    cargando: cargandoEdit, error: editError,
    handleMoverPelicula, handleReordenarTier, handleGuardar, handleEliminar
  } = useTierListEditor(() => {
    void recargar();
    onPantallaChange(0);
  });

  const error = dataError || editError;
  const cargando = cargandoData || cargandoEdit;

  // Screen Logic
  const peliculasFiltradas = useMemo(() => {
    let base = [...peliculasVistas];
    if (ordenPool === 'alpha') base.sort((a, b) => a.titulo.localeCompare(b.titulo));
    else if (ordenPool === 'valoracion') base.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
    else base.sort((a, b) => b.fechaAnadido - a.fechaAnadido);

    const q = textoBuscarPool.toLowerCase().trim();
    if (!q) return base;
    return base.filter(p => p.titulo.toLowerCase().includes(q));
  }, [peliculasVistas, textoBuscarPool, ordenPool]);

  const poolPeliculas = useMemo(() => {
    if (!tierListActual) return [];
    const yaAsignadas = new Set(todasLasPeliculasTierList(tierListActual));
    if (!tierListActual.id) {
       return seleccionadas.filter(id => !yaAsignadas.has(id));
    }
    return peliculasVistas
      .map(p => p.idPelicula)
      .filter(id => !yaAsignadas.has(id));
  }, [tierListActual, seleccionadas, peliculasVistas]);

  const handleGuardarConRefresco = async () => {
    try {
      await handleGuardar();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo guardar');
    }
  };

  const handleBack = () => {
    if (pantalla === 3 && tierListActual?.id) onPantallaChange(1);
    else if (pantalla === 3 && !tierListActual?.id) onPantallaChange(2);
    else onPantallaChange(0);
  };

  return (
    <View style={styles.flex}>
      {/* Back Button */}
      {pantalla !== 0 && (
        <Pressable onPress={handleBack} style={[styles.backBtn, { top: Math.max(insets.top, 12) + 8 }]} hitSlop={12}>
          <View style={styles.backInner}><Ionicons name="chevron-back" size={26} color="#fff" /></View>
        </Pressable>
      )}

      {/* Screen 0: Grid List */}
      {pantalla === 0 && (
        <View style={styles.flex}>
          <LinearGradient colors={[GradientTop, 'transparent']} style={styles.topFade} pointerEvents="none" />
          <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
            <Text style={[styles.titulo, { fontFamily, flex: 1 }]} numberOfLines={1}>TierLists</Text>
            <View style={styles.actionsTopRow}>
              <Pressable onPress={() => setTextoBuscarPool(textoBuscarPool ? '' : ' ')} style={styles.iconBtn} hitSlop={8}>
                <Ionicons name="search-outline" size={28} color="#fff" />
              </Pressable>
              
              <Pressable onPress={() => onPerfilClick?.()} style={styles.perfilBtnMini} hitSlop={8}>
                <BlurView intensity={30} tint="dark" style={styles.perfilInnerMini}>
                  {userFoto ? (
                    <Image source={{ uri: userFoto }} style={styles.perfilFotoMini} />
                  ) : (
                    <Ionicons name="person" size={20} color="#fff" />
                  )}
                </BlurView>
              </Pressable>
            </View>
          </View>

          {textoBuscarPool !== '' && (
            <TextInput
              value={textoBuscarPool}
              onChangeText={setTextoBuscarPool}
              placeholder="Buscar"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.searchField, SHADOWS.macLight, { fontFamily, marginTop: Math.max(insets.top, 12) + 90 }]}
            />
          )}

          <ScrollView contentContainerStyle={[styles.gridWrap, { paddingTop: textoBuscarPool !== '' ? 150 : 160 }]}>
            <Pressable 
              style={[styles.newCard, SHADOWS.macLight]} 
              onPress={() => {
                setTierListActual(nuevaTierListVacia());
                setSeleccionadas([]);
                onPantallaChange(2);
              }}
            >
              <Ionicons name="add-circle-outline" size={34} color="#fff" />
              <Text style={[styles.newCardText, { fontFamily }]}>Nueva TierList</Text>
            </Pressable>

            {tierLists.map((tier) => (
              <TierListCard 
                key={tier.id} 
                tier={tier} 
                peliculasMap={peliculasMap} 
                fontFamily={fontFamily}
                onPress={() => {
                  setTierListActual(tier);
                  onPantallaChange(1);
                }}
              />
            ))}
          </ScrollView>
          {cargando && <ActivityIndicator color="#fff" style={styles.loader} />}
        </View>
      )}

      {/* Screen 1: Detail View */}
      {pantalla === 1 && tierListActual && (
        <ScrollView contentContainerStyle={[styles.screenPad, { paddingTop: insets.top + 48 }]}>
          <Text style={[styles.detailTitle, { fontFamily }]}>{tierListActual.nombre}</Text>
          <Text style={[styles.detailDesc, { fontFamily }]}>{tierListActual.descripcion || 'Sin descripción'}</Text>
          <Text style={[styles.detailCount, { fontFamily }]}>{todasLasPeliculasTierList(tierListActual).length} películas</Text>

          {TIER_DEFS.map((def) => (
            <TierRow 
              key={def.key} 
              titulo={def.label} 
              ids={tierListActual[def.key as keyof typeof tierListActual] as number[]} 
              peliculasMap={peliculasMap} 
              fontFamily={fontFamily} 
              onPeliculaClick={onPeliculaClick} 
            />
          ))}

          <View style={styles.rowActions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: AccentBorder }]} onPress={() => onPantallaChange(3)}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={[styles.actionText, { fontFamily }]}>Editar</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, { backgroundColor: ErrorRed }]} 
              onPress={() => Alert.alert('Eliminar', '¿Seguro?', [{text:'No'}, {text:'Sí', onPress:() => handleEliminar(tierListActual.id!)}])}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={[styles.actionText, { fontFamily }]}>Eliminar</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Screen 2: Creation Form */}
      {pantalla === 2 && tierListActual && (
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={[styles.screenPad, { paddingTop: insets.top + 48 }]}>
            <Text style={[styles.detailTitle, { fontFamily }]}>Nueva TierList</Text>
            <TextInput
              value={tierListActual.nombre}
              onChangeText={(t) => setTierListActual({...tierListActual, nombre: t})}
              placeholder="Nombre de la TierList"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.field, { fontFamily }]}
            />
            <TextInput
              value={tierListActual.descripcion}
              onChangeText={(t) => setTierListActual({...tierListActual, descripcion: t})}
              placeholder="Descripción"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.field, styles.fieldMultiline, { fontFamily }]}
              multiline
            />
            <View style={styles.selectorHeader}>
              <Text style={[styles.sectionTitle, { fontFamily, marginTop: 0 }]}>Seleccionadas ({seleccionadas.length})</Text>
              <View style={styles.selectorActions}>
                <Pressable onPress={() => setMostrarMenuPool(true)} style={styles.iconBtn} hitSlop={8}>
                  <Ionicons name="options-outline" size={24} color="#fff" />
                </Pressable>
                <Pressable onPress={() => setTextoBuscarPool(textoBuscarPool ? '' : ' ')} style={styles.iconBtn} hitSlop={8}>
                  <Ionicons name="search" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>

            {textoBuscarPool !== '' && (
              <TextInput
                value={textoBuscarPool}
                onChangeText={setTextoBuscarPool}
                placeholder="Filtrar por título..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={[styles.smallSearch, { fontFamily }]}
              />
            )}

            <TierListSelector 
              peliculas={peliculasFiltradas} 
              seleccionadas={seleccionadas} 
              onToggle={(id) => setSeleccionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              fontFamily={fontFamily}
            />
          </ScrollView>
          <View style={[styles.fixedFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Pressable 
              style={[styles.mainAction, !tierListActual.nombre && styles.disabled]} 
              onPress={() => onPantallaChange(3)}
              disabled={!tierListActual.nombre}
            >
              <Text style={[styles.actionText, { fontFamily }]}>Siguiente</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Screen 3: Organization / Editor */}
      {pantalla === 3 && tierListActual && (
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={[styles.screenPad, { paddingTop: insets.top + 48 }]}>
            <Text style={[styles.detailTitle, { fontFamily }]}>Organizar TierList</Text>
            <Text style={[styles.hint, { fontFamily }]}>Pulsa una película para moverla</Text>

            {TIER_DEFS.map((def) => (
              <TierRow 
                key={def.key} 
                titulo={def.label} 
                ids={tierListActual[def.key as keyof typeof tierListActual] as number[]} 
                peliculasMap={peliculasMap} 
                fontFamily={fontFamily} 
                onPeliculaClick={(id) => {
                  if (pickedMovieId) {
                    handleMoverPelicula(pickedMovieId, def.key as any);
                    setPickedMovieId(null);
                  } else if (id !== 0) {
                    // Si pinchamos una peli en la tier sin tener nada cogido, vuelve al pool
                    handleMoverPelicula(id, 'pool');
                  }
                }} 
                onReorder={(data) => handleReordenarTier(def.key as any, data)}
              />
            ))}

            <Text style={[styles.sectionTitle, { fontFamily }]}>Pendientes ({poolPeliculas.length})</Text>
            <Text style={[styles.hint, { fontFamily }]}>Toca para recoger, luego toca un Tier (o vuelve a tocar para soltar)</Text>
            <MoviePool 
              ids={poolPeliculas} 
              peliculasMap={peliculasMap} 
              onMovieClick={(id) => {
                if (pickedMovieId === id) setPickedMovieId(null);
                else setPickedMovieId(id);
              }} 
              fontFamily={fontFamily} 
              hideSearch
              selectedId={pickedMovieId}
            />
            <View style={{ height: 100 }} />
          </ScrollView>
          
          <View style={[styles.fixedFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Pressable style={[styles.mainAction, { backgroundColor: AccentBorder }]} onPress={handleGuardarConRefresco}>
              <Text style={[styles.actionText, { fontFamily }]}>Finalizar TierList</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </View>
      )}

      <MoveMovieModal 
        visible={moviendoMovieId !== null} 
        onClose={() => setMoviendoMovieId(null)} 
        onSelectTier={(key) => handleMoverPelicula(moviendoMovieId!, key)}
        fontFamily={fontFamily}
      />
      <FilterSortMenu
        visible={mostrarMenuPool}
        onClose={() => setMostrarMenuPool(false)}
        title="Ordenar por"
        options={[
          { label: 'Recientes', value: 'recientes', icon: 'time-outline' },
          { label: 'Título (A-Z)', value: 'alpha', icon: 'text-outline' },
          { label: 'Valoración', value: 'valoracion', icon: 'star-outline' },
        ]}
        currentValue={ordenPool}
        onSelect={(v: any) => setOrdenPool(v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screenPad: { paddingHorizontal: 24, paddingBottom: 130 },
  titulo: { color: '#fff', fontSize: 34, fontWeight: '800' },
  headerRow: { 
    position: 'absolute', 
    left: 24, 
    right: 24, 
    zIndex: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  actionsTopRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  perfilBtnMini: { marginLeft: 4 },
  perfilInnerMini: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.4)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  perfilFotoMini: { width: '100%', height: '100%' },
  searchField: { marginHorizontal: 20, borderRadius: 24, backgroundColor: CardSurface, paddingHorizontal: 20, height: 50, color: '#fff' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 5 },
  gridWrap: { paddingHorizontal: 24, paddingBottom: 140, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  newCard: { width: '47%', aspectRatio: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: AccentBorder, justifyContent: 'center', alignItems: 'center' },
  newCardText: { color: '#fff', marginTop: 8, fontSize: 14 },
  detailTitle: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  detailDesc: { color: '#aaa', textAlign: 'center', marginTop: 8 },
  detailCount: { color: '#888', textAlign: 'center', marginTop: 4, fontSize: 13 },
  rowActions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  actionBtn: { flex: 1, height: 50, borderRadius: 25, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  field: { borderRadius: 16, backgroundColor: CardSurface, color: '#fff', paddingHorizontal: 16, height: 52, marginTop: 14 },
  fieldMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  sectionTitle: { color: '#fff', marginTop: 24, marginBottom: 12, fontSize: 18, fontWeight: '700' },
  mainAction: { height: 54, borderRadius: 27, backgroundColor: AccentBorder, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, backgroundColor: 'rgba(2, 6, 23, 0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  disabled: { opacity: 0.4 },
  hint: { color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 8 },
  selectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  selectorActions: { flexDirection: 'row', gap: 12 },
  smallSearch: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 16, height: 44, color: '#fff', marginBottom: 16 },
  backBtn: { position: 'absolute', left: 20, zIndex: 100 },
  backInner: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  loader: { position: 'absolute', top: 100, alignSelf:'center' },
});
