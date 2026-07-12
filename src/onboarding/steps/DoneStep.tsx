import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../../components';
import { colors, radius, space, text } from '../../theme';

type Props = {
  goalLabel?: string;
  levelLabel: string;
  helpCount: number;
};

/** Closing screen — recaps the answers the user gave. */
export function DoneStep({ goalLabel, levelLabel, helpCount }: Props) {
  return (
    <View style={styles.center}>
      <GlassSurface tint="accent" radiusToken={radius.full} style={styles.check}>
        <Text style={styles.checkMark}>✓</Text>
      </GlassSurface>

      <Text style={styles.title}>You're all set</Text>
      <Text style={styles.body}>Here's what the copilot will keep in mind.</Text>

      <View style={styles.recap}>
        <Recap label="Focus" value={goalLabel ?? '—'} />
        <Recap label="Level" value={levelLabel} />
        <Recap label="Helping with" value={`${helpCount} area${helpCount === 1 ? '' : 's'}`} />
      </View>
    </View>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.recapRow}>
      <Text style={styles.recapLabel}>{label}</Text>
      <Text style={styles.recapValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: space[50],
  },
  check: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 32,
    color: colors.accentBright,
    fontWeight: '800',
  },
  title: { ...text.title1, marginTop: space[30] },
  body: { ...text.body },
  recap: {
    marginTop: space[50],
    gap: space[30],
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[50],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  recapLabel: { ...text.footnote, color: colors.textTertiary },
  recapValue: { ...text.body, color: colors.textPrimary, fontWeight: '600' },
});
