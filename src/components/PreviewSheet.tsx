import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ActionKind, ActionPreview } from '../actions';
import { colors, radius, space, text } from '../theme';
import { GlassButton } from './GlassButton';
import { GlassSurface } from './GlassSurface';

type Props = {
  visible: boolean;
  preview: ActionPreview | null;
  kind: ActionKind;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * The mandatory confirmation gate: shows a typed, human-readable preview of an
 * action and requires an explicit Confirm before it runs. Cautions (anything
 * that moves funds) are visually flagged.
 */
export function PreviewSheet({ visible, preview, kind, busy, onConfirm, onCancel }: Props) {
  const caution = preview?.tone === 'caution';
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onCancel} />
      <SafeAreaView style={styles.sheetWrap} edges={['bottom']} pointerEvents="box-none">
        <GlassSurface tint="neutral" radiusToken={radius[60]} style={styles.sheet}>
          <View style={styles.grabber} />
          {preview ? (
            <>
              <Text style={styles.eyebrow}>{caution ? 'CONFIRM ACTION' : 'PREVIEW'}</Text>
              <Text style={styles.title}>{preview.title}</Text>

              <View style={styles.lines}>
                {preview.lines.map((line) => (
                  <View key={line.label} style={styles.lineRow}>
                    <Text style={styles.lineLabel}>{line.label}</Text>
                    <Text style={styles.lineValue}>{line.value}</Text>
                  </View>
                ))}
              </View>

              {preview.note ? (
                <Text style={[styles.note, caution && styles.noteCaution]}>{preview.note}</Text>
              ) : null}

              <View style={styles.actions}>
                <View style={styles.actionCol}>
                  <GlassButton
                    label="Cancel"
                    onPress={onCancel}
                    disabled={busy}
                    radiusToken={radius.full}
                  />
                </View>
                <View style={styles.actionCol}>
                  <GlassButton
                    variant="primary"
                    label={busy ? 'Working…' : kind === 'write' ? 'Confirm' : 'Run'}
                    onPress={onConfirm}
                    disabled={busy}
                    radiusToken={radius.full}
                  />
                </View>
              </View>
              {busy ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
            </>
          ) : null}
        </GlassSurface>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: space[80], paddingTop: space[50], gap: space[40], margin: space[40] },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
    marginBottom: space[40],
  },
  eyebrow: { ...text.label, color: colors.textTertiary },
  title: { ...text.title2 },
  lines: { marginTop: space[30], gap: space[10] },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[40],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: space[50],
  },
  lineLabel: { ...text.footnote, color: colors.textTertiary },
  lineValue: { ...text.body, color: colors.textPrimary, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  note: { ...text.footnote, color: colors.textSecondary, marginTop: space[30] },
  noteCaution: { color: colors.accentBright },
  actions: { flexDirection: 'row', gap: space[50], marginTop: space[50] },
  actionCol: { flex: 1 },
  spinner: { marginTop: space[40] },
});
