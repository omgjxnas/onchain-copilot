import { StyleSheet, Text, View } from 'react-native';

import { GlassButton } from '../../components';
import { colors, radius, space, text } from '../../theme';
import { GOAL_OPTIONS } from '../data';
import { StepHeader } from '../StepHeader';

type Props = { value?: string; onChange: (id: string) => void };

/** Single-choice question — tap a glass card to select. */
export function ChoiceStep({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <StepHeader
        eyebrow="ABOUT YOU"
        title="What brings you to onchain copilot?"
        subtitle="Pick the one that fits best — you can change this later."
      />
      <View style={styles.list}>
        {GOAL_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <GlassButton
              key={opt.id}
              onPress={() => onChange(opt.id)}
              selected={selected}
              radiusToken={radius[40]}
              style={styles.card}
            >
              <View style={styles.row}>
                <View style={styles.textCol}>
                  <Text style={styles.label}>{opt.label}</Text>
                  {opt.hint ? <Text style={styles.hint}>{opt.hint}</Text> : null}
                </View>
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </View>
            </GlassButton>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  list: { gap: space[50] },
  card: {
    alignItems: 'stretch',
    paddingVertical: space[60],
    paddingHorizontal: space[60],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[50],
  },
  textCol: { flex: 1, gap: 2 },
  label: { ...text.callout, color: colors.textPrimary, fontWeight: '600' },
  hint: { ...text.footnote },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.accent },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
});
