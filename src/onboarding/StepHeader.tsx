import { StyleSheet, Text, View } from 'react-native';

import { space, text } from '../theme';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

/** Shared question header: small accent eyebrow, title, optional subtitle. */
export function StepHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space[40],
    marginBottom: space[80],
  },
  eyebrow: {
    ...text.label,
  },
  title: {
    ...text.title2,
  },
  subtitle: {
    ...text.body,
  },
});
