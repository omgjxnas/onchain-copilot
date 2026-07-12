import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, DotGrid, GlassSurface } from '../components';
import { colors, radius, space, text } from '../theme';

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  glyph: string;
  onClose?: () => void;
};

/** Simple coming-soon scaffold for screens that aren't built out yet. */
export function PlaceholderScreen({ eyebrow, title, body, glyph, onClose }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DotGrid />
      {onClose ? (
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.back}>
            <BackIcon />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.center}>
        <GlassSurface tint="neutral" radiusToken={radius[60]} style={styles.badge}>
          <Text style={styles.glyph}>{glyph}</Text>
        </GlassSurface>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space[70], paddingTop: space[40] },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: -space[40] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[80], gap: space[40] },
  badge: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: space[40] },
  glyph: { fontSize: 32 },
  eyebrow: { ...text.label, color: colors.textTertiary },
  title: { ...text.title1, textAlign: 'center' },
  body: { ...text.body, textAlign: 'center', maxWidth: 300 },
});
