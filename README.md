# RepoScope

A demo app that visualizes any public GitHub repository in a single click.

Paste a repo URL and RepoScope clones it, analyzes the codebase, and renders a live dashboard with language breakdown, dependency sizes, file complexity, and a codebase heatmap. A persistent chat panel lets you ask follow-up questions about the repo.

> **Demo note:** RepoScope is built for presentations, not production. It targets public repos, desktop viewports, and a dark theme. Error handling and edge-case fallbacks are intentionally minimal.

## What it shows

- **Language breakdown** — stacked bar chart of the repo's languages.
- **Health badges** — license, stars, last commit, and open issues.
- **Dependency treemap** — top-level dependencies sized by install weight.
- **Most complex files** — top 10 files by cyclomatic complexity.
- **Codebase structure** — `src/` heatmap grouped by directory.
- **Activity feed** — live agent steps as the analysis runs.
- **Chat** — ask questions about the repo; answers stream in token by token.

## Tech stack

- [Flue](https://flue.dev) (`1.0.0-beta.8`) + Cloudflare Workers
- [Cloudflare Container Sandbox](https://developers.cloudflare.com/sandbox/) for isolated repo analysis
- React 19 + TypeScript + Vite
- Tailwind CSS v4 + Recharts
- Anthropic Claude via the Cloudflare AI binding

## Project structure

```
src/                    # React frontend
  components/           # Hero bar, dashboard, charts, chat, feed
  hooks/                # useAnalysis, useChat
  agents/               # repo-analyzer agent
  workflows/            # analyze workflow
  lib/                  # chart data transforms, step labels, URL hashing
wrangler.jsonc          # Cloudflare Workers config
sandbox/Dockerfile      # Analysis container image
```

## Running locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables and add your Anthropic API key:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. Start the Worker and Vite dev server:

   ```bash
   pnpm dev
   ```

4. Open the local URL shown by Vite, paste a public GitHub repo URL, and click **Analyze**.

## Building and deploying

```bash
pnpm run build
pnpm run deploy
```

## Slide embed mode

Append `?embed=dashboard` to the URL to hide the hero bar and chat panel, leaving only the dashboard charts. Designed for iframing in slides at around `1200×700`.

## Learn more

- Specification: [`docs/reposcope-spec.md`](docs/reposcope-spec.md)
