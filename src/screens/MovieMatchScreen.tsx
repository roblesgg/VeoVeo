import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export function MovieMatchScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const { matchId } = route.params;
  const [match, setMatch] = useState<MovieMatch | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<MovieDetails | null>(null);
  const [matchedDetails, setMatchedDetails] = useState<MovieDetails[]>([]); // 🆕 Detalles de ganadoras

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 1. Escuchar el match
  useEffect(() => {
    return observarMatch(matchId, setMatch);
  }, [matchId]);

  // 2. Cargar pelis inteligentes (Por Ver de otros + Sugeridas)
  useEffect(() => {
    if (!match || !user || queue.length > 0) return; // Solo cargar al inicio
    void (async () => {
       try {
         const db = getFirestore();
         let watchlistMovies: any[] = [];
         let seenSeeds: number[] = [];
         
         // 1. Obtener "Por Ver" de los otros y nuestras "Vistas" como semillas
         for (const uid of match.participants) {
            const isMe = uid === user.uid;
            
            // Watchlist del otro
            if (!isMe) {
              const libRef = doc(db, 'usuarios', uid, 'biblioteca', 'por_ver');
              const snap = await getDoc(libRef);
              if (snap.exists()) {
                const data = snap.data() as { peliculas: any[] };
                if (data.peliculas) watchlistMovies.push(...data.peliculas);
              }
            }

            // Nuestras vistas con buena nota (Semillas)
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

         // 2. Filtrar pelis que YA HEMOS VOTADO en este match (Importante para reentrada)
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

         // Añadir Watchlist filtrada
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

         // 3. Recomendaciones basadas en semillas (si faltan o para mezclar)
         if (seenSeeds.length > 0 && finalQueue.length < 20) {
            const seed = seenSeeds[Math.floor(Math.random() * seenSeeds.length)];
            const recommendations = await tmdbApi.obtenerRecomendaciones(seed, 'es-ES', 1);
            const filteredRecs = recommendations.results
              .filter((p: any) => p.vote_average > 6.0) // Solo calidad
              .filter((p: any) => !votedIds.has(String(p.id)) && !finalQueue.find(q => q.id === p.id))
              .map((p: any) => ({
                id: p.id,
                title: p.title,
                poster_path: p.poster_path,
                release_date: p.release_date?.split('-')[0] || ''
              }));
            
            // Mezclamos un poco
            finalQueue.push(...filteredRecs);
         }

         // 4. Ultimo recurso: Populares de calidad
         if (finalQueue.length < 5) {
            const popular = await tmdbApi.obtenerPopulares('es-ES', 1);
            finalQueue.push(...popular.results.filter((p: any) => p.vote_average > 6.5 && !votedIds.has(String(p.id))));
         }

         setQueue(finalQueue);
       } catch (e) {
         console.error(e);
       } finally {
         setLoading(false);
       }
    })();
  }, [match, user]);

  // 3. Cargar detalles para el modal de info
  useEffect(() => {
    if (queue[currentIndex]) {
      void tmdbApi.obtenerDetallesPelicula(Number(queue[currentIndex].id)).then(setCurrentDetails);
    }
  }, [currentIndex, queue]);

  // 4. Cargar detalles de las películas ganadoras (cuando el match termina)
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

  const onSwipeComplete = useCallback((direction: 'right' | 'left') => {
    if (!user || !match || !queue[currentIndex]) return;
    const movieId = queue[currentIndex].id;
    void votarPelicula(matchId, user.uid, movieId, direction === 'right' ? 'yes' : 'no');
    
    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, matchId, queue, user, match]);

  const onGestureEvent = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // END
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

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10], Extrapolate.CLAMP);
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate}deg` }],
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
      <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 15 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Match Movie</Text>
          <View style={styles.matchCounter}>
            <Ionicons name="flame" size={16} color="#ff6b00" />
            <Text style={styles.countText}>{match.matchedMovies.length} Matches</Text>
          </View>
        </View>
      </BlurView>

      <View style={styles.deck}>
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
              {matchedDetails.length > 0 ? (
                matchedDetails.map(movie => (
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
                ))
              ) : (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
              )}
            </View>

            <Pressable style={styles.btnCerrarFinal} onPress={() => navigation.goBack()}>
              <Text style={styles.btnCerrarText}>Volver al chat</Text>
            </Pressable>
          </ScrollView>
        ) : currentIndex < queue.length ? (
          <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
            <Animated.View style={[styles.card, cardStyle, SHADOWS.macLight]}>
              <Image source={{ uri: posterUrl(currentMovie.poster_path, 'w500')! }} style={styles.poster} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardGradient}>
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle}>{currentMovie.title}</Text>
                  <Text style={styles.movieYear}>{currentMovie.release_date}</Text>
                </View>
                <Pressable onPress={() => setShowInfo(true)} style={styles.infoBtn}><Ionicons name="information-circle-outline" size={34} color="#fff" /></Pressable>
              </LinearGradient>
              <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}><Text style={styles.badgeText}>SÍ</Text></Animated.View>
              <Animated.View style={[styles.badge, styles.nopeBadge, nopeOpacity]}><Text style={styles.badgeText}>NO</Text></Animated.View>
            </Animated.View>
          </PanGestureHandler>
        ) : (
          <View style={styles.emptyDeck}>
             <ActivityIndicator color={COLORS.primary} size="large" />
             <Text style={styles.emptyText}>Buscando más recomendaciones...</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
         <Pressable style={styles.roundBtn} onPress={() => { translateX.value = withSpring(-SCREEN_WIDTH - 100); runOnJS(onSwipeComplete)('left'); }}><Ionicons name="close" size={32} color="#ff5050" /></Pressable>
         <Pressable style={styles.roundBtn} onPress={() => { translateX.value = withSpring(SCREEN_WIDTH + 100); runOnJS(onSwipeComplete)('right'); }}><Ionicons name="heart" size={32} color="#2ecc71" /></Pressable>
      </View>

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
  card: { width: SCREEN_WIDTH * 0.85, height: SCREEN_HEIGHT * 0.6, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1e293b' },
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
  btnCerrar: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  btnCerrarText: { color: '#000', fontWeight: '800', fontSize: 16 },
  infoModal: { position: 'absolute', left: 24, right: 24, backgroundColor: '#1e293b', borderRadius: 24, padding: 24, maxHeight: 300 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  modalScroll: { flex: 1 },
  modalOverview: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 22 },
  modalDetails: { flexDirection: 'row', gap: 20, marginTop: 20 },
  modalMeta: { color: COLORS.primary, fontWeight: '800' },
  
  // Estilos de resultados finalizados
  resultsScroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  resultsHeader: { alignItems: 'center', marginBottom: 30 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  resultCard: { width: (SCREEN_WIDTH - 72) / 2, borderRadius: 20, backgroundColor: '#1e293b', overflow: 'hidden', ...SHADOWS.macLight, marginBottom: 12 },
  resultPoster: { width: '100%', aspectRatio: 2/3 },
  resultInfo: { padding: 10 },
  resultTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnCerrarFinal: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 30 },
});
