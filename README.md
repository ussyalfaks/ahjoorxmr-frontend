# ahjoorxmr-frontend

A production-ready Next.js application built with TypeScript, App Router, and Tailwind CSS.

## Project Overview

This is a modern Next.js application featuring:

- Next.js 16+ with App Router
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling
- ESLint for code quality
- React 19+

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.17 or later (currently using v22.19.0)
- pnpm 8.0 or later (recommended) or npm 9.0 or later

You can verify your installations by running:

```bash
node --version
pnpm --version
```

## Installation Instructions

1. Clone the repository (if not already done):

```bash
git clone <repository-url>
cd ahjoorxmr-frontend
```

2. Install dependencies:

```bash
pnpm install
```

Or if using npm:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then update the variables in `.env.local` with your actual values.

## Development Workflow

### Running the Development Server

Start the development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page auto-updates as you edit files in the `app` directory.

### Building for Production

Create an optimized production build:

```bash
pnpm build
```

### Running the Production Build

After building, start the production server:

```bash
pnpm start
```

### Linting

Run ESLint to check code quality:

```bash
pnpm lint
```

## Environment Variable Setup

This project uses environment variables for configuration. Follow these steps:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the variables in `.env.local` with your values

3. Never commit `.env.local` to version control (it's already in `.gitignore`)

### Environment Variable Types

- `.env.local` - Local development variables (not committed)
- `.env.example` - Template file showing required variables (committed)
- `.env.production` - Production-specific variables (optional)

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Project Structure

```
ahjoorxmr-frontend/
├── app/                  # App Router directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles with Tailwind
├── public/              # Static assets
├── .env.example         # Environment variables template
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
├── postcss.config.mjs   # PostCSS configuration for Tailwind
└── package.json         # Project dependencies
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Next.js App Router](https://nextjs.org/docs/app) - App Router documentation
- [TypeScript](https://www.typescriptlang.org/docs/) - TypeScript documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Tailwind CSS documentation

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
