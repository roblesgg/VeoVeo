import React, { useState, useMemo, memo, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList, // 🚀 Añadido para virtualización
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  BackHandler,
  useWindowDimensions,
  DimensionValue, // 🚀 Tipo correcto para estilos
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTierListData } from '../hooks/tierlist/useTierListData';
import { useTierListEditor } from '../hooks/tierlist/useTierListEditor';
import { nuevaTierListVacia, todasLasPeliculasTierList } from '../types';
import { COLORS, CardSurface, GradientTop } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import { FilterSortMenu } from '../components/FilterSortMenu';
import { ConfirmModal } from '../components/common/ConfirmModal';

// Modular Components
import { TierListCard } from '../components/tierlist/TierListCard';
import { TierRow } from '../components/tierlist/TierRow';
import { TierListSelector } from '../components/tierlist/TierListSelector';
import { MoviePool } from '../components/tierlist/MoviePool';
import { MoveMovieModal } from '../components/tierlist/MoveMovieModal';
import { AlertModal } from '../components/common/AlertModal';

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

// 🚀 [MEMO] Item de la Grilla de TierLists para máxima performance
const TierListGridItem = memo(({ 
  tier, 
  peliculasMap, 
  fontFamily, 
  onPress,
  width 
}: { 
  tier: any, 
  peliculasMap: any, 
  fontFamily: string, 
  onPress: () => void,
  width: DimensionValue 
}) => (
  <View style={{ width }}>
    <TierListCard
      tier={tier}
      peliculasMap={peliculasMap}
      fontFamily={fontFamily}
      onPress={onPress}
    />
  </View>
));
TierListGridItem.displayName = 'TierListGridItem';

export function TierListsTab({
  fontFamily,
  pantalla,
  onPantallaChange,
  onPeliculaClick,
  onPerfilClick,
  userFoto,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  
  // 🚀 Cálculo dinámico de columnas (min 2, max según ancho)
  const numColumns = Math.max(2, Math.floor(windowWidth / 160));
  const itemWidth: DimensionValue = `${100 / numColumns}%`;
  const [moviendoMovieId, setMoviendoMovieId] = useState<number | null>(null);
  const [textoBuscarPool, setTextoBuscarPool] = useState('');
  const [ordenPool, setOrdenPool] = useState<'recientes' | 'alpha' | 'valoracion'>('recientes');
  const [mostrarMenuPool, setMostrarMenuPool] = useState(false);
  const [pickedMovieId, setPickedMovieId] = useState<number | null>(null);
  const [tierListAEliminar, setTierListAEliminar] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string } | null>(null);
  const [buscarAtivaTier, setBuscarAtivaTier] = useState(false); // 🚀 Lógica limpia de búsqueda

  const toggleSearch = () => {
    if (buscarAtivaTier) {
      setBuscarAtivaTier(false);
      setTextoBuscarPool('');
      Keyboard.dismiss();
    } else {
      setBuscarAtivaTier(true);
      setTextoBuscarPool(''); // Limpio para que se vea el placeholder
    }
  };

  const closeSearchIfOutside = () => {
    if (textoBuscarPool !== '') {
      Keyboard.dismiss();
      // 🛡️ [CAMBIO] Ya no borramos el texto al cerrar por click fuera
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (buscarAtivaTier) {
          setBuscarAtivaTier(false);
          setTextoBuscarPool('');
          Keyboard.dismiss();
          return true;
        }
        return false;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [buscarAtivaTier])
  );

  const {
    cargando: cargandoData,
    error: dataError,
    tierLists,
    peliculasVistas,
    peliculasMap,
    textoBuscar,
    setTextoBuscar,
    recargar,
  } = useTierListData();

  const {
    tierListActual,
    setTierListActual,
    seleccionadas,
    setSeleccionadas,
    cargando: cargandoEdit,
    error: editError,
    handleMoverPelicula,
    handleReordenarTier,
    handleGuardar,
    handleEliminar,
  } = useTierListEditor(() => {
    void recargar();
    onPantallaChange(0);
  });

  const error = dataError || editError;
  const cargando = cargandoData || cargandoEdit;

  // Screen Logic
  const peliculasFiltradas = useMemo(() => {
    const base = [...peliculasVistas];
    if (ordenPool === 'alpha') base.sort((a, b) => a.titulo.localeCompare(b.titulo));
    else if (ordenPool === 'valoracion')
      base.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
    else base.sort((a, b) => b.fechaAnadido - a.fechaAnadido);

    const q = textoBuscarPool.toLowerCase().trim();
    if (!q) return base;
    return base.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [peliculasVistas, textoBuscarPool, ordenPool]);

  const poolPeliculas = useMemo(() => {
    if (!tierListActual) return [];
    const yaAsignadas = new Set(todasLasPeliculasTierList(tierListActual));
    if (!tierListActual.id) {
      return seleccionadas.filter((id) => !yaAsignadas.has(id));
    }
    return peliculasVistas.map((p) => p.idPelicula).filter((id) => !yaAsignadas.has(id));
  }, [tierListActual, seleccionadas, peliculasVistas]);

  const handleGuardarConRefresco = async () => {
    console.log('--- EVENTO: PULSADO FINALIZAR TIERLIST ---');
    try {
      await handleGuardar();
      console.log('--- RESULTADO: GUARDADO EXITOSO ---');
    } catch (e) {
      console.error('--- ERROR CRÍTICO AL GUARDAR:', e);
      setErrorInfo({
        title: 'Error al guardar',
        message: e instanceof Error ? e.message : 'No se pudo guardar la TierList.'
      });
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
        <Pressable
          onPress={handleBack}
          style={[styles.backBtn, { top: Math.max(insets.top, 12) + 8 }]}
          hitSlop={12}
        >
          <View style={styles.backInner}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </View>
        </Pressable>
      )}

      {/* Screen 0: Grid List */}
      {pantalla === 0 && (
        <View style={styles.flex}>
          {/* 🔮 Cabecera Glaseada Premium (Skia-Style) */}
          <View style={[styles.headerContainer, { height: insets.top + (buscarAtivaTier ? 160 : 80), backgroundColor: 'rgba(15, 23, 42, 0.12)' }]}>
            <View style={styles.headerBorder} />
            <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
              <Text style={[styles.titulo, { fontFamily, flex: 1 }]}>TierLists</Text>
              <View style={styles.actionsTopRow}>
                <Pressable onPress={toggleSearch} style={styles.iconBtn} hitSlop={8}>
                  <Ionicons name={buscarAtivaTier ? "close" : "search-outline"} size={28} color="#fff" />
                </Pressable>
                <Pressable onPress={() => onPerfilClick?.()} style={styles.perfilBtnMini} hitSlop={8}>
                  <View style={styles.perfilInnerMini}>
                    {userFoto ? (
                      <Image source={{ uri: userFoto }} style={styles.perfilFotoMini} />
                    ) : (
                      <Ionicons name="person" size={22} color="#fff" />
                    )}
                  </View>
                </Pressable>
              </View>
            </View>

            {buscarAtivaTier && (
              <View style={[styles.searchField, SHADOWS.macLight, { top: Math.max(insets.top, 12) + 80 }]}>
                <TextInput
                  value={textoBuscarPool}
                  onChangeText={setTextoBuscarPool}
                  placeholder="Buscar tierlists..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={{ flex: 1, color: '#fff', fontFamily }}
                  autoFocus
                />
                {textoBuscarPool.trim().length > 0 && (
                  <Pressable onPress={() => setTextoBuscarPool('')} style={{ paddingLeft: 8 }}>
                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {buscarAtivaTier && (
            <Pressable 
              style={[StyleSheet.absoluteFillObject, { zIndex: 1200 }]} 
              onPress={() => {
                setBuscarAtivaTier(false);
                setTextoBuscarPool('');
                Keyboard.dismiss();
              }}
            >
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          <FlatList
            key={numColumns} // 🛡️ Requerido para cambiar numColumns al vuelo sin crashear
            data={[{ id: 'new-button' } as any, ...tierLists.filter(t => t.nombre.toLowerCase().includes(textoBuscarPool.toLowerCase()))]}
            keyExtractor={(item) => item.id || 'new'}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
              styles.gridWrap,
              { paddingTop: insets.top + (buscarAtivaTier ? 170 : 100) },
            ]}
            style={[buscarAtivaTier && { zIndex: 1001 }]}
            renderItem={({ item }) => {
              if (item.id === 'new-button') {
                return (
                  <View style={[styles.newCard, { width: itemWidth }]}>
                    <Pressable
                      style={[styles.newCardInner, SHADOWS.macLight]}
                      onPress={() => {
                        setTierListActual(nuevaTierListVacia());
                        setSeleccionadas([]);
                        onPantallaChange(2);
                      }}
                    >
                      <View style={styles.newCardCenterIcon}>
                        <Ionicons name="add-circle-outline" size={42} color="rgba(255,255,255,0.2)" />
                      </View>
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.newCardGradient}>
                        <Text style={[styles.newCardText, { fontFamily }]}>Nueva TierList</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                );
              }

              return (
                <TierListGridItem 
                  tier={item}
                  peliculasMap={peliculasMap}
                  fontFamily={fontFamily}
                  width={itemWidth}
                  onPress={() => {
                    setTierListActual(item);
                    onPantallaChange(1);
                  }}
                />
              );
            }}
            ListHeaderComponent={() => null}
          />
          {cargando && <ActivityIndicator color="#fff" style={styles.loader} />}
        </View>
      )}

      {/* Screen 1: Detail View */}
      {pantalla === 1 && tierListActual && (
        <ScrollView contentContainerStyle={[styles.screenPad, { paddingTop: insets.top + 48 }]}>
          <Text style={[styles.detailTitle, { fontFamily }]}>{tierListActual.nombre}</Text>
          <Text style={[styles.detailDesc, { fontFamily }]}>
            {tierListActual.descripcion || 'Sin descripción'}
          </Text>
          <Text style={[styles.detailCount, { fontFamily }]}>
            {todasLasPeliculasTierList(tierListActual).length} películas
          </Text>

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
            <Pressable
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => onPantallaChange(3)}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={[styles.actionText, { fontFamily }]}>Editar</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
              onPress={() => setTierListAEliminar(tierListActual.id!)}
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
              onChangeText={(t) => setTierListActual({ ...tierListActual, nombre: t })}
              placeholder="Nombre de la TierList"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.field, { fontFamily }]}
            />
            <TextInput
              value={tierListActual.descripcion}
              onChangeText={(t) => setTierListActual({ ...tierListActual, descripcion: t })}
              placeholder="Descripción"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.field, styles.fieldMultiline, { fontFamily }]}
              multiline
            />
            <View style={styles.selectorHeader}>
              <Text style={[styles.sectionTitle, { fontFamily, marginTop: 0 }]}>
                Seleccionadas ({seleccionadas.length})
              </Text>
              <View style={styles.selectorActions}>
                <Pressable
                  onPress={() => setMostrarMenuPool(true)}
                  style={styles.iconBtn}
                  hitSlop={8}
                >
                  <Ionicons name="options-outline" size={24} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={() => setTextoBuscarPool(textoBuscarPool ? '' : ' ')}
                  style={styles.iconBtn}
                  hitSlop={8}
                >
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
              onToggle={(id) =>
                setSeleccionadas((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
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

            <Text style={[styles.sectionTitle, { fontFamily }]}>
              Pendientes ({poolPeliculas.length})
            </Text>
            <Text style={[styles.hint, { fontFamily }]}>
              Toca para recoger, luego toca un Tier (o vuelve a tocar para soltar)
            </Text>
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
            <Pressable
              style={[styles.mainAction, { backgroundColor: COLORS.primary }]}
              onPress={handleGuardarConRefresco}
            >
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

      <ConfirmModal
        visible={!!tierListAEliminar}
        onClose={() => setTierListAEliminar(null)}
        onConfirm={() => tierListAEliminar && handleEliminar(tierListAEliminar)}
        title="Eliminar TierList"
        message="¿Estás seguro de que quieres borrar esta lista? No podrás recuperarla."
        confirmText="Eliminar"
        cancelText="Cancelar"
        iconName="trash"
        fontFamily={fontFamily}
      />

      {errorInfo && (
        <AlertModal
          visible={!!errorInfo}
          onClose={() => setErrorInfo(null)}
          title={errorInfo.title}
          message={errorInfo.message}
          iconName="alert-circle"
          iconColor="#ff8a80"
          fontFamily={fontFamily}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#020617' },
  screenPad: { paddingHorizontal: 24, paddingBottom: 130 },
  titulo: { color: '#fff', fontSize: 34, fontWeight: '800' },
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2000 },
  headerRow: { marginHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
    overflow: 'hidden',
  },
  perfilFotoMini: { width: '100%', height: '100%' },
  searchField: { position: 'absolute', left: 20, right: 20, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  gridWrap: {
    paddingHorizontal: 4, // 🚀 Espacio extra para ganar tamaño de tarjetas
    paddingBottom: 140,
  },
  newCard: {
    // width: '50%', // 🚀 Ahora es dinámico via inline
    aspectRatio: 0.85, 
    padding: 2, 
  },
  newCardInner: {
    flex: 1,
    borderRadius: 20, 
    backgroundColor: '#1E1E2D', 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  newCardCenterIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  newCardText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '800', 
    textAlign: 'center',
    width: '100%',
  },
  detailTitle: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  detailDesc: { color: '#aaa', textAlign: 'center', marginTop: 8 },
  detailCount: { color: '#888', textAlign: 'center', marginTop: 4, fontSize: 13 },
  rowActions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  field: {
    borderRadius: 16,
    backgroundColor: CardSurface,
    color: '#fff',
    paddingHorizontal: 16,
    height: 52,
    marginTop: 14,
  },
  fieldMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  sectionTitle: { color: '#fff', marginTop: 24, marginBottom: 12, fontSize: 18, fontWeight: '700' },
  mainAction: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  disabled: { opacity: 0.4 },
  hint: { color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 8 },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  selectorActions: { flexDirection: 'row', gap: 12 },
  smallSearch: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    color: '#fff',
    marginBottom: 16,
  },
  backBtn: { position: 'absolute', left: 20, zIndex: 100 },
  backInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { position: 'absolute', top: 100, alignSelf: 'center' },
});
