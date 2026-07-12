import { Image, StyleSheet, Text, View } from 'react-native';

import { formatUsd, type TokenBalance } from '../../data';
import { colors, radius, space, text } from '../../theme';

/** ERC-20 holdings list with icon, symbol/name, amount, and USD value. */
export function TokenList({ tokens }: { tokens: TokenBalance[] }) {
  if (tokens.length === 0) {
    return <Text style={styles.empty}>No tokens held by this address.</Text>;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>TOKENS</Text>
      {tokens.map((t) => (
        <View key={t.contract} style={styles.row}>
          <TokenIcon token={t} />
          <View style={styles.nameCol}>
            <Text style={styles.symbol}>{t.symbol}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {t.name}
            </Text>
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.amount}>{t.formatted}</Text>
            {t.usdValue !== null ? <Text style={styles.usd}>{formatUsd(t.usdValue)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function TokenIcon({ token }: { token: TokenBalance }) {
  if (token.iconUrl) {
    return <Image source={{ uri: token.iconUrl }} style={styles.icon} />;
  }
  return (
    <View style={[styles.icon, styles.iconFallback]}>
      <Text style={styles.iconLetter}>{token.symbol.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[40] },
  sectionLabel: { ...text.label, color: colors.textTertiary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[50],
    paddingVertical: space[50],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceRaised },
  iconFallback: { alignItems: 'center', justifyContent: 'center' },
  iconLetter: { ...text.body, color: colors.textSecondary, fontWeight: '700' },
  nameCol: { flex: 1, gap: 2 },
  symbol: { ...text.body, color: colors.textPrimary, fontWeight: '600' },
  name: { ...text.footnote, color: colors.textTertiary },
  valueCol: { alignItems: 'flex-end', gap: 2 },
  amount: { ...text.body, color: colors.textPrimary, fontWeight: '600' },
  usd: { ...text.footnote, color: colors.textTertiary },
  empty: { ...text.footnote },
});
