import { forwardRef } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { colors, radius } from '../theme';

// Resolved once: native Liquid Glass needs iOS 26+ and the native module (a
// development/native build). In Expo Go or anywhere the module is missing, the
// availability probe throws — we swallow it and fall back to a flat surface.
function detectGlass(): boolean {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
}
const glassSupported = detectGlass();

export type GlassSurfaceProps = ViewProps & {
  /** Which token-defined tint the glass carries. */
  tint?: 'neutral' | 'accent';
  /** Native glass material style. */
  glass?: 'regular' | 'clear';
  /** Enables the native interactive press morph on iOS. */
  interactive?: boolean;
  /** Corner radius (pass a radius token). */
  radiusToken?: number;
};

/**
 * Low-level visual layer: a rounded native Liquid Glass panel, or a tinted
 * fallback surface. Holds no press logic — compose it inside a Pressable.
 */
export const GlassSurface = forwardRef<View, GlassSurfaceProps>(function GlassSurface(
  { tint = 'neutral', glass = 'regular', interactive = false, radiusToken = radius[50], style, children, ...rest },
  ref,
) {
  const tintColor = tint === 'accent' ? colors.glassTintAccent : colors.glassTintNeutral;

  if (glassSupported) {
    return (
      <GlassView
        ref={ref}
        glassEffectStyle={glass}
        tintColor={tintColor}
        isInteractive={interactive}
        colorScheme="dark"
        style={[{ borderRadius: radiusToken, overflow: 'hidden' }, style]}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      ref={ref}
      style={[
        {
          borderRadius: radiusToken,
          backgroundColor: tint === 'accent' ? colors.accentDeep : colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: tint === 'accent' ? colors.accent : colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
});
