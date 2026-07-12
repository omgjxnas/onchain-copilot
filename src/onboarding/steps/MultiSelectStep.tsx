import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../../components';
import { colors, radius, space, text } from '../../theme';
import { HELP_OPTIONS } from '../data';
import { StepHeader } from '../StepHeader';

type Props = { value: string[]; onChange: (ids: string[]) => void };

/** Multi-select question — tap chips to toggle any number on/off. */
export function MultiSelectStep({ value, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <View style={styles.wrap}>
      <StepHeader
        eyebrow="THE COPILOT"
        title="What should it help you with?"
        subtitle="Choose as many as you like."
      />
      <View style={styles.chips}>
        {HELP_OPTIONS.map((opt) => {
          const selected = value.includes(opt.id);
          return (
            <Pressable key={opt.id} onPress={() => toggle(opt.id)} accessibilityState={{ selected }}>
              <GlassSurface
                tint={selected ? 'accent' : 'neutral'}
                interactive
                radiusToken={radius.full}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{opt.label}</Text>
              </GlassSurface>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[50],
  },
  chip: {
    paddingHorizontal: space[70],
    paddingVertical: space[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipLabel: { ...text.body, color: colors.textSecondary, fontWeight: '600' },
  chipLabelOn: { color: colors.accentBright },
});
