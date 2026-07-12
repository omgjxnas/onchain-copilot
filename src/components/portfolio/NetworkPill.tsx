import { StyleSheet, Text, View } from 'react-native';

import type { NetworkStatus } from '../../chain';
import { colors, radius, space, text } from '../../theme';

/** Live network indicator: accent dot + latest block height. */
export function NetworkPill({ status }: { status: NetworkStatus | null }) {
  const live = status !== null;
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: live ? colors.accent : colors.textMuted }]} />
      <Text style={styles.text}>
        {live ? `Live · #${status.blockNumber.toString()}` : 'Connecting…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[30],
    paddingHorizontal: space[50],
    paddingVertical: space[30],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  text: { ...text.footnote, color: colors.textTertiary },
});
