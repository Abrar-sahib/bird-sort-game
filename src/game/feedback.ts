import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { useAppState } from '../state/AppState';

/** Sound + vibration helpers that respect the user's settings (sound / vibration / mute). */
export function useFeedback() {
  const { settings } = useAppState();
  const soundOn = settings.sound && !settings.muted;
  const vibeOn = settings.vibration && !settings.muted;

  const pickP = useAudioPlayer(require('../../assets/sounds/pick.wav'));
  const dropP = useAudioPlayer(require('../../assets/sounds/drop.wav'));
  const errorP = useAudioPlayer(require('../../assets/sounds/error.wav'));
  const completeP = useAudioPlayer(require('../../assets/sounds/complete.wav'));
  const winP = useAudioPlayer(require('../../assets/sounds/win.wav'));

  function play(p: { seekTo: (s: number) => Promise<void>; play: () => void }) {
    if (!soundOn) return;
    p.seekTo(0).then(() => p.play()).catch(() => {});
  }

  return {
    pick() {
      if (vibeOn) Haptics.selectionAsync();
      play(pickP);
    },
    drop() {
      if (vibeOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      play(dropP);
    },
    error() {
      if (vibeOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      play(errorP);
    },
    complete() {
      if (vibeOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      play(completeP);
    },
    win() {
      if (vibeOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      play(winP);
    },
    /** Short vibration preview used by the settings toggle. */
    previewVibration() {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    previewSound() {
      pickP.seekTo(0).then(() => pickP.play()).catch(() => {});
    },
  };
}
