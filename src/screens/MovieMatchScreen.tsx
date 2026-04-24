/**
 * ARCHIVO: screens/MovieMatchScreen.tsx
 * DESCRIPCIÓN: Pantalla principal del juego 'Movie Match'.
 * Implementa una interfaz tipo 'Tinder' para películas donde los usuarios deslizan
 * a la derecha (SI) o izquierda (NO).
 * Utiliza React Native Reanimated y Gesture Handler para animaciones de 60fps.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { observarMatch, votarPelicula } from '../services/repositorioMatches';
import { tmdbApi, posterUrl } from '../services/tmdbClient';
import { MovieMatch, MovieDetails } from '../types';
import { COLORS } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

export function MovieMatchScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  
  // 📐 LAYOUT CONFIG: Ajustes dinámicos para el swipe
  const SCREEN_WIDTH = windowWidth;
  const BAR_WIDTH = Math.min(windowWidth * 0.85, 420); 
  const SWIPE_THRESHOLD = BAR_WIDTH * 0.25; // Distancia mínima para confirmar voto

  const { matchId } = route.params;
  const [match, setMatch] = useState<MovieMatch | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Puntero de la película actual en la cola
  const [queue, setQueue] = useState<any[]>([]); // Cola de películas para votar
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<MovieDetails | null>(null);
  const [matchedDetails, setMatchedDetails] = useState<MovieDetails[]>([]); // Películas que ya son Match

  // VALORES COMPARTIDOS (REANIMATED)
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // EFECTO: Suscripción en tiempo real al estado del juego (puntuaciones, finalización)
  useEffect(() => {
    return observarMatch(matchId, setMatch);
  }, [matchId]);

  /** 🧠 ALGORITMO DE RECOMENDACIÓN INTELIGENTE (Client-Side):
   * 1. Extrae películas de las Watchlists de los demás participantes.
   * 2. Utiliza películas bien valoradas por el usuario como semillas para recomendaciones de TMDB.
   * 3. Filtra películas que el usuario actual YA ha votado en esta sesión.
   */
  useEffect(() => {
    if (!match || !user || queue.length > 0) return; 
    void (async () => {
       try {
         const db = getFirestore();
         let watchlistMovies: any[] = [];
         let seenSeeds: number[] = [];
         
         // Analizamos perfiles de los participantes
         for (const uid of match.participants) {
            const isMe = uid === user.uid;
            
            // Prioridad: Películas que a mis amigos les interesan
            if (!isMe) {
              const libRef = doc(db, 'usuarios', uid, 'biblioteca', 'por_ver');
              const snap = await getDoc(libRef);
              if (snap.exists()) {
                const data = snap.data() as { peliculas: any[] };
                if (data.peliculas) watchlistMovies.push(...data.peliculas);
              }
            }

            // Semillas: Nuestras pelis favoritas para buscar similares
            const vistasRef = doc(db, 'usuarios', uid, 'biblioteca', 'vistas');
            const vistasSnap = await getDoc(vistasRef);
            if (vistasSnap.exists()) {
              const data = vistasSnap.data() as { peliculas: any[] };
              if (data.peliculas) {
                const highRated = data.peliculas.filter(p => p.valoracion >= 4).map(p => p.idPelicula);
                seenSeeds.push(...highRated);
              }
            }
         }

         // Filtramos lo que ya votamos en este juego para no repetir
         const votedIds = new Set<string>();
         const currentVotes = (match.votes || {}) as Record<string, string[]>;
         const currentNoVotes = (match.noVotes || {}) as Record<string, string[]>;

         Object.keys(currentVotes).forEach(mid => { 
           if (currentVotes[mid]?.includes(user.uid)) votedIds.add(mid); 
         });
         Object.keys(currentNoVotes).forEach(mid => { 
           if (currentNoVotes[mid]?.includes(user.uid)) votedIds.add(mid); 
         });

         let finalQueue: any[] = [];

         // Procesamos la watchlist filtrada
         const filteredWatchlist = watchlistMovies
           .filter((v, i, a) => a.findIndex(t => t.idPelicula === v.idPelicula) === i)
           .filter(p => !votedIds.has(String(p.idPelicula)))
           .map(p => ({
              id: p.idPelicula,
              title: p.titulo,
              poster_path: p.rutaPoster,
              release_date: p.fechaAnadido ? new Date(p.fechaAnadido).getFullYear().toString() : ''
           }));
         
         finalQueue.push(...filteredWatchlist);

         // Solicitamos recomendaciones a la API si la cola es corta
         if (seenSeeds.length > 0 && finalQueue.length < 20) {
            const seed = seenSeeds[Math.floor(Math.random() * seenSeeds.length)];
            const recommendations = await tmdbApi.obtenerRecomendaciones(seed, 'es-ES', 1);
            const filteredRecs = recommendations.results
              .filter((p: any) => p.vote_average > 6.0) 
              .filter((p: any) => !votedIds.has(String(p.id)) && !finalQueue.find(q => q.id === p.id))
              .map((p: any) => ({
                id: p.id,
                title: p.title,
                poster_path: p.poster_path,
                release_date: p.release_date?.split('-')[0] || ''
              }));
            
            finalQueue.push(...filteredRecs);
         }

         setQueue(finalQueue);
       } catch (e) {
         console.error(e);
       } finally {
         setLoading(false);
       }
    })();
  }, [match, user]);

  // Precarga de detalles TMDB para la película actual (Info Modal)
  useEffect(() => {
    if (queue[currentIndex]) {
      void tmdbApi.obtenerDetallesPelicula(Number(queue[currentIndex].id)).then(setCurrentDetails);
    }
  }, [currentIndex, queue]);

  // Si el match termina, cargamos las fichas finales de las ganadoras
  useEffect(() => {
    if (match?.status === 'finished' && match.matchedMovies.length > 0) {
      void (async () => {
        try {
          const promises = match.matchedMovies.map(id => tmdbApi.obtenerDetallesPelicula(id));
          const results = await Promise.all(promises);
          setMatchedDetails(results);
        } catch (e) {
          console.error('Error cargando resultados del match:', e);
        }
      })();
    }
  }, [match?.status, match?.matchedMovies]);

  /** Registra el voto en Firestore y resetea las animaciones */
  const onSwipeComplete = useCallback((direction: 'right' | 'left') => {
    if (!user || !match || !queue[currentIndex]) return;
    const movieId = queue[currentIndex].id;
    void votarPelicula(matchId, user.uid, movieId, direction === 'right' ? 'yes' : 'no');
    
    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, matchId, queue, user, match]);

  /** Gestión de gestos del dedo */
  const onGestureEvent = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  /** Finalización del gesto: ¿Se confirma el voto o vuelve al centro? */
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // END STATE
      if (Math.abs(event.nativeEvent.translationX) > SWIPE_THRESHOLD) {
        const direction = event.nativeEvent.translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100);
        runOnJS(onSwipeComplete)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    }
  };

  // ESTILOS ANIMADOS DINÁMICOS (Reanimated 2)
  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10], Extrapolate.CLAMP);
    return {
      transform: [
        { translateX: translateX.value }, 
        { translateY: translateY.value }, 
        { rotate: `${rotate}deg` }
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolate.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolate.CLAMP),
  }));

  if (loading || !match) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  const currentMovie = queue[currentIndex];

  return (
    <View style={styles.container}>
      {/* CABECERA CON CONTADOR DE MATCHES EN TIEMPO REAL */}
      <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 15 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Movie Match</Text>
          <View style={styles.matchCounter}>
            <Ionicons name="flame" size={16} color="#ff6b00" />
            <Text style={styles.countText}>{match.matchedMovies.length} Matches</Text>
          </View>
        </View>
      </BlurView>

      <View style={styles.deck}>
        {/* ESCENARIO A: El juego ha terminado (Hay ganadoras) */}
        {match.status === 'finished' ? (
          <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.resultsHeader}>
              <Ionicons name="trophy" size={80} color="#f1c40f" />
              <Text style={styles.matchFinishedTitle}>¡Objetivo conseguido!</Text>
              <Text style={styles.matchFinishedSub}>
                Habéis encontrado {match.matchedMovies.length} {match.matchedMovies.length === 1 ? 'película' : 'películas'} que os han gustado a todos:
              </Text>
            </View>

            <View style={styles.resultsGrid}>
              {matchedDetails.map(movie => (
                <Pressable 
                  key={movie.id} 
                  style={styles.resultCard} 
                  onPress={() => {
                    setCurrentDetails(movie);
                    setShowInfo(true);
                  }}
                >
                  <Image source={{ uri: posterUrl(movie.poster_path, 'w342')! }} style={styles.resultPoster} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>{movie.title}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.btnCerrarFinal} onPress={() => navigation.goBack()}>
              <Text style={styles.btnCerrarText}>Volver al chat</Text>
            </Pressable>
          </ScrollView>
        ) : currentIndex < queue.length ? (
          /* ESCENARIO B: Juego en curso (Cartas Swipables) */
          <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
            <Animated.View style={[
              styles.card, 
              { width: BAR_WIDTH, height: Math.min(windowHeight * 0.6, 600) },
              cardStyle, 
              SHADOWS.macLight
            ]}>
              <Image source={{ uri: posterUrl(currentMovie.poster_path, 'w500')! }} style={styles.poster} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle}>{currentMovie.title}</Text>
                  <Text style={styles.movieYear}>{currentMovie.release_date}</Text>
                </View>
                <Pressable onPress={() => setShowInfo(true)} style={styles.infoBtn}><Ionicons name="information-circle-outline" size={34} color="#fff" /></Pressable>
              </LinearGradient>
              
              {/* BADGES DINÁMICOS DE VOTO (SÍ / NO) */}
              <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}><Text style={styles.badgeText}>SÍ</Text></Animated.View>
              <Animated.View style={[styles.badge, styles.nopeBadge, nopeOpacity]}><Text style={styles.badgeText}>NO</Text></Animated.View>
            </Animated.View>
          </PanGestureHandler>
        ) : (
          /* ESCENARIO C: Sin más películas en la cola actual */
          <View style={styles.emptyDeck}>
             <ActivityIndicator color={COLORS.primary} size="large" />
             <Text style={styles.emptyText}>Buscando más recomendaciones...</Text>
          </View>
        )}
      </View>

      {/* BOTONES DE ACCIÓN RÁPIDA (Alternativa al swipe táctil) */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
         <Pressable style={styles.roundBtn} onPress={() => { translateX.value = withSpring(-SCREEN_WIDTH - 100); runOnJS(onSwipeComplete)('left'); }}><Ionicons name="close" size={32} color="#ff5050" /></Pressable>
         <Pressable style={styles.roundBtn} onPress={() => { translateX.value = withSpring(SCREEN_WIDTH + 100); runOnJS(onSwipeComplete)('right'); }}><Ionicons name="heart" size={32} color="#2ecc71" /></Pressable>
      </View>

      {/* MODAL DE INFORMACIÓN (MODAL GLAREADO) */}
      {showInfo && currentDetails && (
        <View style={StyleSheet.absoluteFillObject}>
           <Pressable onPress={() => setShowInfo(false)} style={StyleSheet.absoluteFillObject}><BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} /></Pressable>
           <View style={[styles.infoModal, { bottom: insets.bottom + 100 }]}>
              <Text style={styles.modalTitle}>{currentDetails.title}</Text>
              <ScrollView style={styles.modalScroll}>
                 <Text style={styles.modalOverview}>{currentDetails.overview}</Text>
                 <View style={styles.modalDetails}><Text style={styles.modalMeta}>⭐ {currentDetails.vote_average?.toFixed(1)}</Text><Text style={styles.modalMeta}>📅 {currentDetails.release_date}</Text></View>
              </ScrollView>
           </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  matchCounter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,0,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  countText: { color: '#ff6b00', fontSize: 12, fontWeight: '900' },
  deck: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  card: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#1e293b' },
  poster: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, padding: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  movieInfo: { flex: 1 },
  movieTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  movieYear: { color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 4 },
  infoBtn: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 50, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 3 },
  badgeText: { fontSize: 32, fontWeight: '900' },
  likeBadge: { right: 40, borderColor: '#2ecc71', color: '#2ecc71', transform: [{ rotate: '15deg' }] },
  nopeBadge: { left: 40, borderColor: '#ff5050', color: '#ff5050', transform: [{ rotate: '-15deg' }] },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
  roundBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  emptyDeck: { alignItems: 'center', gap: 20, paddingHorizontal: 40 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, textAlign: 'center' },
  matchFinishedTitle: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  matchFinishedSub: { color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  btnCerrarText: { color: '#000', fontWeight: '800', fontSize: 16 },
  infoModal: { position: 'absolute', left: 24, right: 24, backgroundColor: '#1e293b', borderRadius: 24, padding: 24, maxHeight: 300 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  modalScroll: { flex: 1 },
  modalOverview: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 22 },
  modalDetails: { flexDirection: 'row', gap: 20, marginTop: 20 },
  modalMeta: { color: COLORS.primary, fontWeight: '800' },
  
  // Resultados finalizados
  resultsScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  resultsHeader: { alignItems: 'center', marginBottom: 30 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  resultCard: { width: 160, borderRadius: 20, backgroundColor: '#1e293b', overflow: 'hidden', ...SHADOWS.macLight, marginBottom: 12 },
  resultPoster: { width: '100%', aspectRatio: 2/3 },
  resultInfo: { padding: 10 },
  resultTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnCerrarFinal: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 30 },
});
