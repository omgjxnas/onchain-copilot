import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');
const GRID = 46; // spacing between grid lines
const COLS = Math.floor(W / GRID);
const ROWS = Math.floor(H / GRID);
const STREAK = 30; // length of a signal's comet trail
const THICK = 2.5;

type Axis = 'x' | 'y';
type Signal = {
  axis: Axis;
  lane: number; // grid index the signal travels along
  dir: 1 | -1;
  duration: number;
  delay: number;
  hue: string;
};

// A curated set of signals so the motion feels intentional rather than random.
const SIGNALS: Signal[] = [
  { axis: 'x', lane: 3, dir: 1, duration: 2600, delay: 0, hue: colors.accent },
  { axis: 'x', lane: 7, dir: -1, duration: 3200, delay: 900, hue: colors.accentBright },
  { axis: 'x', lane: 11, dir: 1, duration: 2400, delay: 1600, hue: colors.accent },
  { axis: 'x', lane: 14, dir: 1, duration: 3000, delay: 500, hue: colors.textTertiary },
  { axis: 'x', lane: 17, dir: -1, duration: 2800, delay: 2100, hue: colors.accent },
  { axis: 'y', lane: 1, dir: 1, duration: 2700, delay: 700, hue: colors.accent },
  { axis: 'y', lane: 3, dir: -1, duration: 3400, delay: 1800, hue: colors.textTertiary },
  { axis: 'y', lane: 5, dir: 1, duration: 2500, delay: 300, hue: colors.accentBright },
  { axis: 'y', lane: 6, dir: 1, duration: 3100, delay: 2400, hue: colors.accent },
  { axis: 'y', lane: 7, dir: -1, duration: 2900, delay: 1200, hue: colors.accent },
];

/**
 * Animated backdrop: a faint grid with bright "signals" darting along the lines
 * like transactions racing across the chain. Purely decorative, non-interactive.
 */
export function NeuralGrid() {
  const cols = useMemo(() => Array.from({ length: COLS - 1 }, (_, i) => (i + 1) * GRID), []);
  const rows = useMemo(() => Array.from({ length: ROWS - 1 }, (_, i) => (i + 1) * GRID), []);

  return (
    <View style={styles.fill} pointerEvents="none">
      {/* Static grid lines */}
      {cols.map((x) => (
        <View key={`c${x}`} style={[styles.vline, { left: x }]} />
      ))}
      {rows.map((y) => (
        <View key={`r${y}`} style={[styles.hline, { top: y }]} />
      ))}

      {/* Moving signals */}
      {SIGNALS.map((s, i) => (
        <SignalComet key={i} signal={s} />
      ))}
    </View>
  );
}

function SignalComet({ signal }: { signal: Signal }) {
  const { axis, lane, dir, duration, delay, hue } = signal;
  const p = useSharedValue(0);

  // Kick off an endless linear sweep; each signal offset by its own delay.
  p.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false));

  const span = axis === 'x' ? W : H;
  const lanePos = lane * GRID;

  const animatedStyle = useAnimatedStyle(() => {
    const t = p.value;
    // Travel from just off one edge to just off the other.
    const from = dir === 1 ? -STREAK : span + STREAK;
    const to = dir === 1 ? span + STREAK : -STREAK;
    const pos = from + (to - from) * t;
    // Bell-shaped opacity so signals fade in and out rather than pop.
    const opacity = Math.sin(t * Math.PI);

    if (axis === 'x') {
      return { opacity, transform: [{ translateX: pos }, { translateY: lanePos }] };
    }
    return { opacity, transform: [{ translateX: lanePos }, { translateY: pos }] };
  });

  const sizeStyle =
    axis === 'x'
      ? { width: STREAK, height: THICK }
      : { width: THICK, height: STREAK };

  return (
    <Animated.View
      style={[
        styles.signal,
        sizeStyle,
        { backgroundColor: hue, shadowColor: hue },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  vline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.accent,
    opacity: 0.05,
  },
  hline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.accent,
    opacity: 0.05,
  },
  signal: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: THICK,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
