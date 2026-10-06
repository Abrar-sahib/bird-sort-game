import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const COLORS = {
  ink: '#3d2c8d',
  inkSoft: '#6b6b8a',
  accent: '#7b6cf6',
  card: 'rgba(255,255,255,0.8)',
};

export function Screen({ title, children, back = true }: { title?: string; children: ReactNode; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <LinearGradient colors={['#ffd6a5', '#ffadad', '#7b6cf6']} locations={[0, 0.45, 1]} style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        {back ? (
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
        <View style={styles.back} />
      </View>
      <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>{children}</View>
    </LinearGradient>
  );
}

export function Button({
  label, onPress, variant = 'primary', style,
}: { label: string; onPress: () => void; variant?: 'primary' | 'ghost'; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' ? styles.btnPrimary : styles.btnGhost,
        pressed && { transform: [{ scale: 0.96 }] },
        style,
      ]}
    >
      <Text style={[styles.btnText, variant === 'ghost' && { color: COLORS.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  back: { width: 70 },
  backText: { color: COLORS.ink, fontWeight: '800', fontSize: 17 },
  screenTitle: { fontSize: 24, fontWeight: '900', color: COLORS.ink },
  body: { flex: 1, paddingHorizontal: 20 },
  btn: { paddingVertical: 16, borderRadius: 22, alignItems: 'center', minWidth: 220 },
  btnPrimary: { backgroundColor: COLORS.accent },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.85)' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
