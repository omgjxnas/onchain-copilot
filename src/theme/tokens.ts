/**
 * Semantic tokens — the vocabulary the app actually speaks.
 *
 * Components reference these (colors.textSecondary, colors.accent…) rather than
 * raw primitives, so a future light theme or brand tweak is a one-file change.
 * Dark mode only for now.
 */

import { palette, radii, spacing, typography } from './primitives';

export const colors = {
  // Surfaces, from the base canvas up through elevated glass layers.
  bg: palette.neutral[10],
  surface: palette.neutral[20],
  surfaceRaised: palette.neutral[30],
  surfaceHover: palette.neutral[40],

  // Hairlines and outlines.
  border: palette.neutral[40],
  borderStrong: palette.neutral[50],

  // Foreground text, high → low emphasis.
  textPrimary: palette.neutral[100],
  textSecondary: palette.neutral[90],
  textTertiary: palette.neutral[80],
  textMuted: palette.neutral[60],

  // Brand accent + how content sits on top of it.
  accent: palette.accent[80],
  accentBright: palette.accent[90],
  accentDeep: palette.accent[20],
  onAccent: palette.neutral[10],

  // Translucent tints handed to native glass materials.
  glassTintNeutral: 'rgba(124, 135, 152, 0.10)',
  glassTintAccent: 'rgba(110, 231, 183, 0.16)',
} as const;

/** Spacing aliased straight from the primitive scale. */
export const space = spacing;

/** Radii aliased straight from the primitive scale. */
export const radius = radii;

/** Text styles ready to spread into a Text `style`. */
export const text = {
  display: {
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.tight,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: typography.size.title1,
    lineHeight: typography.lineHeight.title1,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.tight,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: typography.size.title2,
    lineHeight: typography.lineHeight.title2,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  callout: {
    fontSize: typography.size.callout,
    lineHeight: typography.lineHeight.callout,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  body: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.textSecondary,
  },
  footnote: {
    fontSize: typography.size.footnote,
    lineHeight: typography.lineHeight.footnote,
    fontWeight: typography.weight.regular,
    color: colors.textMuted,
  },
  label: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.tracking.label,
    color: colors.accent,
  },
} as const;

export const theme = { colors, space, radius, text } as const;
export type Theme = typeof theme;
