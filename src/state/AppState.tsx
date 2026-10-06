import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Settings = {
  sound: boolean;
  vibration: boolean;
  /** Master mute: silences sound AND vibration without losing the individual choices. */
  muted: boolean;
};

export type Scores = {
  /** Best (lowest) move count for each completed level. */
  bestMoves: Record<number, number>;
  /** Highest level fully completed. */
  highestLevel: number;
  /** Total levels completed (including replays). */
  totalWins: number;
  totalMoves: number;
};

const DEFAULT_SETTINGS: Settings = { sound: true, vibration: true, muted: false };
const DEFAULT_SCORES: Scores = { bestMoves: {}, highestLevel: 0, totalWins: 0, totalMoves: 0 };
const KEY = 'birdsort:v1';

type Ctx = {
  ready: boolean;
  settings: Settings;
  scores: Scores;
  updateSettings: (patch: Partial<Settings>) => void;
  recordWin: (level: number, moves: number) => void;
  resetScores: () => void;
};

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [scores, setScores] = useState<Scores>(DEFAULT_SCORES);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const data = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        setScores({ ...DEFAULT_SCORES, ...data.scores });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((s: Settings, sc: Scores) => {
    AsyncStorage.setItem(KEY, JSON.stringify({ settings: s, scores: sc })).catch(() => {});
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      persist(next, scores);
    },
    [settings, scores, persist],
  );

  const recordWin = useCallback(
    (level: number, moves: number) => {
      const prev = scores.bestMoves[level];
      const next: Scores = {
        bestMoves: { ...scores.bestMoves, [level]: prev === undefined ? moves : Math.min(prev, moves) },
        highestLevel: Math.max(scores.highestLevel, level),
        totalWins: scores.totalWins + 1,
        totalMoves: scores.totalMoves + moves,
      };
      setScores(next);
      persist(settings, next);
    },
    [scores, settings, persist],
  );

  const resetScores = useCallback(() => {
    setScores(DEFAULT_SCORES);
    persist(settings, DEFAULT_SCORES);
  }, [settings, persist]);

  const value = useMemo(
    () => ({ ready, settings, scores, updateSettings, recordWin, resetScores }),
    [ready, settings, scores, updateSettings, recordWin, resetScores],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
