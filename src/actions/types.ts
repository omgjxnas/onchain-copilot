import type { Account, Hash } from 'viem';

import type { Balance } from '../chain';
import type { TokenBalance } from '../data';

/**
 * The typed action layer — the clear, typed boundary between "intent" (what the
 * user asked for) and "execution" (what actually touches the chain).
 *
 * Hard rule: the natural-language / parsing layer only ever produces a
 * `{ actionId, raw }` pair; it never builds transactions. An action's `run` is
 * called ONLY after the user confirms the preview.
 */

export type ActionKind = 'read' | 'write';

/** A human-readable, side-effect-free description of what an action will do. */
export type ActionPreview = {
  title: string;
  lines: { label: string; value: string }[];
  note?: string;
  /** 'caution' for anything that would move funds. */
  tone: 'neutral' | 'caution';
};

export type PortfolioResult = {
  type: 'portfolio';
  balance: Balance;
  usd: number | null;
  tokens: TokenBalance[];
};

/** A transfer that needs a wallet before it can be signed/submitted. */
export type NeedsWalletResult = { type: 'needsWallet'; message: string };

/** A transaction that was signed and broadcast. */
export type SentResult = { type: 'sent'; hash: Hash; explorerUrl: string };

export type MessageResult = { type: 'message'; text: string };

export type ActionResult = PortfolioResult | NeedsWalletResult | SentResult | MessageResult;

/** Runtime context available to an action's `run` (e.g. the signing account). */
export type ActionContext = { account?: Account | null };

export interface ActionDefinition<P> {
  id: string;
  title: string;
  kind: ActionKind;
  /** Validate & shape raw parsed params; throws with a user-facing message on bad input. */
  parse: (raw: Record<string, string>) => P;
  /** Read-only preview built before any confirmation. Never mutates state. */
  buildPreview: (params: P) => Promise<ActionPreview>;
  /** Executed ONLY after explicit user confirmation. */
  run: (params: P, ctx: ActionContext) => Promise<ActionResult>;
}
