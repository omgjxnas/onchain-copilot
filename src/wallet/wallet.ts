import {
  createWalletClient,
  http,
  type Account,
  type Hex,
  type WalletClient,
} from 'viem';
import {
  english,
  generateMnemonic,
  mnemonicToAccount,
  privateKeyToAccount,
} from 'viem/accounts';

import { activeChain, rpcUrl } from '../chain';
import type { StoredSecret } from './secureStore';

const VALID_WORD_COUNTS = new Set([12, 15, 18, 21, 24]);

/** Generate a fresh 12-word HD wallet. Returns the mnemonic (show once, then persist). */
export function createWallet(): { mnemonic: string; account: Account } {
  const mnemonic = generateMnemonic(english);
  return { mnemonic, account: mnemonicToAccount(mnemonic) };
}

/** Rebuild an account from a stored secret (called on app start). */
export function accountFromSecret(secret: StoredSecret): Account {
  return secret.kind === 'mnemonic'
    ? mnemonicToAccount(secret.value)
    : privateKeyToAccount(secret.value as Hex);
}

/** Validate + derive an account from a user-supplied seed phrase. */
export function walletFromMnemonic(input: string): { mnemonic: string; account: Account } {
  const mnemonic = input.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!VALID_WORD_COUNTS.has(mnemonic.split(' ').length)) {
    throw new Error('A seed phrase is 12–24 words separated by spaces.');
  }
  try {
    return { mnemonic, account: mnemonicToAccount(mnemonic) };
  } catch {
    throw new Error('That seed phrase is not valid.');
  }
}

/** Validate + derive an account from a user-supplied private key. */
export function walletFromPrivateKey(input: string): { privateKey: Hex; account: Account } {
  const hex = input.trim().toLowerCase();
  const privateKey = (hex.startsWith('0x') ? hex : `0x${hex}`) as Hex;
  if (!/^0x[0-9a-f]{64}$/.test(privateKey)) {
    throw new Error('A private key is 64 hex characters (with or without 0x).');
  }
  try {
    return { privateKey, account: privateKeyToAccount(privateKey) };
  } catch {
    throw new Error('That private key is not valid.');
  }
}

/** A viem wallet client that can sign & submit on the active Robinhood Chain. */
export function walletClientFor(account: Account): WalletClient {
  return createWalletClient({ account, chain: activeChain, transport: http(rpcUrl) });
}
