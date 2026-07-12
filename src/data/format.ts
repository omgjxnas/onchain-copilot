/** Format a USD amount as $1,234.56. */
export function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 0x1234…abcd — a compact, glanceable address. */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Trim a decimal string to at most `max` fraction digits, dropping trailing zeros. */
export function trimDecimals(value: string, max = 6): string {
  if (!value.includes('.')) return value;
  const [whole, frac] = value.split('.');
  const trimmed = frac.slice(0, max).replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole;
}
