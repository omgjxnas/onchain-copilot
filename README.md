# onchain-copilot

AI agentic mobile app for onchain finance on Robinhood Chain, controlled via natural language.

## Idea

Instead of tapping through menus, the user talks (or types) to an agent, for example "swap 100 USDC for ETH" or "show my tokenized AAPL position". The agent turns that into a structured, previewed onchain action that the user must explicitly confirm before anything is signed or sent.

## Status

Early concept / pre-alpha. Nothing is implemented yet, this repo currently just captures the plan.

## Planned tech stack

App shell: React Native (Expo) with TypeScript, shared codebase so an Android build can follow later.

Chain interaction: viem and ethers.js against Robinhood Chain, an EVM-compatible L2 built on Arbitrum technology.

Wallet: account abstraction (ERC-4337) via Alchemy Account Kit, using session keys and sponsored gas for smoother agent-driven UX.

Agent layer: LLM function-calling that maps natural language to a fixed set of typed onchain actions, never freeform transaction generation.

Wallet connect: WalletConnect for linking external wallets.

Portfolio and data: Zerion Wallet Data API and CoinGecko for pricing.

Safety: every agent action renders a human-readable preview and requires explicit user confirmation before submission.

## Disclaimer

Nothing here is financial advice, and this is a personal side project, not an official Robinhood product.
