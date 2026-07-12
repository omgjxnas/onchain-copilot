/** Static content for the onboarding questionnaire / demo. */

export type Option = { id: string; label: string; hint?: string };

export const GOAL_OPTIONS: Option[] = [
  { id: 'swap', label: 'Swap & trade tokens', hint: 'USDC, ETH, and more' },
  { id: 'portfolio', label: 'Track my portfolio', hint: 'Balances at a glance' },
  { id: 'stocks', label: 'Tokenized stocks', hint: 'Hold AAPL, TSLA onchain' },
  { id: 'explore', label: 'Just exploring', hint: 'Show me around' },
];

export const HELP_OPTIONS: Option[] = [
  { id: 'swaps', label: 'Swaps' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'prices', label: 'Live prices' },
  { id: 'alerts', label: 'Alerts' },
];

/** Levels for the drag-to-rate step, low → high. */
export const LEVELS = ['Curious', 'Beginner', 'Comfortable', 'Pro'] as const;
export type Level = (typeof LEVELS)[number];

/** Swipeable trust cards — the app's safety promises. */
export const PROMISE_CARDS = [
  { id: 'preview', title: 'Every action is previewed', body: 'You see exactly what will happen before it runs.' },
  { id: 'confirm', title: 'You are always in control', body: 'Nothing is signed or sent without your explicit confirmation.' },
  { id: 'smooth', title: 'No signature fatigue', body: 'Session keys and sponsored gas keep the flow smooth.' },
];
