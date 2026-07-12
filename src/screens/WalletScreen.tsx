import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatEther } from 'viem';

import { BackIcon, BalanceCard, DotGrid, GlassButton, GlassSurface, TokenList } from '../components';
import { getBalance, type Balance } from '../chain';
import { getEthUsdPrice, getTokenBalances, shortenAddress, type TokenBalance } from '../data';
import { useWallet, type StoredSecret, type WalletMeta } from '../wallet';
import { colors, fonts, radius, space, text } from '../theme';

export function WalletScreen({ onClose }: { onClose?: () => void }) {
  const wallet = useWallet();
  const insets = useSafeAreaInsets();
  const [secretSheet, setSecretSheet] = useState<StoredSecret | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const mnemonic = await wallet.addGenerated();
      setSecretSheet({ kind: 'mnemonic', value: mnemonic });
    } catch (e) {
      Alert.alert('Could not create wallet', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const revealActive = () => {
    if (!wallet.activeId) return;
    const secret = wallet.revealSecret(wallet.activeId);
    if (secret) setSecretSheet(secret);
  };

  const removeActive = () => {
    if (!wallet.activeId) return;
    Alert.alert('Remove this wallet?', 'Make sure its recovery phrase is backed up. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => wallet.remove(wallet.activeId!) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DotGrid />
      <View style={styles.header}>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={10} style={styles.back}>
            <BackIcon />
          </Pressable>
        ) : null}
        <Text style={styles.brand}>Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space[80] }]}
        keyboardShouldPersistTaps="handled"
      >
        {wallet.status === 'loading' ? (
          <ActivityIndicator color={colors.accent} style={styles.spinner} />
        ) : wallet.status === 'none' ? (
          <NoWallet onGenerate={generate} onImport={() => setImportOpen(true)} busy={busy} />
        ) : (
          <>
            {wallet.address ? <ActiveWallet address={wallet.address} /> : null}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>WALLETS · {wallet.wallets.length}</Text>
              {wallet.wallets.map((w, i) => (
                <WalletRow
                  key={w.id}
                  wallet={w}
                  index={i + 1}
                  active={w.id === wallet.activeId}
                  onSelect={() => wallet.select(w.id)}
                />
              ))}
            </View>

            <View style={styles.addRow}>
              <View style={styles.actionCol}>
                <GlassButton variant="primary" label={busy ? 'Creating…' : 'Generate'} onPress={generate} disabled={busy} />
              </View>
              <View style={styles.actionCol}>
                <GlassButton label="Import" onPress={() => setImportOpen(true)} disabled={busy} />
              </View>
            </View>

            <View style={styles.manage}>
              <GlassButton label="Reveal recovery phrase" onPress={revealActive} />
              <GlassButton label="Remove active wallet" onPress={removeActive} textStyle={styles.dangerText} />
            </View>
          </>
        )}
      </ScrollView>

      <SecretSheet secret={secretSheet} onClose={() => setSecretSheet(null)} />
      <ImportSheet
        visible={importOpen}
        onClose={() => setImportOpen(false)}
        onImportMnemonic={wallet.addImportedMnemonic}
        onImportPrivateKey={wallet.addImportedPrivateKey}
      />
    </SafeAreaView>
  );
}

function NoWallet({ onGenerate, onImport, busy }: { onGenerate: () => void; onImport: () => void; busy: boolean }) {
  return (
    <View style={styles.noWallet}>
      <GlassSurface tint="neutral" radiusToken={radius[60]} style={styles.badge}>
        <Text style={styles.badgeGlyph}>👛</Text>
      </GlassSurface>
      <Text style={styles.title}>Set up a wallet</Text>
      <Text style={styles.subtitle}>
        Create a new wallet on Robinhood Chain, or import one you already have. The key is stored
        only in this device's Keychain.
      </Text>
      <View style={styles.addRow}>
        <View style={styles.actionCol}>
          <GlassButton variant="primary" label={busy ? 'Creating…' : 'Generate'} onPress={onGenerate} disabled={busy} />
        </View>
        <View style={styles.actionCol}>
          <GlassButton label="Import" onPress={onImport} disabled={busy} />
        </View>
      </View>
    </View>
  );
}

function ActiveWallet({ address }: { address: string }) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [usd, setUsd] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[] | null>(null);

  useEffect(() => {
    let alive = true;
    setBalance(null);
    setTokens(null);
    getBalance(address).then((b) => alive && setBalance(b)).catch(() => {});
    getEthUsdPrice().then((p) => alive && setUsd(p)).catch(() => {});
    getTokenBalances(address).then((t) => alive && setTokens(t)).catch(() => alive && setTokens([]));
    return () => {
      alive = false;
    };
  }, [address]);

  const usdValue = balance && usd !== null ? Number(formatEther(balance.wei)) * usd : null;

  return (
    <View style={styles.active}>
      <Pressable onPress={() => Clipboard.setStringAsync(address)}>
        <Text style={styles.copyHint}>ACTIVE · TAP ADDRESS TO COPY</Text>
      </Pressable>
      {balance ? <BalanceCard balance={balance} usd={usdValue} /> : <ActivityIndicator color={colors.accent} />}
      {tokens && tokens.length ? <TokenList tokens={tokens} /> : null}
    </View>
  );
}

function WalletRow({
  wallet,
  index,
  active,
  onSelect,
}: {
  wallet: WalletMeta;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect}>
      <GlassSurface
        tint={active ? 'accent' : 'neutral'}
        radiusToken={radius[40]}
        style={[styles.row, active && styles.rowActive]}
      >
        <Text style={styles.rowIndex}>{String(index).padStart(2, '0')}</Text>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>{wallet.label}</Text>
          <Text style={styles.rowAddress}>{shortenAddress(wallet.address)}</Text>
        </View>
        <View style={[styles.dot, active && styles.dotActive]} />
      </GlassSurface>
    </Pressable>
  );
}

function SecretSheet({ secret, onClose }: { secret: StoredSecret | null; onClose: () => void }) {
  const isMnemonic = secret?.kind === 'mnemonic';
  const words = isMnemonic ? secret!.value.split(' ') : [];
  return (
    <Modal visible={secret !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheetWrap} edges={['bottom']} pointerEvents="box-none">
        <GlassSurface tint="neutral" radiusToken={radius[60]} style={styles.sheet}>
          <Text style={styles.warnLabel}>KEEP THIS SECRET</Text>
          <Text style={styles.sheetTitle}>{isMnemonic ? 'Recovery phrase' : 'Private key'}</Text>
          <Text style={styles.sheetBody}>
            Anyone with this can take your funds. Write it down and store it offline — never share it.
          </Text>
          {isMnemonic ? (
            <View style={styles.wordGrid}>
              {words.map((w, i) => (
                <View key={`${w}-${i}`} style={styles.word}>
                  <Text style={styles.wordIndex}>{i + 1}</Text>
                  <Text style={styles.wordText}>{w}</Text>
                </View>
              ))}
            </View>
          ) : (
            <GlassSurface tint="neutral" radiusToken={radius[30]} style={styles.keyBox}>
              <Text style={styles.keyText}>{secret?.value}</Text>
            </GlassSurface>
          )}
          <View style={styles.addRow}>
            <View style={styles.actionCol}>
              <GlassButton label="Copy" onPress={() => secret && Clipboard.setStringAsync(secret.value)} />
            </View>
            <View style={styles.actionCol}>
              <GlassButton variant="primary" label="I've saved it" onPress={onClose} />
            </View>
          </View>
        </GlassSurface>
      </SafeAreaView>
    </Modal>
  );
}

function ImportSheet({
  visible,
  onClose,
  onImportMnemonic,
  onImportPrivateKey,
}: {
  visible: boolean;
  onClose: () => void;
  onImportMnemonic: (v: string) => Promise<void>;
  onImportPrivateKey: (v: string) => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    const input = value.trim();
    setError(null);
    setBusy(true);
    try {
      if (/^(0x)?[0-9a-fA-F]{64}$/.test(input)) {
        await onImportPrivateKey(input);
      } else {
        await onImportMnemonic(input);
      }
      setValue('');
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }, [value, onImportMnemonic, onImportPrivateKey, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onClose} />
      <SafeAreaView style={styles.sheetWrap} edges={['bottom']} pointerEvents="box-none">
        <GlassSurface tint="neutral" radiusToken={radius[60]} style={styles.sheet}>
          <Text style={styles.warnLabel}>IMPORT</Text>
          <Text style={styles.sheetTitle}>Seed phrase or private key</Text>
          <GlassSurface tint="neutral" radiusToken={radius[30]} style={styles.importBox}>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="12–24 words, or a 0x private key"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline
              style={styles.importInput}
            />
          </GlassSurface>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.addRow}>
            <View style={styles.actionCol}>
              <GlassButton label="Cancel" onPress={onClose} disabled={busy} />
            </View>
            <View style={styles.actionCol}>
              <GlassButton
                variant="primary"
                label={busy ? 'Importing…' : 'Import'}
                onPress={submit}
                disabled={busy || value.trim().length === 0}
              />
            </View>
          </View>
        </GlassSurface>
      </SafeAreaView>
    </Modal>
  );
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[50],
    paddingHorizontal: space[70],
    paddingTop: space[40],
    paddingBottom: space[40],
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: -space[40] },
  brand: { ...text.title2 },
  content: { paddingHorizontal: space[70], paddingBottom: space[100], gap: space[50] },
  spinner: { marginTop: space[90] },

  noWallet: { alignItems: 'center', gap: space[40], paddingTop: space[90] },
  badge: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: space[40] },
  badgeGlyph: { fontSize: 32 },
  title: { ...text.title1, textAlign: 'center' },
  subtitle: { ...text.body, textAlign: 'center', maxWidth: 320 },

  active: { gap: space[40] },
  copyHint: { ...text.label, color: colors.textTertiary },

  section: { gap: space[40], marginTop: space[30] },
  sectionLabel: { ...text.label, color: colors.textTertiary },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[50], padding: space[60] },
  rowActive: { borderWidth: 1, borderColor: colors.accent },
  rowIndex: { fontFamily: fonts.mono, fontSize: text.footnote.fontSize, color: colors.textTertiary },
  rowInfo: { flex: 1, gap: 2 },
  rowLabel: { ...text.body, color: colors.textPrimary, fontWeight: '600' },
  rowAddress: { ...text.footnote, color: colors.textTertiary },
  dot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.borderStrong },
  dotActive: { backgroundColor: colors.accent },

  addRow: { flexDirection: 'row', gap: space[50], marginTop: space[40], alignSelf: 'stretch' },
  actionCol: { flex: 1 },
  manage: { gap: space[40], marginTop: space[40] },
  dangerText: { color: '#F87171' },

  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: space[80], gap: space[40], margin: space[40] },
  warnLabel: { ...text.label, color: colors.accent },
  sheetTitle: { ...text.title2 },
  sheetBody: { ...text.footnote, color: colors.textSecondary },
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[40], marginTop: space[30] },
  word: { flexDirection: 'row', alignItems: 'baseline', gap: space[30], width: '30%', paddingVertical: space[40] },
  wordIndex: { ...text.footnote, color: colors.textMuted },
  wordText: { fontFamily: fonts.mono, fontSize: text.body.fontSize, color: colors.textPrimary, fontWeight: '600' },
  keyBox: { padding: space[50], marginTop: space[30] },
  keyText: { fontFamily: fonts.mono, fontSize: text.footnote.fontSize, color: colors.textPrimary },
  importBox: { paddingHorizontal: space[50], marginTop: space[30] },
  importInput: { minHeight: 88, color: colors.textPrimary, fontSize: text.body.fontSize, fontFamily: fonts.mono, paddingVertical: space[50] },
  errorText: { ...text.footnote, color: '#F87171' },
});
