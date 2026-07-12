/**
 * Design primitives — raw, context-free values.
 *
 * Scales run 10 → 100 in steps of 10. For color, 10 is the darkest step and
 * 100 the lightest (the whole system is dark-mode only for now, so low numbers
 * sit near the background and high numbers near the foreground text).
 *
 * Nothing in the app should import a hex/px literal directly — consume these
 * through the semantic tokens in ./tokens instead.
 */

export const palette = {
  // Cool slate neutrals — the structural greys of the UI.
  neutral: {
    10: '#0B0F14', // app background
    20: '#10151C',
    30: '#161D26',
    40: '#1F2731',
    50: '#2B3542',
    60: '#3B4757',
    70: '#556174',
    80: '#7C8798',
    90: '#A9B3C1',
    100: '#F8FAFC', // high-contrast text
  },
  // Ice white — a monochrome accent. Low steps stay dark (surfaces), high steps
  // are near-white for emphasis (active states, primary CTA, the send button).
  accent: {
    10: '#191C20',
    20: '#23272C',
    30: '#31363C',
    40: '#454B52',
    50: '#5C636B',
    60: '#79808A',
    70: '#99A1AB',
    80: '#E9EDF2', // brand accent (ice white)
    90: '#F6F8FB',
    100: '#FFFFFF',
  },
} as const;

/** Font families. Loaded via expo-font (see src/theme/fonts). */
export const fonts = {
  mono: 'SpaceMono',
  monoBold: 'SpaceMono-Bold',
} as const;

/** Spacing scale, 4px-based. Keys are the primitive step, values are px. */
export const spacing = {
  10: 2,
  20: 4,
  30: 8,
  40: 12,
  50: 16,
  60: 20,
  70: 24,
  80: 32,
  90: 48,
  100: 64,
} as const;

/** Corner radius scale in px. `full` is a large value for pills/circles. */
export const radii = {
  10: 4,
  20: 8,
  30: 12,
  40: 16,
  50: 20,
  60: 24,
  70: 28,
  80: 32,
  90: 40,
  100: 48,
  full: 9999,
} as const;

/** Type scale. Sizes are natural px values; pair each with its line height. */
export const typography = {
  size: {
    caption: 12,
    footnote: 13,
    body: 16,
    callout: 18,
    title3: 22,
    title2: 28,
    title1: 34,
    display: 44,
  },
  lineHeight: {
    caption: 16,
    footnote: 18,
    body: 24,
    callout: 26,
    title3: 28,
    title2: 34,
    title1: 40,
    display: 50,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  // Positive letter-spacing loosens small caps labels; negative tightens display.
  tracking: {
    tight: -0.5,
    normal: 0,
    label: 2,
  },
} as const;

export type PaletteHue = keyof typeof palette;
export type PaletteStep = keyof (typeof palette)['neutral'];
