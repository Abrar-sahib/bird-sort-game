import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn, FadeOutUp, useAnimatedStyle, useSharedValue, ZoomIn,
} from 'react-native-reanimated';
import { BirdView } from './BirdView';
import {
  applyMove, BIRD_COLORS, Branch, canMove, CAPACITY, isComplete, isWon, makeLevel, topGroupSize,
} from './logic';
import { useFeedback } from './feedback';
import { useAppState } from '../state/AppState';

type Drag = { from: number; count: number; flip: boolean };

export function Game() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const fb = useFeedback();
  const { recordWin } = useAppState();
  const params = useLocalSearchParams<{ level?: string }>();
  const startAt = Math.max(1, Number(params.level) || 1);

  const [level, setLevel] = useState(startAt);
  const [initial, setInitial] = useState<Branch[]>(() => makeLevel(startAt));
  const [branches, setBranches] = useState<Branch[]>(initial);
  const [history, setHistory] = useState<Branch[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);

  // Finger position (relative to the tree area) for the floating birds.
  const fx = useSharedValue(0);
  const fy = useSharedValue(0);
  const [rowLayouts, setRowLayouts] = useState<{ y: number; h: number }[]>([]);
  const [treeWidth, setTreeWidth] = useState(width);

  const won = isWon(branches);

  // Save the result once when the level is cleared.
  useEffect(() => {
    if (won) {
      fb.win();
      recordWin(level, moves);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);
  const colWidth = (width - 24) / 2;
  const birdSize = Math.min(56, (colWidth - 16) / CAPACITY);

  function startLevel(n: number) {
    const lv = makeLevel(n);
    setLevel(n);
    setInitial(lv);
    setBranches(lv);
    setHistory([]);
    setSelected(null);
    setMoves(0);
  }

  function restart() {
    setBranches(initial);
    setHistory([]);
    setSelected(null);
    setMoves(0);
  }

  function undo() {
    if (!history.length) return;
    setBranches(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setSelected(null);
  }

  /** Which branch is under a point (tree coordinates)? */
  function hitBranch(x: number, y: number): number | null {
    const rows = rowLayouts;
    if (!rows.length) return null;
    let best = 0;
    let bestDist = Infinity;
    rows.forEach((r, i) => {
      const d = Math.abs(y - (r.y + r.h / 2));
      if (d < bestDist) { bestDist = d; best = i; }
    });
    const idx = best * 2 + (x < treeWidth / 2 ? 0 : 1);
    return idx < branches.length ? idx : null;
  }

  function doMove(from: number, to: number) {
    const next = applyMove(branches, from, to);
    setHistory([...history, branches]);
    setBranches(next);
    setSelected(null);
    setMoves(moves + 1);
    fb.drop();

    if (isComplete(next[to])) {
      fb.complete();
      setTimeout(() => {
        setBranches((cur) => cur.map((b, k) => (k === to && isComplete(b) ? [] : b)));
      }, 500);
    }
  }

  function onTap(i: number | null) {
    if (i === null) { setSelected(null); return; }
    if (selected === null) {
      if (branches[i].length && !isComplete(branches[i])) {
        setSelected(i);
        fb.pick();
      }
      return;
    }
    if (selected === i) { setSelected(null); return; }
    if (!canMove(branches[selected], branches[i])) {
      fb.error();
      setSelected(branches[i].length && !isComplete(branches[i]) ? i : null);
      return;
    }
    doMove(selected, i);
  }

  // Drag birds from one branch and drop them on another.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(6)
    .onStart((e) => {
      const from = hitBranch(e.x, e.y);
      if (from === null || !branches[from].length || isComplete(branches[from])) return;
      fx.set(e.x);
      fy.set(e.y);
      setSelected(null);
      setDrag({ from, count: topGroupSize(branches[from]), flip: from % 2 === 1 });
      fb.pick();
    })
    .onUpdate((e) => {
      fx.set(e.x);
      fy.set(e.y);
    })
    .onEnd((e) => {
      if (!drag) return;
      const to = hitBranch(e.x, e.y);
      if (to !== null && to !== drag.from) {
        if (canMove(branches[drag.from], branches[to])) doMove(drag.from, to);
        else fb.error();
      }
    })
    .onFinalize(() => setDrag(null));

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => onTap(hitBranch(e.x, e.y)));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: fx.get() - birdSize / 2 },
      { translateY: fy.get() - birdSize * 1.1 },
    ],
  }));

  const rows = Math.ceil(branches.length / 2);

  return (
    <LinearGradient colors={['#ffd6a5', '#ffadad', '#7b6cf6']} locations={[0, 0.45, 1]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={[styles.menuBtn, { top: insets.top + 12 }]}>
          <Text style={styles.menuText}>‹ Menu</Text>
        </Pressable>
        <Text style={styles.title}>Bird Sort</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>Level {level}</Text>
          <Text style={styles.stat}>Moves {moves}</Text>
        </View>
        <Text style={styles.hint}>Drag birds onto another branch</Text>
      </View>

      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View
          style={styles.tree}
          onLayout={(e) => setTreeWidth(e.nativeEvent.layout.width)}
        >
          <View style={[styles.trunk, { left: 0 }]} pointerEvents="none" />
          <View style={[styles.trunk, { right: 0 }]} pointerEvents="none" />
          {Array.from({ length: rows }, (_, r) => (
            <View
              key={r}
              style={styles.row}
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                setRowLayouts((prev) => {
                  const next = [...prev];
                  next[r] = { y, h: height };
                  return next;
                });
              }}
            >
              {[r * 2, r * 2 + 1].map((i) =>
                i < branches.length ? (
                  <BranchView
                    key={i}
                    branch={drag && drag.from === i ? branches[i].slice(0, branches[i].length - drag.count) : branches[i]}
                    done={isComplete(branches[i])}
                    side={i % 2 === 0 ? 'left' : 'right'}
                    width={colWidth}
                    birdSize={birdSize}
                    liftCount={selected === i ? topGroupSize(branches[i]) : 0}
                  />
                ) : (
                  <View key={i} style={{ width: colWidth }} />
                ),
              )}
            </View>
          ))}

          {drag && (
            <Animated.View pointerEvents="none" style={[styles.floating, floatStyle]}>
              {branches[drag.from].slice(-drag.count).map((bird) => (
                <BirdView
                  key={bird.id}
                  color={BIRD_COLORS[bird.color]}
                  size={birdSize}
                  flip={drag.flip}
                  lifted={false}
                />
              ))}
            </Animated.View>
          )}
        </View>
      </GestureDetector>

      <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
        <ToolButton label="↶ Undo" onPress={undo} disabled={!history.length} />
        <ToolButton label="⟳ Restart" onPress={restart} />
      </View>

      {won && (
        <Animated.View entering={FadeIn} style={styles.overlay}>
          <Animated.View entering={ZoomIn.springify()} style={styles.card}>
            <Text style={styles.cardEmoji}>🎉</Text>
            <Text style={styles.cardTitle}>Level {level} complete!</Text>
            <Text style={styles.cardSub}>Solved in {moves} moves</Text>
            <Pressable style={styles.cta} onPress={() => startLevel(level + 1)}>
              <Text style={styles.ctaText}>Next level →</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

type BranchProps = {
  branch: Branch;
  done: boolean;
  side: 'left' | 'right';
  width: number;
  birdSize: number;
  liftCount: number;
};

function BranchView({ branch, done, side, width, birdSize, liftCount }: BranchProps) {
  const dir = side === 'left' ? 'row' : 'row-reverse';
  return (
    <View style={[styles.branchHit, { width, height: birdSize * 1.9 }, liftCount > 0 && styles.branchSelected]}>
      <View style={[styles.stick, side === 'left' ? styles.stickLeft : styles.stickRight, done && styles.stickDone]} />
      <View style={[styles.perch, { flexDirection: dir, bottom: 10 }]}>
        {branch.map((bird, idx) => (
          <Animated.View key={bird.id} entering={ZoomIn.duration(220)} exiting={done ? FadeOutUp.duration(450) : undefined}>
            <BirdView
              color={BIRD_COLORS[bird.color]}
              size={birdSize}
              flip={side === 'right'}
              lifted={idx >= branch.length - liftCount}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function ToolButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.tool, pressed && { transform: [{ scale: 0.95 }] }, disabled && { opacity: 0.4 }]}
    >
      <Text style={styles.toolText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: 8 },
  title: { fontSize: 34, fontWeight: '900', color: '#3d2c8d', letterSpacing: 0.5 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 6 },
  stat: {
    backgroundColor: 'rgba(255,255,255,0.55)', color: '#3d2c8d', fontWeight: '700',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden',
  },
  hint: { marginTop: 6, color: '#3d2c8d', opacity: 0.7, fontWeight: '600', fontSize: 13 },
  menuBtn: { position: 'absolute', left: 16, zIndex: 5 },
  menuText: { color: '#3d2c8d', fontWeight: '800', fontSize: 17 },
  tree: { flex: 1, justifyContent: 'space-evenly', paddingHorizontal: 12 },
  trunk: { position: 'absolute', top: 0, bottom: 0, width: 14, backgroundColor: '#6b4226', borderRadius: 7 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  branchHit: { justifyContent: 'flex-end', borderRadius: 16 },
  branchSelected: { backgroundColor: 'rgba(255,255,255,0.35)' },
  stick: { position: 'absolute', bottom: 4, height: 10, backgroundColor: '#8b5a3c', borderRadius: 5 },
  stickLeft: { left: -12, right: 8 },
  stickRight: { right: -12, left: 8 },
  stickDone: { backgroundColor: '#5fbf6a' },
  perch: { position: 'absolute', left: 8, right: 8 },
  floating: { position: 'absolute', left: 0, top: 0, flexDirection: 'row' },
  toolbar: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingTop: 8 },
  tool: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 18 },
  toolText: { fontSize: 16, fontWeight: '800', color: '#3d2c8d' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(30,20,70,0.45)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 28, alignItems: 'center', width: '78%' },
  cardEmoji: { fontSize: 48 },
  cardTitle: { fontSize: 24, fontWeight: '900', color: '#3d2c8d', marginTop: 8 },
  cardSub: { fontSize: 15, color: '#6b6b8a', marginTop: 4 },
  cta: { marginTop: 20, backgroundColor: '#7b6cf6', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 18 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
