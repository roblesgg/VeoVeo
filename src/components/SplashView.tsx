import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTop, GradientBottom } from '../theme/colors';

const { width } = Dimensions.get('window');

export function SplashView() {
  const scale = React.useRef(new Animated.Value(0.8)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[GradientTop, GradientBottom]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.inner, { transform: [{ scale }], opacity }]}>
        <View style={styles.logoRing}>
           <Image 
             source={require('../../assets/icon-transparent.png')} 
             style={styles.logo} 
             resizeMode="contain"
           />
        </View>
        <Animated.Text style={styles.text}>VeoVeo</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  inner: { alignItems: 'center', justifyContent: 'center' },
  logoRing: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 2, 
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowRadius: 30,
    shadowOpacity: 0.3,
  },
  logo: { width: 80, height: 80 },
  text: { 
    marginTop: 24, 
    fontSize: 42, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 }
  }
});
