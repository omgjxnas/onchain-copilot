import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Account } from 'viem';

import { accountFromSecret, createWallet, walletFromMnemonic, walletFromPrivateKey } from './wallet';
import {
  clearVault,
  loadVault,
  saveVault,
  takeLegacySecret,
  type StoredSecret,
  type Vault,
} from './secureStore';

type Status = 'loading' | 'none' | 'ready';

/** Public, secret-free view of a stored wallet. Its id is its address. */
export type WalletMeta = { id: string; label: string; kind: 'mnemonic' | 'privateKey'; address: string };

type WalletContextValue = {
  status: Status;
  wallets: WalletMeta[];
  activeId: string | null;
  /** The active signing account (drives Copilot/actions). */
  account: Account | null;
  address: string | null;
  /** Create a new wallet, make it active; returns the mnemonic for backup. */
  addGenerated: () => Promise<string>;
  addImportedMnemonic: (input: string) => Promise<void>;
  addImportedPrivateKey: (input: string) => Promise<void>;
  select: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Load a wallet's raw secret for the reveal/backup screen. */
  revealSecret: (id: string) => StoredSecret | null;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [vault, setVault] = useState<Vault | null>(null);
  const [accounts, setAccounts] = useState<Record<string, Account>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      let v = await loadVault();
      if (!v) {
        // Migrate a legacy single-wallet secret into the vault.
        const legacy = await takeLegacySecret();
        if (legacy) {
          const acc = accountFromSecret(legacy);
          v = { wallets: [{ id: acc.address, label: 'Wallet 1', ...legacy }], activeId: acc.address };
          await saveVault(v);
        }
      }
      if (!alive) return;
      if (v && v.wallets.length) {
        setAccounts(deriveAccounts(v));
        setVault(v);
        setStatus('ready');
      } else {
        setStatus('none');
      }
    })().catch(() => alive && setStatus('none'));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<WalletContextValue>(() => {
    const wallets: WalletMeta[] =
      vault?.wallets.map((w) => ({ id: w.id, label: w.label, kind: w.kind, address: w.id })) ?? [];
    const activeId = vault?.activeId ?? null;
    const account = activeId ? accounts[activeId] ?? null : null;

    const persist = async (next: Vault, nextAccounts: Record<string, Account>) => {
      await saveVault(next);
      setVault(next);
      setAccounts(nextAccounts);
      setStatus('ready');
    };

    const addWallet = (secret: StoredSecret, acc: Account) => {
      const id = acc.address;
      const existing = vault?.wallets ?? [];
      if (existing.some((w) => w.id === id)) {
        throw new Error('That wallet is already added.');
      }
      const label = `Wallet ${existing.length + 1}`;
      const next: Vault = { wallets: [...existing, { id, label, ...secret }], activeId: id };
      return persist(next, { ...accounts, [id]: acc });
    };

    return {
      status,
      wallets,
      activeId,
      account,
      address: account?.address ?? null,

      addGenerated: async () => {
        const { mnemonic, account: acc } = createWallet();
        await addWallet({ kind: 'mnemonic', value: mnemonic }, acc);
        return mnemonic;
      },
      addImportedMnemonic: async (input) => {
        const { mnemonic, account: acc } = walletFromMnemonic(input);
        await addWallet({ kind: 'mnemonic', value: mnemonic }, acc);
      },
      addImportedPrivateKey: async (input) => {
        const { privateKey, account: acc } = walletFromPrivateKey(input);
        await addWallet({ kind: 'privateKey', value: privateKey }, acc);
      },

      select: async (id) => {
        if (!vault || !vault.wallets.some((w) => w.id === id)) return;
        await persist({ ...vault, activeId: id }, accounts);
      },

      remove: async (id) => {
        if (!vault) return;
        const remaining = vault.wallets.filter((w) => w.id !== id);
        if (remaining.length === 0) {
          await clearVault();
          setVault(null);
          setAccounts({});
          setStatus('none');
          return;
        }
        const nextActive = vault.activeId === id ? remaining[0].id : vault.activeId;
        const nextAccounts = { ...accounts };
        delete nextAccounts[id];
        await persist({ wallets: remaining, activeId: nextActive }, nextAccounts);
      },

      revealSecret: (id) => {
        const w = vault?.wallets.find((x) => x.id === id);
        return w ? { kind: w.kind, value: w.value } : null;
      },
    };
  }, [status, vault, accounts]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

function deriveAccounts(vault: Vault): Record<string, Account> {
  const map: Record<string, Account> = {};
  for (const w of vault.wallets) {
    try {
      map[w.id] = accountFromSecret(w);
    } catch {
      // skip a corrupt entry rather than break the whole vault
    }
  }
  return map;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider.');
  return ctx;
}
