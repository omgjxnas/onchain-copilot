import { Circle, Path, Rect, Svg } from 'react-native-svg';

import { colors } from '../theme';

type IconProps = { size?: number; color?: string };

/** Line-drawn profile glyph (opens the menu). */
export function ProfileIcon({ size = 22, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.6} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5.5 19.5c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Line-drawn wallet glyph. */
export function WalletIcon({ size = 22, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={6} width={18} height={13} rx={3.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3 10h18" stroke={color} strokeWidth={1.8} />
      <Circle cx={16.5} cy={14.5} r={1.4} fill={color} />
    </Svg>
  );
}

/** Chevron pointing left — a back affordance. */
export function BackIcon({ size = 24, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5l-7 7 7 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
