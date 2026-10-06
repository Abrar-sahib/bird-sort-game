import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

type Props = { color: string; size: number; lifted: boolean; flip: boolean };

export function BirdView({ color, size, lifted, flip }: Props) {
  const s = size;
  const lift = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(lifted ? -s * 0.4 : 0, { damping: 12, stiffness: 220 }) },
      { scaleX: flip ? -1 : 1 },
    ],
  }));

  return (
    <Animated.View style={[{ width: s, height: s }, lift]}>
      {/* tail */}
      <View style={[styles.abs, { left: 0, top: s * 0.42, width: s * 0.3, height: s * 0.22, borderRadius: s * 0.1, backgroundColor: color, transform: [{ rotate: '-25deg' }] }]} />
      {/* body */}
      <View style={[styles.abs, { left: s * 0.14, top: s * 0.18, width: s * 0.72, height: s * 0.68, borderRadius: s * 0.36, backgroundColor: color }]} />
      {/* belly */}
      <View style={[styles.abs, { left: s * 0.42, top: s * 0.48, width: s * 0.38, height: s * 0.32, borderRadius: s * 0.2, backgroundColor: 'rgba(255,255,255,0.45)' }]} />
      {/* wing */}
      <View style={[styles.abs, { left: s * 0.2, top: s * 0.42, width: s * 0.36, height: s * 0.24, borderRadius: s * 0.14, backgroundColor: 'rgba(0,0,0,0.18)', transform: [{ rotate: '-12deg' }] }]} />
      {/* eye */}
      <View style={[styles.abs, { left: s * 0.56, top: s * 0.28, width: s * 0.17, height: s * 0.17, borderRadius: s, backgroundColor: '#fff' }]}>
        <View style={[styles.abs, { left: s * 0.06, top: s * 0.045, width: s * 0.08, height: s * 0.08, borderRadius: s, backgroundColor: '#1b1b2f' }]} />
      </View>
      {/* beak */}
      <View
        style={[styles.abs, {
          left: s * 0.82, top: s * 0.36, width: 0, height: 0,
          borderTopWidth: s * 0.07, borderBottomWidth: s * 0.07, borderLeftWidth: s * 0.16,
          borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#ffb020',
        }]}
      />
      {/* legs */}
      <View style={[styles.abs, styles.leg, { left: s * 0.4, top: s * 0.84, height: s * 0.14 }]} />
      <View style={[styles.abs, styles.leg, { left: s * 0.54, top: s * 0.84, height: s * 0.14 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  leg: { width: 2.5, borderRadius: 2, backgroundColor: '#e08a1e' },
});
