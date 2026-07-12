import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radius, space } from '../theme';

type Props = {
  /** Number of steps in the flow. */
  count: number;
  /** Zero-based index of the current step. */
  index: number;
};

/** Minimal segmented progress: completed/active segments fill with accent. */
export function ProgressBar({ count, index }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Segment key={i} active={i <= index} />
      ))}
    </View>
  );
}

function Segment({ active }: { active: boolean }) {
  const fill = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, fill]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + fill.value * 0.75,
    backgroundColor: colors.accent,
    transform: [{ scaleX: 0.4 + fill.value * 0.6 }],
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space[30],
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.full,
  },
});
