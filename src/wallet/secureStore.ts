import * as SecureStore from 'expo-secure-store';

/**
 * The wallet vault (all secrets + which one is active) lives ONLY in the iOS
 * Keychain — never in the JS bundle, a log, or over the network.
 */

const VAULT_KEY = 'oc.wallet.vault.v2';
const LEGACY_KEY = 'oc.wallet.secret.v1'; // single-wallet format we migrate from

/** One kind of secret: a seed phrase or a raw private key. */
export type StoredSecret = { kind: 'mnemonic' | 'privateKey'; value: string };

/** A stored wallet — its id is its address. */
export type StoredWallet = StoredSecret & { id: string; label: string };

export type Vault = { wallets: StoredWallet[]; activeId: string | null };

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function saveVault(vault: Vault): Promise<void> {
  await SecureStore.setItemAsync(VAULT_KEY, JSON.stringify(vault), options);
}

export async function loadVault(): Promise<Vault | null> {
  const raw = await SecureStore.getItemAsync(VAULT_KEY, options);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Vault;
    return Array.isArray(parsed.wallets) ? parsed : null;
  } catch {
    return null;
  }
}

/** Read (and clear) a legacy single-wallet secret, if any, for migration. */
export async function takeLegacySecret(): Promise<StoredSecret | null> {
  const raw = await SecureStore.getItemAsync(LEGACY_KEY, options);
  if (!raw) return null;
  await SecureStore.deleteItemAsync(LEGACY_KEY, options);
  try {
    const parsed = JSON.parse(raw) as StoredSecret;
    return parsed.kind && parsed.value ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearVault(): Promise<void> {
  await SecureStore.deleteItemAsync(VAULT_KEY, options);
  await SecureStore.deleteItemAsync(LEGACY_KEY, options);
}
