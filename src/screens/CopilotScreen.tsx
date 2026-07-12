import { type ReactNode, useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BalanceCard,
  Blob,
  DotGrid,
  GlassSurface,
  PreviewSheet,
  TokenList,
} from '../components';
import { getAction, type ActionDefinition, type ActionPreview, type ActionResult } from '../actions';
import { parseIntent } from '../agent';
import { shortenAddress } from '../data';
import { useWallet } from '../wallet';
import { colors, fonts, radius, space, text } from '../theme';

type NewMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; result: ActionResult }
  | { role: 'assistant'; text: string };
type Message = NewMessage & { id: number };

type Pending = { action: ActionDefinition<unknown>; params: unknown; preview: ActionPreview };

type Props = { headerLeft?: ReactNode; headerRight?: ReactNode };

export function CopilotScreen({ headerLeft, headerRight }: Props) {
  const { account } = useWallet();
  const insets = useSafeAreaInsets();
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const idRef = useRef(1);
  const scrollRef = useRef<ScrollView>(null);

  const push = (m: NewMessage) => {
    setMessages((prev) => [...prev, { ...m, id: idRef.current++ }]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const submit = useCallback(async () => {
    const value = command.trim();
    if (!value) return;
    setCommand('');
    push({ role: 'user', text: value });

    const parsed = parseIntent(value);
    if (!parsed.ok) {
      push({ role: 'assistant', text: parsed.error });
      return;
    }
    const action = getAction(parsed.actionId) as ActionDefinition<unknown> | undefined;
    if (!action) {
      push({ role: 'assistant', text: 'That action is not available yet.' });
      return;
    }
    let params: unknown;
    try {
      params = action.parse(parsed.raw);
    } catch (e) {
      push({ role: 'assistant', text: e instanceof Error ? e.message : 'Could not read that command.' });
      return;
    }
    setBusy(true);
    try {
      const preview = await action.buildPreview(params);
      setPending({ action, params, preview });
    } catch (e) {
      push({ role: 'assistant', text: e instanceof Error ? e.message : 'Could not build a preview.' });
    } finally {
      setBusy(false);
    }
  }, [command]);

  const confirm = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const result = await pending.action.run(pending.params, { account });
      push({ role: 'assistant', result });
      setPending(null);
    } catch (e) {
      push({ role: 'assistant', text: e instanceof Error ? e.message : 'The action failed.' });
      setPending(null);
    } finally {
      setBusy(false);
    }
  }, [pending, account]);

  const empty = messages.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DotGrid />
      <View style={styles.header}>
        <View style={styles.headerSlot}>{headerLeft}</View>
        <View style={styles.headerSlot}>{headerRight}</View>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        {empty ? (
          <View style={styles.hero}>
            <Blob size={128} />
            <Text style={styles.headline}>onchain copilot</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.transcript}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) => (
              <MessageView key={m.id} message={m} />
            ))}
          </ScrollView>
        )}

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + space[40] }]}>
          <GlassSurface radiusToken={radius.full} style={styles.inputWrap}>
            <TextInput
              value={command}
              onChangeText={setCommand}
              placeholder="Ask anything… e.g. send 0.01 ETH to 0x…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="send"
              onSubmitEditing={submit}
              style={styles.input}
            />
          </GlassSurface>
          <Pressable
            onPress={submit}
            disabled={busy || command.trim().length === 0}
            style={[styles.send, (busy || command.trim().length === 0) && styles.sendOff]}
          >
            <Text style={styles.sendArrow}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <PreviewSheet
        visible={pending !== null}
        preview={pending?.preview ?? null}
        kind={pending?.action.kind ?? 'read'}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </SafeAreaView>
  );
}

function MessageView({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <Animated.View entering={FadeInUp.duration(220)} style={styles.userRow}>
        <GlassSurface radiusToken={radius[40]} style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </GlassSurface>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={FadeInUp.duration(260)} style={styles.assistantRow}>
      {'text' in message ? (
        <GlassSurface radiusToken={radius[40]} style={styles.assistantBubble}>
          <Text style={styles.assistantText}>{message.text}</Text>
        </GlassSurface>
      ) : (
        <ResultView result={message.result} />
      )}
    </Animated.View>
  );
}

function ResultView({ result }: { result: ActionResult }) {
  if (result.type === 'portfolio') {
    return (
      <View style={styles.result}>
        <BalanceCard balance={result.balance} usd={result.usd} />
        <TokenList tokens={result.tokens} />
      </View>
    );
  }
  if (result.type === 'needsWallet') {
    return (
      <GlassSurface tint="accent" radiusToken={radius[50]} style={styles.card}>
        <Text style={styles.cardTitle}>Wallet required</Text>
        <Text style={styles.cardBody}>{result.message}</Text>
        <Text style={styles.cardHint}>Open the Wallet tab to generate or import one.</Text>
      </GlassSurface>
    );
  }
  if (result.type === 'sent') {
    return (
      <GlassSurface tint="accent" radiusToken={radius[50]} style={styles.card}>
        <Text style={styles.cardTitle}>Sent ✓</Text>
        <Text style={styles.cardBody}>Transaction submitted to Robinhood Chain.</Text>
        <Text style={styles.txHash}>{shortenAddress(result.hash)}</Text>
        <Pressable onPress={() => Linking.openURL(result.explorerUrl)}>
          <Text style={styles.cardHint}>View on explorer ↗</Text>
        </Pressable>
      </GlassSurface>
    );
  }
  return (
    <GlassSurface radiusToken={radius[40]} style={styles.assistantBubble}>
      <Text style={styles.assistantText}>{result.text}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[70],
    paddingTop: space[30],
    paddingBottom: space[20],
  },
  headerSlot: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[70] },
  headline: { ...text.title1, fontSize: 40, textAlign: 'center' },

  transcript: { paddingHorizontal: space[70], paddingTop: space[60], paddingBottom: space[60], gap: space[50] },
  userRow: { alignItems: 'flex-end' },
  userBubble: { paddingHorizontal: space[60], paddingVertical: space[50], maxWidth: '85%' },
  userText: { fontFamily: fonts.mono, fontSize: text.footnote.fontSize, color: colors.textPrimary },
  assistantRow: { alignItems: 'flex-start' },
  assistantBubble: { paddingHorizontal: space[60], paddingVertical: space[50], maxWidth: '92%' },
  assistantText: { ...text.body, color: colors.textSecondary },
  result: { gap: space[50], alignSelf: 'stretch' },
  card: { padding: space[70], gap: space[40], alignSelf: 'stretch' },
  cardTitle: { ...text.title2 },
  cardBody: { ...text.body, color: colors.textSecondary },
  cardHint: { ...text.label, color: colors.accentBright },
  txHash: { ...text.footnote, color: colors.textTertiary },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[40],
    paddingHorizontal: space[60],
    paddingTop: space[40],
    paddingBottom: space[40],
  },
  inputWrap: { flex: 1, paddingHorizontal: space[60] },
  input: { height: 52, color: colors.textPrimary, fontSize: text.body.fontSize },
  send: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: { opacity: 0.4 },
  sendArrow: { fontSize: 24, fontWeight: '800', color: colors.bg, marginTop: -2 },
});
