import { formatEther, getAddress, isAddress, type Address } from 'viem';

import { activeChain, publicClient } from './client';

/**
 * Typed, single-purpose onchain read actions.
 *
 * Per the project's hard rules these stay small and well-named, and are the
 * ONLY place the app talks to the chain. The UI never builds RPC calls itself.
 */

export type NetworkStatus = {
  chainId: number;
  chainName: string;
  blockNumber: bigint;
  isTestnet: boolean;
};

export type Balance = {
  address: Address;
  wei: bigint;
  /** Human-readable ETH amount, trimmed to a few decimals. */
  formatted: string;
  symbol: string;
};

/** Prove connectivity: resolve the chain id and latest block height. */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  const blockNumber = await publicClient.getBlockNumber();
  return {
    chainId: activeChain.id,
    chainName: activeChain.name,
    blockNumber,
    isTestnet: Boolean(activeChain.testnet),
  };
}

/** Fetch the native ETH balance for an address. Throws on a malformed address. */
export async function getBalance(input: string): Promise<Balance> {
  if (!isAddress(input)) {
    throw new Error('That does not look like a valid 0x address.');
  }
  const address = getAddress(input);
  const wei = await publicClient.getBalance({ address });
  return {
    address,
    wei,
    formatted: trimEther(formatEther(wei)),
    symbol: activeChain.nativeCurrency.symbol,
  };
}

/** Keep at most 6 decimal places, dropping trailing zeros. */
function trimEther(value: string): string {
  if (!value.includes('.')) return value;
  const [whole, frac] = value.split('.');
  const trimmed = frac.slice(0, 6).replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole;
}
