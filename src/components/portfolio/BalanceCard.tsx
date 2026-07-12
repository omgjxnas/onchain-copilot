import { StyleSheet, Text, View } from 'react-native';

import type { Balance } from '../../chain';
import { formatUsd, shortenAddress } from '../../data';
import { colors, radius, space, text } from '../../theme';
import { GlassSurface } from '../GlassSurface';

/** Accent glass card showing a native ETH balance and its USD value. */
export function BalanceCard({ balance, usd }: { balance: Balance; usd: number | null }) {
  return (
    <GlassSurface tint="accent" radiusToken={radius[50]} style={styles.card}>
      <Text style={styles.label}>BALANCE</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{balance.formatted}</Text>
        <Text style={styles.symbol}>{balance.symbol}</Text>
      </View>
      {usd !== null ? <Text style={styles.usd}>≈ {formatUsd(usd)}</Text> : null}
      <Text style={styles.address}>{shortenAddress(balance.address)}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: { padding: space[80], gap: space[30] },
  label: { ...text.label, color: colors.accent },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space[40] },
  value: { ...text.display, color: colors.textPrimary },
  symbol: { ...text.title2, color: colors.accentBright, marginBottom: space[40] },
  usd: { ...text.callout, color: colors.textSecondary },
  address: { ...text.footnote, color: colors.textTertiary, marginTop: space[20] },
});
