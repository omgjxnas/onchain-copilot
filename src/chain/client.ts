import { createPublicClient, http, type PublicClient } from 'viem';

import { robinhoodChain, robinhoodChainTestnet } from './chains';

/**
 * A single read-only viem client pointed at Robinhood Chain.
 *
 * The RPC URL comes from the environment so no key is ever hardcoded. Set
 * EXPO_PUBLIC_RH_RPC_URL (e.g. an Alchemy URL that embeds your key) to override
 * the rate-limited public endpoint. EXPO_PUBLIC_RH_NETWORK picks mainnet vs
 * testnet. See .env.example.
 */

const network = process.env.EXPO_PUBLIC_RH_NETWORK === 'testnet' ? 'testnet' : 'mainnet';
export const activeChain = network === 'testnet' ? robinhoodChainTestnet : robinhoodChain;

export const rpcUrl = process.env.EXPO_PUBLIC_RH_RPC_URL || activeChain.rpcUrls.default.http[0];

export const publicClient: PublicClient = createPublicClient({
  chain: activeChain,
  transport: http(rpcUrl),
});
