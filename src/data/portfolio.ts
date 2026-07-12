import { formatUnits, getAddress, isAddress, type Address } from 'viem';

import { activeChain } from '../chain';

/**
 * Token/portfolio data from the chain's Blockscout indexer.
 *
 * The raw JSON-RPC layer can't enumerate which ERC-20s an address holds, so we
 * read that from the explorer's REST API. This lives in the data layer (not
 * chain/) because it's an indexer, not a node call.
 */

export type TokenBalance = {
  contract: Address;
  symbol: string;
  name: string;
  decimals: number;
  amount: bigint;
  /** Human-readable amount, trimmed. */
  formatted: string;
  /** USD value if the indexer has an exchange rate, else null. */
  usdValue: number | null;
  iconUrl: string | null;
};

type BlockscoutToken = {
  token: {
    address_hash: string;
    symbol: string | null;
    name: string | null;
    decimals: string | null;
    exchange_rate: string | null;
    icon_url: string | null;
    type: string;
    reputation: string | null;
  };
  value: string;
};

const explorerBase = activeChain.blockExplorers?.default.url ?? '';

/**
 * ERC-20 balances for an address, richest first. Filters out spam (only
 * reputation "ok") and dust with no symbol.
 */
export async function getTokenBalances(input: string): Promise<TokenBalance[]> {
  if (!isAddress(input)) throw new Error('That does not look like a valid 0x address.');
  const address = getAddress(input);

  const res = await fetch(`${explorerBase}/api/v2/addresses/${address}/token-balances`);
  if (!res.ok) throw new Error(`Token request failed (${res.status})`);
  const rows = (await res.json()) as BlockscoutToken[];

  return rows
    .filter((r) => r.token.type === 'ERC-20' && r.token.symbol && r.token.reputation !== 'scam')
    .map((r) => {
      const decimals = Number(r.token.decimals ?? '18');
      const amount = BigInt(r.value);
      const human = Number(formatUnits(amount, decimals));
      const rate = r.token.exchange_rate ? Number(r.token.exchange_rate) : null;
      return {
        contract: getAddress(r.token.address_hash),
        symbol: r.token.symbol as string,
        name: r.token.name ?? (r.token.symbol as string),
        decimals,
        amount,
        formatted: trimAmount(human),
        usdValue: rate !== null ? human * rate : null,
        iconUrl: r.token.icon_url ?? null,
      } satisfies TokenBalance;
    })
    .filter((t) => t.amount > 0n)
    .sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));
}

function trimAmount(n: number): string {
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  const decimals = n >= 1000 ? 2 : n >= 1 ? 4 : 6;
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}
