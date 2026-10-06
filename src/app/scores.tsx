import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppState } from '../state/AppState';
import { Button, COLORS, Screen } from '../ui';

export default function Scores() {
  const { scores, resetScores } = useAppState();
  const levels = Array.from({ length: scores.highestLevel }, (_, i) => i + 1);
  const avg = scores.totalWins ? Math.round(scores.totalMoves / scores.totalWins) : 0;

  function confirmReset() {
    Alert.alert('Reset scores?', 'This clears all your progress and best scores.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetScores },
    ]);
  }

  return (
    <Screen title="Score board">
      <View style={styles.stats}>
        <Stat label="Highest level" value={String(scores.highestLevel)} />
        <Stat label="Levels won" value={String(scores.totalWins)} />
        <Stat label="Avg. moves" value={String(avg)} />
      </View>

      <Text style={styles.heading}>Best moves per level</Text>
      <ScrollView style={styles.list} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
        {levels.length === 0 ? (
          <Text style={styles.empty}>No levels completed yet. Go play! 🐦</Text>
        ) : (
          levels.map((lv) => (
            <View key={lv} style={styles.row}>
              <Text style={styles.level}>Level {lv}</Text>
              <Text style={styles.moves}>{scores.bestMoves[lv] ?? '—'} moves</Text>
            </View>
          ))
        )}
      </ScrollView>
      {levels.length > 0 && <Button label="Reset scores" variant="ghost" onPress={confirmReset} style={{ alignSelf: 'center' }} />}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginTop: 8 },
  stat: { flex: 1, backgroundColor: COLORS.card, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: '900', color: COLORS.ink },
  statLabel: { fontSize: 12, fontWeight: '700', color: COLORS.inkSoft, marginTop: 2 },
  heading: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginTop: 20, marginBottom: 10 },
  list: { flex: 1 },
  empty: { color: COLORS.ink, opacity: 0.8, textAlign: 'center', marginTop: 30, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14 },
  level: { fontWeight: '800', color: COLORS.ink, fontSize: 16 },
  moves: { fontWeight: '700', color: COLORS.inkSoft, fontSize: 16 },
});
