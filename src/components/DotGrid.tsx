import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');
const SPACING = 30;
const COLS = Math.ceil(W / SPACING) + 1;
const ROWS = Math.ceil(H / SPACING) + 1;

/**
 * The signature background: a faint, full-bleed grid of dots. Static and
 * non-interactive — laid out once via a wrapping row of fixed cells.
 */
export function DotGrid() {
  const cells = useMemo(() => Array.from({ length: COLS * ROWS }), []);
  return (
    <View style={styles.fill} pointerEvents="none">
      <View style={styles.wrap}>
        {cells.map((_, i) => (
          <View key={i} style={styles.cell}>
            <View style={styles.dot} />
          </View>
        ))}
      </View>
    </View>
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
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: COLS * SPACING,
  },
  cell: {
    width: SPACING,
    height: SPACING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
    opacity: 0.09,
  },
});
