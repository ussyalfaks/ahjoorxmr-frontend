![CI](https://github.com/ussyalfaks/ahjoorxmr-frontend/actions/workflows/ci.yml/badge.svg)

# Ahjoor Frontend

**Ahjoor** is a trustless community savings (ajo/esusu-style) platform built with transparency in mind. This repository contains the frontend application: a Next.js / React dashboard where savings circle organizers and participants manage circles, track contributions, and monitor payouts.

---

## Screenshots

> Real screenshots still need to be captured from a running instance (this environment has no browser rendering available to produce them). The paths below are placeholders — drop the corresponding PNGs into `docs/screenshots/` to make them live.

| Landing page | Dashboard | Circle detail |
| --- | --- | --- |
| ![Landing page](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Circle detail](docs/screenshots/circle-detail.png) |

---

## Features

* **Dashboard** — customizable, drag-and-drop widget layout (stats overview, balance breakdown, savings growth chart, active savings, upcoming payouts calendar, annual savings summary, savings goals, recent achievement).
* **Circles** — discover, create, join, duplicate and compare savings circles; grid/list views, bookmarking, tags, search/autocomplete, categories and an archive view.
* **Circle detail** — per-circle activity feed, discussion threads with moderation, member management, join requests, seat transfers, invite links, pause/resume, and circle rules/agreements.
* **Contributions** — contribution history and status (on-time / late / missed) per circle.
* **Payouts** — payout history, per-payout receipts, and a payout draw view.
* **Wallet** — balance breakdown, send/receive transfers, locked funds, low-balance alerts, and a gas fee estimator.
* **Goals** — savings goals tracking.
* **Achievements & leaderboard** — badges/achievements, milestone celebrations, and a participant leaderboard.
* **Referrals** — referral program views.
* **Statements** — downloadable/exportable account statements and annual summaries.
* **Notifications** — in-app notification center with categories, do-not-disturb quiet hours, and alert preferences.
* **Profile** — participant profile pages, contact directory, and address book.
* **Settings** — theme (light/dark), table density, high-contrast mode, email notification preferences, and account data export.
* **Security** — two-factor authentication (TOTP) and passkey support, email verification.
* **Support** — support ticket views and a help center.
* **Other** — a savings calculator, changelog, cookie consent, offline fallback page, and onboarding feature spotlights.

---

## Tech stack

* [Next.js](https://nextjs.org/) 16 (App Router) + [React](https://react.dev/) 19, written in TypeScript.
* [Tailwind CSS](https://tailwindcss.com/) 4 for styling.
* [TanStack Query](https://tanstack.com/query) for server-state data fetching/caching (see `lib/api` and `lib/hooks`).
* A typed API client layer (`lib/api`) that serves mock data locally and switches to a real HTTP backend via `NEXT_PUBLIC_API_URL` — see [Environment variables](#environment-variables).

See [Project Architecture](docs/ARCHITECTURE.md) for folder responsibilities, data flow, and conventions for adding pages and feature spotlights.

---

## Getting started

### Prerequisites

* Node.js 20+
* [pnpm](https://pnpm.io/) (the repo is pnpm-managed — `pnpm-lock.yaml` / `pnpm-workspace.yaml`)

### Installation

```bash
git clone https://github.com/ussyalfaks/ahjoorxmr-frontend.git
cd ahjoorxmr-frontend

# Install dependencies
pnpm install

# Copy the example env file and adjust as needed (all vars are optional for local dev)
cp .env.example .env.local

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Starts the Next.js development server with hot reload. |
| `pnpm build` | Builds the app for production. |
| `pnpm start` | Runs the production build (run `pnpm build` first). |
| `pnpm lint` | Runs ESLint across the codebase. |
| `pnpm test` | Runs Vitest component tests, including `vitest-axe` accessibility checks. |
| `pnpm test:e2e` | Runs Playwright E2E tests, including `@axe-core/playwright` checks on the main routes (run `pnpm exec playwright install chromium` once first). |

---

## Environment variables

Configuration is validated by `lib/env.ts` at startup. Invalid values stop the build with the variable name and validation error. Public variables are inlined by Next.js and must not contain secrets. See `.env.example` for the full template.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | No | `testnet` | Stellar network (`testnet` or `mainnet`). |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | No | Network-specific | Overrides the wallet guard's network passphrase. |
| `NEXT_PUBLIC_STELLAR_NETWORK_LABEL` | No | Network-specific | Display label for the configured Stellar network. |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | No | Network-specific Stellar RPC | Soroban RPC endpoint used by the savings-circle contract client. |
| `NEXT_PUBLIC_STARKNET_RPC_URL` | No | _unset_ | Starknet RPC endpoint used to estimate on-chain gas fees. |
| `NEXT_PUBLIC_CIRCLE_CONTRACT_ID` | No | Mock contract ID | Deployed Stellar savings-circle contract ID. |
| `NEXT_PUBLIC_API_ADAPTER` | No | `mock` | Selects `mock` or `http` for the typed API client. |
| `NEXT_PUBLIC_API_URL` | When adapter is `http` | _unset_ | Base URL of the backend API; required when `NEXT_PUBLIC_API_ADAPTER=http`. |
| `NEXT_PUBLIC_HEARTBEAT_URL` | No | `/` | Endpoint periodically pinged to detect connectivity loss and recovery. |
| `NEXT_PUBLIC_OFFRAMP_ENABLED` | No | `true` | Set to `false` to hide the bank-transfer off-ramp payout method. |
| `NEXT_PUBLIC_OFFRAMP_PARTNER` | No | `Bank transfer partner` | Display name for the off-ramp partner shown in payout method UI. |

`NODE_ENV` is set by Next.js and should not be configured manually. There are currently no server-only environment variables; add future private values only to the server schema in `lib/env.ts`, without a `NEXT_PUBLIC_` prefix.

---

## Contributing

We welcome contributors of all experience levels!

### Getting started

* Look for **good first issues**
* Fork the repository
* Create a feature branch
* Open a pull request
* [Figma Design](https://www.figma.com/design/NlDFuleGHbh26rRp1ZfyvE/Ahjoor-Design?node-id=0-1&t=3E08H8am5RpUngRF-1)

### Branching strategy

### Branching Strategy

### Code guidelines

### Commit Convention

### Commit convention

We use **Conventional Commits** to standardize commit messages.

---

---

## Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Stellar CLI Reference](https://developers.stellar.org/docs/tools/developer-tools)

---

## License

This project is licensed under the **MIT License**.

---

## Contact us

Have questions or feedback?

* [Telegram: Ahjoor Telegram Group](https://t.me/ahjoor)

## Testing

Run the automated test suite powered by Vitest and React Testing Library:

```bash
pnpm test          # Run all tests once
pnpm test:watch    # Run tests in watch mode
pnpm typecheck     # Run TypeScript type check
```

## Code Formatting

Formatting settings live in `.prettierrc` (Prettier with Tailwind CSS class sorting) and are picked up by your editor's Prettier integration.
