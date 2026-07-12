import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GlassSurface } from '../../components';
import { colors, radius, space, text } from '../../theme';
import { PROMISE_CARDS } from '../data';
import { StepHeader } from '../StepHeader';

type Props = { onDone: () => void };

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 110;

/** Swipe-deck question — flick each trust card away; last one advances. */
export function PromiseStep({ onDone }: Props) {
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (top >= PROMISE_CARDS.length) onDone();
  }, [top, onDone]);

  const visible = PROMISE_CARDS.slice(top, top + 3);

  return (
    <View style={styles.wrap}>
      <StepHeader
        eyebrow="HOW IT KEEPS YOU SAFE"
        title="A few promises"
        subtitle="Swipe each card away to continue."
      />

      <View style={styles.deck}>
        {visible
          .map((card, i) => (
            <SwipeCard
              key={card.id}
              title={card.title}
              body={card.body}
              depth={i}
              interactive={i === 0}
              onSwiped={() => setTop((t) => t + 1)}
            />
          ))
          .reverse()}
      </View>

      <Text style={styles.counter}>
        {Math.min(top + 1, PROMISE_CARDS.length)} / {PROMISE_CARDS.length}
      </Text>
    </View>
  );
}

type CardProps = {
  title: string;
  body: string;
  depth: number;
  interactive: boolean;
  onSwiped: () => void;
};

function SwipeCard({ title, body, depth, interactive, onSwiped }: CardProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(interactive)
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        tx.value = withTiming(Math.sign(e.translationX) * SCREEN_W * 1.4, { duration: 260 });
        runOnJS(onSwiped)();
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Cards deeper in the stack sit slightly smaller and lower.
    const restScale = 1 - depth * 0.05;
    const restY = depth * 12;
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value + restY },
        { rotate: `${interpolate(tx.value, [-SCREEN_W, SCREEN_W], [-10, 10])}deg` },
        { scale: restScale },
      ],
      zIndex: 10 - depth,
    };
  });

  const yesStyle = useAnimatedStyle(() => ({ opacity: Math.max(tx.value / SWIPE_THRESHOLD, 0) }));
  const skipStyle = useAnimatedStyle(() => ({ opacity: Math.max(-tx.value / SWIPE_THRESHOLD, 0) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.cardWrap, animatedStyle]}>
        <GlassSurface tint="neutral" interactive={interactive} radiusToken={radius[60]} style={styles.card}>
          <View style={styles.badgeRow}>
            <Animated.Text style={[styles.stampYes, yesStyle]}>GOT IT</Animated.Text>
            <Animated.Text style={[styles.stampSkip, skipStyle]}>GOT IT</Animated.Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>{body}</Text>
        </GlassSurface>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    minHeight: 220,
    padding: space[80],
    justifyContent: 'flex-end',
    gap: space[40],
  },
  badgeRow: {
    position: 'absolute',
    top: space[70],
    left: space[80],
    right: space[80],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stampYes: {
    ...text.label,
    color: colors.accent,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius[20],
    paddingHorizontal: space[40],
    paddingVertical: space[20],
  },
  stampSkip: {
    ...text.label,
    color: colors.textMuted,
    borderWidth: 2,
    borderColor: colors.textMuted,
    borderRadius: radius[20],
    paddingHorizontal: space[40],
    paddingVertical: space[20],
  },
  cardTitle: { ...text.title2 },
  cardBody: { ...text.body },
  counter: {
    ...text.footnote,
    textAlign: 'center',
    marginTop: space[50],
  },
});
