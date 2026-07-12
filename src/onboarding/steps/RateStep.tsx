import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, radius, space, text } from '../../theme';
import { LEVELS } from '../data';
import { StepHeader } from '../StepHeader';

type Props = { value: number; onChange: (index: number) => void };

const THUMB = 36;
const SPRING = { damping: 18, stiffness: 180 };

/** Drag-to-rate question — pan a glass knob along the track, snaps to levels. */
export function RateStep({ value, onChange }: Props) {
  const [trackW, setTrackW] = useState(0);
  const x = useSharedValue(0);
  const start = useSharedValue(0);

  const steps = LEVELS.length - 1;
  const usable = Math.max(trackW - THUMB, 1);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackW(w);
    x.value = (value / steps) * Math.max(w - THUMB, 1);
  };

  const snap = (px: number) => {
    'worklet';
    const idx = Math.min(Math.max(Math.round((px / usable) * steps), 0), steps);
    x.value = withSpring(idx * (usable / steps), SPRING);
    runOnJS(onChange)(idx);
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      start.value = x.value;
    })
    .onUpdate((e) => {
      x.value = Math.min(Math.max(start.value + e.translationX, 0), usable);
    })
    .onEnd(() => {
      snap(x.value);
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value + THUMB / 2 }));

  return (
    <View style={styles.wrap}>
      <StepHeader
        eyebrow="EXPERIENCE"
        title="How comfortable are you onchain?"
        subtitle="Drag to set your level — it tunes how much the copilot explains."
      />

      <Text style={styles.levelValue}>{LEVELS[value]}</Text>

      <View style={styles.trackArea} onLayout={onLayout}>
        <View style={styles.track} />
        <Animated.View style={[styles.fill, fillStyle]} />
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbCore} />
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.ticks}>
        {LEVELS.map((lvl, i) => (
          <Text key={lvl} style={[styles.tick, i === value && styles.tickOn]}>
            {lvl}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  levelValue: {
    ...text.display,
    color: colors.accentBright,
    marginBottom: space[80],
  },
  trackArea: {
    height: THUMB,
    justifyContent: 'center',
    marginBottom: space[50],
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  thumbCore: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tick: { ...text.footnote, color: colors.textMuted },
  tickOn: { color: colors.accent, fontWeight: '700' },
});
