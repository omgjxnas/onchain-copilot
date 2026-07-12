import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Circle, Defs, FeColorMatrix, FeGaussianBlur, Filter, G, Svg } from 'react-native-svg';

import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circles that orbit the centre at different radii / speeds. Inside the "goo"
// filter they blur together and the alpha threshold re-sharpens the union into
// a single organic metaball with liquid necks — so it morphs as they move.
type Orbit = { r: number; ox: number; oy: number; cx0: number; cy0: number; phase: number; speed: number };
const ORBITS: Orbit[] = [
  { r: 0.26, ox: 0.1, oy: 0.08, cx0: 0.46, cy0: 0.44, phase: 0.0, speed: 1.0 },
  { r: 0.21, ox: 0.13, oy: 0.11, cx0: 0.56, cy0: 0.5, phase: 0.35, speed: -0.9 },
  { r: 0.17, ox: 0.11, oy: 0.13, cx0: 0.5, cy0: 0.58, phase: 0.7, speed: 1.25 },
];

type Props = { size?: number; tint?: 'white' | 'accent' };

/** Animated metaball. Purely decorative, non-interactive. */
export function Blob({ size = 128, tint = 'white' }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.linear }), -1, false);
  }, [t]);

  const color = tint === 'accent' ? colors.accent : colors.textPrimary;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} pointerEvents="none">
      <Defs>
        <Filter id="goo" x="-30%" y="-30%" width="160%" height="160%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation={size * 0.05} result="blur" />
          <FeColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
          />
        </Filter>
      </Defs>
      <G filter="url(#goo)">
        {ORBITS.map((orbit, i) => (
          <MetaCircle key={i} t={t} size={size} orbit={orbit} color={color} />
        ))}
      </G>
    </Svg>
  );
}

function MetaCircle({
  t,
  size,
  orbit,
  color,
}: {
  t: SharedValue<number>;
  size: number;
  orbit: Orbit;
  color: string;
}) {
  const animatedProps = useAnimatedProps(() => {
    const a = 2 * Math.PI * (t.value * orbit.speed + orbit.phase);
    return {
      cx: orbit.cx0 * size + orbit.ox * size * Math.cos(a),
      cy: orbit.cy0 * size + orbit.oy * size * Math.sin(a),
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} r={orbit.r * size} fill={color} />;
}
