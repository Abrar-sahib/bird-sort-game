import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { BirdView } from '../game/BirdView';
import { BIRD_COLORS } from '../game/logic';
import { useAppState } from '../state/AppState';
import { Button, COLORS, Screen } from '../ui';

function Hopper({ color, delay, flip }: { color: string; delay: number; flip?: boolean }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(
      withRepeat(
        withSequence(withTiming(0, { duration: delay }), withTiming(-14, { duration: 260 }), withTiming(0, { duration: 260 }), withTiming(0, { duration: 900 })),
        -1,
      ),
    );
  }, [y, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return (
    <Animated.View style={style}>
      <BirdView color={color} size={62} lifted={false} flip={!!flip} />
    </Animated.View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { scores } = useAppState();
  const next = scores.highestLevel + 1;

  return (
    <Screen back={false}>
      <View style={styles.center}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>Bird Sort</Animated.Text>
        <Text style={styles.tagline}>Sort the flock. One color per branch.</Text>

        <View style={styles.branch}>
          <View style={styles.birds}>
            {BIRD_COLORS.slice(0, 4).map((c, i) => (
              <Hopper key={c} color={c} delay={i * 220} />
            ))}
          </View>
          <View style={styles.stick} />
        </View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.buttons}>
          <Button
            label={scores.highestLevel > 0 ? `Continue · Level ${next}` : 'Play'}
            onPress={() => router.push({ pathname: '/game', params: { level: String(next) } })}
          />
          <Button label="Score board" variant="ghost" onPress={() => router.push('/scores')} />
          <Button label="Settings" variant="ghost" onPress={() => router.push('/settings')} />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  title: { fontSize: 54, fontWeight: '900', color: COLORS.ink, letterSpacing: 1 },
  tagline: { fontSize: 15, color: COLORS.ink, opacity: 0.75, fontWeight: '600' },
  branch: { marginTop: 36, marginBottom: 40, alignItems: 'center' },
  birds: { flexDirection: 'row' },
  stick: { width: 300, height: 12, borderRadius: 6, backgroundColor: '#8b5a3c', marginTop: -6 },
  buttons: { gap: 12 },
});
