import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { GradientBottom, GradientTop } from '../theme/colors';

type Props = ViewProps & { children?: React.ReactNode };

export function GradientBackground({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.flex, style]} {...rest}>
      <LinearGradient colors={[GradientTop, GradientBottom]} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
