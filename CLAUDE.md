# Context for Claude Code

This file exists so an AI coding agent opening this repo has enough context to start productively, without the human having to re-explain the project from scratch.

## What this project is

onchain-copilot is a mobile app idea: an AI agent that lets a user manage onchain finance on Robinhood Chain through natural language, for example "swap 100 USDC for ETH" or "show my tokenized AAPL position". The agent turns natural language into a structured, typed action, shows the user a clear preview, and only submits it onchain after explicit confirmation.

## Current state

This is a brand new, pre-alpha repo. Only README.md and this file exist so far. Nothing has been scaffolded or implemented yet, so there is no existing code style or architecture to preserve, you are starting from a blank slate.

## Planned tech stack

App shell: React Native with Expo, TypeScript, so an Android build can follow the iOS one later without a rewrite.

Chain interaction: viem (preferred) or ethers.js against Robinhood Chain, an EVM-compatible Layer-2 built on Arbitrum technology, docs at docs.robinhood.com/chain.

Wallet and accounts: ERC-4337 account abstraction via Alchemy Account Kit, using session keys and sponsored gas so the agent flow does not require a manual signature for every single step.

Agent layer: an LLM using function-calling / tool-calling that maps free text to a small, fixed set of typed onchain actions. The LLM should never generate or submit raw transactions directly from free text.

Wallet connect: WalletConnect for linking a user's existing external wallet.

Data: Zerion Wallet Data API for balances and portfolio, CoinGecko for pricing.

## Hard rules for this codebase

Never let the agent submit a transaction without a typed, previewed action and an explicit user confirmation step in the UI. Keep the natural-language/intent-parsing layer strictly separate from the code that actually builds and submits transactions, with a clear, typed interface between them. Do not hardcode API keys, RPC URLs with embedded keys, or private keys anywhere in source, use environment variables and commit a .env.example instead. Prefer small, typed, well-named functions for each onchain action (for example getBalance, quoteSwap, executeSwap) over one big generic "do anything" handler.

## Suggested first milestones

Scaffold the Expo + TypeScript app and get a blank screen running on a simulator. Add a minimal chat-style input screen with no real logic yet, just UI. Wire up a viem client pointed at Robinhood Chain's public RPC and fetch a real balance to prove connectivity. Add WalletConnect so a real wallet can connect. Implement two or three simple typed actions end to end (for example getBalance and quoteSwap) with a preview component, before touching the LLM layer at all. Only after that, add the LLM function-calling layer on top of the already-working typed actions.

## Useful reference

Robinhood Chain developer docs: https://docs.robinhood.com/chain/
