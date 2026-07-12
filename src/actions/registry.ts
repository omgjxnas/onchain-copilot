import { checkBalance } from './checkBalance';
import { prepareSend } from './prepareSend';
import type { ActionDefinition } from './types';

/**
 * Every action the app can perform, keyed by id. The intent parser (and later
 * the LLM) resolves an `actionId` against this registry — new capabilities are
 * added here without touching the parser or UI.
 */
export const ACTIONS: Record<string, ActionDefinition<any>> = {
  [checkBalance.id]: checkBalance,
  [prepareSend.id]: prepareSend,
};

export function getAction(id: string): ActionDefinition<any> | undefined {
  return ACTIONS[id];
}
