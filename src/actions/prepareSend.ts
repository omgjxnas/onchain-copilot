import {
  erc20Abi,
  formatEther,
  getAddress,
  isAddress,
  parseEther,
  parseUnits,
  type Address,
} from 'viem';

import {
  activeChain,
  isNativeToken,
  publicClient,
  resolveToken,
  type KnownToken,
} from '../chain';
import { formatUsd, getEthUsdPrice, shortenAddress, trimDecimals } from '../data';
import { walletClientFor } from '../wallet/wallet';
import type { ActionDefinition, ActionPreview } from './types';

type Params = { amount: string; token: KnownToken; to: Address };

function explorerTx(hash: string): string {
  return `${activeChain.blockExplorers?.default.url}/tx/${hash}`;
}

// Standard gas for a simple transfer — enough for a realistic pre-wallet fee
// estimate. On-chain estimateGas needs a funded sender we don't have yet.
const GAS_NATIVE = 21_000n;
const GAS_ERC20 = 60_000n;

/**
 * Write action: build and preview a token transfer. Stops at the signing
 * boundary — `run` returns `needsWallet` until a wallet is connected. Nothing
 * is ever submitted from here without an explicit confirm + a wallet signature.
 */
export const prepareSend: ActionDefinition<Params> = {
  id: 'prepareSend',
  title: 'Send',
  kind: 'write',

  parse: (raw) => {
    const amount = (raw.amount ?? '').trim();
    if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
      throw new Error('Enter a positive amount to send.');
    }
    const token = resolveToken(raw.token ?? 'ETH');
    if (!token) {
      throw new Error(`Unknown token "${raw.token}". Use ETH, USDG, or a 0x address.`);
    }
    const to = (raw.to ?? '').trim();
    if (!isAddress(to)) throw new Error('Provide a valid 0x recipient address.');
    return { amount, token, to: getAddress(to) };
  },

  buildPreview: async ({ amount, token, to }): Promise<ActionPreview> => {
    // Validate the amount parses at the token's precision (throws on overflow).
    if (isNativeToken(token)) parseEther(amount);
    else parseUnits(amount, token.decimals);
    const feeText = await estimateFeeText(token);
    return {
      title: `Send ${amount} ${token.symbol}`,
      lines: [
        { label: 'Amount', value: `${amount} ${token.symbol}` },
        { label: 'To', value: shortenAddress(to) },
        { label: 'Network', value: activeChain.name },
        { label: 'Est. network fee', value: feeText },
      ],
      note: 'Moves real funds. Nothing is submitted until you confirm here.',
      tone: 'caution',
    };
  },

  run: async ({ amount, token, to }, ctx) => {
    if (!ctx.account) {
      return { type: 'needsWallet', message: 'Generate or import a wallet to sign this transfer.' };
    }
    const client = walletClientFor(ctx.account);
    const hash = isNativeToken(token)
      ? await client.sendTransaction({
          account: ctx.account,
          chain: activeChain,
          to,
          value: parseEther(amount),
        })
      : await client.writeContract({
          account: ctx.account,
          chain: activeChain,
          address: token.address!,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [to, parseUnits(amount, token.decimals)],
        });
    return { type: 'sent', hash, explorerUrl: explorerTx(hash) };
  },
};

/** Live gas price × a standard transfer's gas, shown in ETH and USD. */
async function estimateFeeText(token: KnownToken): Promise<string> {
  try {
    const gasPrice = await publicClient.getGasPrice();
    const gas = isNativeToken(token) ? GAS_NATIVE : GAS_ERC20;
    const feeEth = formatEther(gas * gasPrice);
    const usd = await getEthUsdPrice()
      .then((p) => Number(feeEth) * p)
      .catch(() => null);
    const eth = `~${trimDecimals(feeEth, 8)} ETH`;
    return usd !== null ? `${eth} (${formatUsd(usd)})` : eth;
  } catch {
    return 'unavailable';
  }
}
