import { StyleSheet, Switch, Text, View } from 'react-native';
import { useFeedback } from '../game/feedback';
import { useAppState } from '../state/AppState';
import { COLORS, Screen } from '../ui';

export default function Settings() {
  const { settings, updateSettings } = useAppState();
  const fb = useFeedback();

  return (
    <Screen title="Settings">
      <View style={styles.card}>
        <Row
          title="Mute all"
          sub="Silence sounds and vibration"
          value={settings.muted}
          onChange={(v) => updateSettings({ muted: v })}
        />
        <Row
          title="Sound effects"
          sub="Chirps when you move birds"
          value={settings.sound}
          disabled={settings.muted}
          onChange={(v) => {
            updateSettings({ sound: v });
            if (v && !settings.muted) fb.previewSound();
          }}
        />
        <Row
          title="Vibration"
          sub="Haptic feedback on moves"
          value={settings.vibration}
          disabled={settings.muted}
          onChange={(v) => {
            updateSettings({ vibration: v });
            if (v && !settings.muted) fb.previewVibration();
          }}
          last
        />
      </View>

      <Text style={styles.heading}>About</Text>
      <View style={styles.card}>
        <Text style={styles.about}>
          <Text style={styles.bold}>Bird Sort</Text> · version 1.0.0{'\n\n'}
          Drag (or tap) the birds at the end of a branch onto another branch. Birds can only land on an empty branch or on
          birds of the same color. Fill a branch with one color to send the flock flying. Clear every branch to win!
        </Text>
      </View>
    </Screen>
  );
}

function Row({
  title, sub, value, onChange, disabled, last,
}: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder, disabled && { opacity: 0.45 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: COLORS.accent, false: '#c9c4e6' }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 22, paddingHorizontal: 18, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(61,44,141,0.2)' },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.ink },
  sub: { fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  heading: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginTop: 22 },
  about: { color: COLORS.ink, fontSize: 14, lineHeight: 20, paddingVertical: 16 },
  bold: { fontWeight: '900' },
});
