/**
 * Price data from CoinGecko (planned pricing source). No key needed for the
 * free simple-price endpoint. Kept separate from the raw-RPC chain layer.
 */

const COINGECKO = 'https://api.coingecko.com/api/v3';

/** Spot ETH/USD price. Robinhood Chain's native gas token is ETH. */
export async function getEthUsdPrice(): Promise<number> {
  const res = await fetch(`${COINGECKO}/simple/price?ids=ethereum&vs_currencies=usd`);
  if (!res.ok) throw new Error(`Price request failed (${res.status})`);
  const json = (await res.json()) as { ethereum?: { usd?: number } };
  const price = json.ethereum?.usd;
  if (typeof price !== 'number') throw new Error('Unexpected price response.');
  return price;
}
