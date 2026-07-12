import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radius, space, text } from '../theme';
import { GlassSurface } from './GlassSurface';

type Props = {
  /** Convenience label; ignored when `children` is provided. */
  label?: string;
  children?: ReactNode;
  onPress?: () => void;
  /** 'primary' → accent CTA, 'neutral' → subtle glass button/card. */
  variant?: 'primary' | 'neutral';
  /** When set, overrides the tint chosen by `variant` (used for selection). */
  tint?: 'neutral' | 'accent';
  selected?: boolean;
  disabled?: boolean;
  radiusToken?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Interactive Liquid Glass button. A Pressable drives a spring-scale on the
 * glass surface; on iOS 26 the native material also morphs under the touch.
 */
export function GlassButton({
  label,
  children,
  onPress,
  variant = 'neutral',
  tint,
  selected = false,
  disabled = false,
  radiusToken = radius.full,
  style,
  textStyle,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isPrimary = variant === 'primary';
  const effectiveTint = tint ?? (selected ? 'accent' : 'neutral');

  const content =
    children ??
    (<Text style={[styles.label, isPrimary && styles.labelPrimary, textStyle]}>{label}</Text>);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 110 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180 });
      }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={[styles.fullWidth, animatedStyle]}>
        {isPrimary ? (
          // Solid white CTA with dark text — the primary call to action.
          <View style={[styles.base, styles.solid, { borderRadius: radiusToken }, style]}>{content}</View>
        ) : (
          <GlassSurface
            tint={effectiveTint}
            interactive
            radiusToken={radiusToken}
            style={[styles.base, selected && styles.selected, style]}
          >
            {content}
          </GlassSurface>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    minHeight: 52,
    paddingHorizontal: space[80],
    paddingVertical: space[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  solid: {
    backgroundColor: colors.accent,
    overflow: 'hidden',
  },
  label: {
    ...text.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  labelPrimary: {
    color: colors.bg,
    fontWeight: '700',
  },
});
