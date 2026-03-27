import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, View, Text, Image, Pressable, 
  ActivityIndicator, Dimensions, Animated, PanResponder 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Services
import { observarMatch, registrarVoto } from '../services/repositorioMatches';
// import { obtenerPeliculasPorVerDeAmigo } from '../services/repositorioPeliculasUsuario';
import { tmdbApi } from '../services/tmdbClient';
import { MovieMatch as MatchType } from '../types/match';
import { GlassBorder, GradientTop } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

type Props = NativeStackScreenProps<RootStackParamList, 'MovieMatch'>;

export default function MovieMatchScreen({ navigation, route }: Props) {
  const { matchId, chatId } = route.params;
  const insets = useSafeAreaInsets();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Swipe Animation
  const position = useRef(new Animated.ValueXY()).current;
  
  useEffect(() => {
    const unsub = observarMatch(matchId, (m) => {
        setMatch(m);
        if (loading) loadCandidates(m);
    });
    return unsub;
  }, [matchId]);

  const loadCandidates = async (m: MatchType) => {
    try {
        // En una implementación real, aquí buscaríamos pelis de los otros participantes
        // Por ahora, traemos tendencias para el demo
        const movies = await tmdbApi.obtenerTendencias();
        setCandidates(movies);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    }
  });

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? width : -width;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const movie = candidates[currentIndex];
    registrarVoto(matchId, movie.id, direction === 'right' ? 'yes' : 'no');
    
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-width * 1.5, 0, width * 1.5],
      outputRange: ['-30deg', '0deg', '30deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const renderCard = () => {
    if (currentIndex >= candidates.length) {
        return (
            <View style={styles.emptyCard}>
                <Ionicons name="sparkles" size={64} color="#38bdf8" />
                <Text style={styles.emptyText}>Buscando más recomendaciones...</Text>
            </View>
        );
    }

    return (
      <Animated.View 
        style={[styles.cardContainer, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        <Image 
          source={{ uri: `https://image.tmdb.org/t/p/w500${candidates[currentIndex].poster_path}` }} 
          style={styles.cardImage}
        />
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardOverlay}
        >
            <Text style={styles.cardTitle}>{candidates[currentIndex].title}</Text>
            <View style={styles.cardInfoRow}>
                <BlurView intensity={30} style={styles.badge}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.badgeText}>{candidates[currentIndex].vote_average?.toFixed(1)}</Text>
                </BlurView>
                <Pressable style={styles.infoBtn}>
                    <Ionicons name="information-circle" size={28} color="#fff" />
                </Pressable>
            </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
        <LinearGradient colors={[GradientTop, '#000']} style={StyleSheet.absoluteFill} />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <View style={styles.matchesCounter}>
                <Text style={styles.counterLabel}>Matches</Text>
                <Text style={styles.counterValue}>{match?.matchedMovies.length || 0} / {match?.settings.targetMatches || 3}</Text>
            </View>
            <View style={{ width: 44 }} />
        </View>

        <View style={styles.cardSpace}>
            {loading ? <ActivityIndicator size="large" color="#38bdf8" /> : renderCard()}
        </View>

        {/* Footer Actions */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
            <Pressable onPress={() => forceSwipe('left')} style={[styles.actionBtn, styles.noBtn]}>
                <Ionicons name="close" size={32} color="#ff8a80" />
            </Pressable>
            <Pressable onPress={() => forceSwipe('right')} style={[styles.actionBtn, styles.yesBtn]}>
                <Ionicons name="heart" size={32} color="#7CFC9A" />
            </Pressable>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  matchesCounter: { alignItems: 'center' },
  counterLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  counterValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardSpace: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  cardContainer: { 
    width: width - 40, 
    height: height * 0.6, 
    borderRadius: 30, 
    backgroundColor: '#111', 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: GlassBorder
  },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 100 },
  cardTitle: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 16 },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, overflow: 'hidden' },
  badgeText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 6 },
  infoBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
  actionBtn: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  noBtn: { borderColor: 'rgba(255,138,128,0.3)' },
  yesBtn: { borderColor: 'rgba(124,252,154,0.3)' },
  emptyCard: { alignItems: 'center', gap: 20 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, textAlign: 'center' }
});
