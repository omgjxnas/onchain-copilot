import { getAddress, isAddress, type Address } from 'viem';

/**
 * A small map of well-known Robinhood Chain tokens so the agent can resolve a
 * symbol ("USDG") to a contract without an indexer round-trip. Addresses are
 * from https://docs.robinhood.com/chain/contracts. Not exhaustive — a raw 0x
 * address is always accepted too (see resolveToken).
 */

export const NATIVE_SYMBOL = 'ETH';

export type KnownToken = {
  symbol: string;
  /** null for the native gas token (ETH). */
  address: Address | null;
  decimals: number;
};

export const KNOWN_TOKENS: Record<string, KnownToken> = {
  ETH: { symbol: 'ETH', address: null, decimals: 18 },
  WETH: { symbol: 'WETH', address: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', decimals: 18 },
  USDG: { symbol: 'USDG', address: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', decimals: 6 },
};

/**
 * Resolve a token reference from a command: a known symbol (case-insensitive)
 * or a raw 0x address. Decimals for an unknown address default to 18 and should
 * be confirmed on-chain by the caller when precision matters.
 */
export function resolveToken(ref: string): KnownToken | null {
  const known = KNOWN_TOKENS[ref.trim().toUpperCase()];
  if (known) return known;
  if (isAddress(ref)) {
    return { symbol: 'TOKEN', address: getAddress(ref), decimals: 18 };
  }
  return null;
}

/** True when the token is the native gas token rather than an ERC-20. */
export function isNativeToken(token: KnownToken): boolean {
  return token.address === null;
}
