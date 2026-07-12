/**
 * Intent layer — turns free text into a `{ actionId, raw }` pair for the typed
 * action registry. This is DELIBERATELY a tiny deterministic parser, not an
 * LLM: per the project's hard rules, typed actions + preview + confirm must
 * exist and work before any model is involved.
 *
 * The output shape is exactly what a future LLM function-calling layer will
 * emit, so the model can later replace `parseIntent` without any change to the
 * actions or the UI. Grammar today:
 *   - `balance <0xaddr>` / `check <0xaddr>`      → checkBalance
 *   - `send <amount> <token> to <0xaddr>`        → prepareSend
 */

const ADDR = '0x[0-9a-fA-F]{40}';
const BALANCE_RE = new RegExp(`^(?:balance|check)\\s+(${ADDR})$`, 'i');
const SEND_RE = new RegExp(`^send\\s+([\\d.]+)\\s+([a-zA-Z]+|${ADDR})\\s+to\\s+(${ADDR})$`, 'i');

export type ParsedIntent =
  | { ok: true; actionId: string; raw: Record<string, string> }
  | { ok: false; error: string };

export function parseIntent(input: string): ParsedIntent {
  const text = input.trim().replace(/\s+/g, ' ');
  if (!text) {
    return { ok: false, error: 'Type a command, e.g. "balance 0x…" or "send 0.01 ETH to 0x…".' };
  }

  const balance = text.match(BALANCE_RE);
  if (balance) {
    return { ok: true, actionId: 'checkBalance', raw: { address: balance[1] } };
  }

  const send = text.match(SEND_RE);
  if (send) {
    return {
      ok: true,
      actionId: 'prepareSend',
      raw: { amount: send[1], token: send[2], to: send[3] },
    };
  }

  // Near-miss hints so the (currently narrow) grammar is discoverable.
  const lower = text.toLowerCase();
  if (lower.startsWith('send')) {
    return { ok: false, error: 'Try: send 0.01 ETH to 0x… (amount, token, then a full 0x address).' };
  }
  if (lower.startsWith('balance') || lower.startsWith('check')) {
    return { ok: false, error: 'Try: balance 0x… with a full 0x address.' };
  }
  return {
    ok: false,
    error: `Not sure how to handle "${text}". Try "balance 0x…" or "send 0.01 ETH to 0x…".`,
  };
}
