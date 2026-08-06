# CodeLens

A demo app that visualizes any public GitHub repository in a single click.

Paste a repo URL and CodeLens clones it, analyzes the codebase, and renders a live dashboard with language breakdown, dependency sizes, file complexity, and a codebase heatmap. A persistent chat panel lets you ask follow-up questions about the repo.

> **Demo note:** CodeLens is built for presentations, not production. It targets public repos, desktop viewports, and a dark theme. Error handling and edge-case fallbacks are intentionally minimal.

## What it shows

- **Language breakdown** — stacked bar chart of the repo's languages.
- **Health badges** — license, stars, last commit, and open issues.
- **Dependency treemap** — top-level dependencies sized by install weight.
- **Most complex files** — top 10 files by cyclomatic complexity.
- **Codebase structure** — `src/` heatmap grouped by directory.
- **Activity feed** — live agent steps as the analysis runs.
- **Chat** — ask questions about the repo; answers stream in token by token.

## Tech stack

- [Flue](https://flue.dev) (`2.0.3`) + Cloudflare Workers
- [Cloudflare Container Sandbox](https://developers.cloudflare.com/sandbox/) for isolated repo analysis
- React 19 + TypeScript + Vite
- Tailwind CSS v4 + Recharts + GitHub-flavored Markdown
- GLM-4.7-Flash via the Cloudflare AI binding + AI Gateway

## Project structure

```
src/                    # React frontend
  components/           # Hero bar, dashboard, charts, chat, feed
  hooks/                # useAnalysis, useChat
  agents/               # repo-analyzer chat agent
  lib/                  # chart data transforms, step labels, URL hashing
wrangler.jsonc          # Cloudflare Workers config
sandbox/Dockerfile      # Analysis container image
```

## Running locally

**Prerequisites:** Node.js, pnpm, Docker, and a Cloudflare account with Workers AI enabled. Docker must be running because the analysis sandbox builds and starts a container on first run.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the Worker and Vite dev server:

   ```bash
   CLOUDFLARE_ACCOUNT_ID=<your-cloudflare-account-id> pnpm dev
   ```

3. Open `http://localhost:5173`, paste a public GitHub repo URL, and click **Analyze**.

## Building and deploying

Authenticate Wrangler before the first deployment:

```bash
pnpm wrangler login
```

The project is configured to deploy the `codelens` Worker with:

- The `Sandbox` Durable Object and container image from `sandbox/Dockerfile`
- The Workers AI binding named `AI`
- The `FlueRepoAnalyzerAgent` Durable Object
- Static assets from `dist/client`
- The `codelens.dev` custom domain

Before deploying, make sure the Cloudflare account owns and has DNS configured for `codelens.dev`, and that the AI Gateway named `jkahn1` exists. The gateway ID is configured in `src/app.ts`.

Authentication is disabled by default. To enable the optional Clerk demo flow, provide `VITE_ENABLE_AUTH=true` and `VITE_CLERK_PUBLISHABLE_KEY` in the environment used to build the frontend. Do not commit Clerk secret keys or other credentials.

Deploy with:

```bash
pnpm run deploy
```

`pnpm run deploy` builds the frontend and then runs `wrangler deploy`.

## Slide embed mode

Append `?embed=dashboard` to the URL to hide the hero bar and chat panel, leaving only the dashboard charts. Designed for iframing in slides at around `1200×700`.

## Learn more

- Specification: [`docs/codelens-spec.md`](docs/codelens-spec.md)
