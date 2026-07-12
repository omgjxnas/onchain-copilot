import { formatEther, getAddress, isAddress, type Address } from 'viem';

import { activeChain, getBalance } from '../chain';
import { getEthUsdPrice, getTokenBalances, shortenAddress } from '../data';
import type { ActionDefinition } from './types';

type Params = { address: Address };

/** Read action: fetch the ETH balance + token portfolio for an address. */
export const checkBalance: ActionDefinition<Params> = {
  id: 'checkBalance',
  title: 'Check balance',
  kind: 'read',

  parse: (raw) => {
    const a = (raw.address ?? '').trim();
    if (!isAddress(a)) throw new Error('Provide a valid 0x address to check.');
    return { address: getAddress(a) };
  },

  buildPreview: async ({ address }) => ({
    title: 'Check balance',
    lines: [
      { label: 'Address', value: shortenAddress(address) },
      { label: 'Network', value: activeChain.name },
    ],
    tone: 'neutral',
  }),

  run: async ({ address }) => {
    const [balance, price, tokens] = await Promise.all([
      getBalance(address),
      getEthUsdPrice().catch(() => null),
      getTokenBalances(address).catch(() => []),
    ]);
    // usd is the dollar value of the balance, not the ETH price.
    const usd = price !== null ? Number(formatEther(balance.wei)) * price : null;
    return { type: 'portfolio', balance, usd, tokens };
  },
};
