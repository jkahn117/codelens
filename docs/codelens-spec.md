# CodeLens — Demo App Specification

**Version:** 0.2  
**Stack:** Flue `1.0.0-beta.6`, Cloudflare Workers + Container Sandbox, React, `@flue/react`

---

## Overview

CodeLens is a single-page web app. The user pastes a GitHub repo URL and the agent
clones and analyzes it — streaming live progress — then renders a visual dashboard.
A persistent chat panel lets the user ask questions about the repo at any time.

The app is designed to be demoed in a full-screen browser tab. The left panel (dashboard)
is also embeddable as an iframe in a slide at a fixed width.

---

## Page Layout

The page has no navigation, no sidebar, no header chrome. Full viewport, dark theme.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HERO BAR  [CodeLens]           [github.com/... URL input]   [Analyze →]│
├────────────────────────────────────┬────────────────────────────────────┤
│                                    │                                    │
│         DASHBOARD PANEL            │        RIGHT PANEL                 │
│         (left, ~60% width)         │        (right, ~40% width)         │
│                                    │                                    │
│  [Language Chart]  [Health Badges] │  ACTIVITY FEED (top half)         │
│                                    │                                    │
│  [Dependency Treemap]              │  CHAT PANEL (bottom half)          │
│                                    │                                    │
│  [File Complexity Chart]           │                                    │
│                                    │                                    │
│  [File Size Heatmap]               │                                    │
│                                    │                                    │
└────────────────────────────────────┴────────────────────────────────────┘
```

Three distinct zones:
- **Hero bar** — URL input, always visible
- **Dashboard panel** — visual analysis output, left side
- **Right panel** — activity feed (top) + chat (bottom), right side

---

## States

The app has three top-level states that control what renders:

### State 1: Empty (initial load)

- Hero bar visible with placeholder text in URL input
- Dashboard panel: large centered prompt — "Paste a GitHub repo URL to analyze it"
- Right panel: hidden or showing a faint placeholder
- No charts, no feed, no chat

### State 2: Analyzing (in-progress)

- Hero bar: URL is locked, Analyze button becomes a spinner
- Dashboard panel: chart skeletons visible (gray shimmer placeholders in correct positions)
  - Charts populate progressively as data becomes available — they don't all wait for the full analysis
- Right panel (activity feed): live stream of agent steps, newest at bottom, auto-scrolls
- Right panel (chat): input disabled, shows "Analysis in progress..."

### State 3: Complete

- Hero bar: URL unlocked, can submit a new repo
- Dashboard panel: all charts fully rendered
- Right panel (activity feed): feed stops, last item shows checkmark + elapsed time
- Right panel (chat): input enabled, ready for questions

---

## Components

### Hero Bar

- Fixed height (~56px), spans full width
- Left: wordmark "CodeLens" in monospace, small
- Center: URL text input, wide, placeholder `github.com/owner/repo`
- Right: "Analyze" button — primary action
- On submit: button becomes a loading spinner, input becomes read-only
- Background: slightly lighter than page bg, subtle bottom border

---

### Dashboard Panel

Fixed left column. Scrollable vertically if content overflows viewport.
Dark background. Panels separated by subtle dividers, not cards.

#### Row 1: Language Breakdown + Health Badges

Two items side by side.

**Language Breakdown** (left ~60% of row)
- Horizontal stacked bar — full width of its container, ~24px tall
- Each language segment is a different color, labeled inline if wide enough
- Below the bar: legend — colored dot + language name + percentage, flex-wrap

**Health Badges** (right ~40% of row)
- 4 small pill badges stacked or in a 2x2 grid:
  - License (e.g. `MIT`)
  - Stars (e.g. `⭐ 4.2k`)
  - Last commit (e.g. `2 days ago`)
  - Open issues (e.g. `47 open`)
- Each badge: icon + label + value, monochrome with colored value

#### Row 2: Dependency Treemap

- Full width of dashboard panel
- ~220px tall
- Treemap: each node is one top-level dependency, sized by install size
- Node color: green (small) → yellow (medium) → red (large, >1MB)
- On hover: tooltip showing `package@version — X KB`
- Title above: "Dependencies" + total count

#### Row 3: File Complexity (Top 10)

- Full width
- ~200px tall
- Horizontal bar chart — one bar per file, sorted descending by cyclomatic complexity
- Bar label: file path (truncated to last 2 segments), right-aligned
- Bar fill: same green→yellow→red gradient as treemap
- Title: "Most Complex Files"

#### Row 4: File Size Heatmap

- Full width
- ~200px tall
- Treemap of `src/` directory, nodes sized by line count
- Nodes grouped and colored by directory — each top-level directory gets a distinct hue
- On hover: tooltip showing `path — N lines`
- Title: "Codebase Structure"

---

### Right Panel

Fixed right column. Split into two vertical sections.

---

#### Activity Feed (top ~45% of right panel)

Live scrolling log of what the agent is doing.

- Each line is one step with an icon and text:
  - `⟳` (spinning) — in progress
  - `✓` (green checkmark) — complete
  - `·` (dim dot) — pending / not started yet
- Steps always appear in this order, but fill in progressively:
  ```
  ✓  Connected to GitHub
  ✓  Cloned repo  (1.4s)
  ✓  Parsed package.json  — 47 dependencies
  ✓  Scanned 312 files
  ⟳  Computing complexity...
  ·  Checking dependency sizes
  ·  Building heatmap
  ```
- Font: monospace, small (~13px)
- Background: slightly darker than page
- Auto-scrolls to bottom as new steps appear
- At completion: a final line — `✓  Analysis complete  (18s total)` — bold, accent color

---

#### Chat Panel (bottom ~55% of right panel)

Persistent chat interface for asking questions about the repo.

**Message area:**
- Scrollable, shows conversation history
- Two message styles:
  - **User message:** right-aligned, accent background bubble
  - **Agent message:** left-aligned, dark background, no bubble — plain text with markdown rendering
- Agent responses stream in token by token (not appear all at once)
- If analysis is still running, shows a banner: "Finish analyzing before chatting" (non-blocking, just informational)

**Input row (pinned to bottom of panel):**
- Text input, full width minus send button
- Placeholder: "Ask a question about this repo..."
- Send button: icon-only (arrow), or Enter to submit
- Disabled state while agent is responding (input grays out)

**Suggested questions** (shown only on first load after analysis completes, disappear after first message):
- 3 pill buttons below the input:
  - "What's the riskiest dependency?"
  - "Which file should I refactor first?"
  - "Is this repo well-tested?"
- Clicking a suggestion populates the input and submits immediately

---

## Visual Design

**Theme:** Dark only. No light mode toggle.

**Colors:**
- Page background: `#0a0a0a`
- Panel background: `#111111`
- Border / divider: `#222222`
- Primary text: `#f0f0f0`
- Dim text: `#666666`
- Accent: Cloudflare orange (`#F48120`) — used for the Analyze button, checkmarks in feed, active chart segments
- Green (healthy): `#22c55e`
- Yellow (moderate): `#eab308`
- Red (heavy/complex): `#ef4444`

**Typography:**
- UI labels, badges, feed: `JetBrains Mono` or system monospace
- Chat messages: `Inter` or system sans-serif
- No decorative fonts

**Motion:**
- Chart bars animate in on data arrival (slide from left, ~300ms ease-out)
- Treemap nodes fade in block by block as they load
- Feed items slide up into view as they appear
- Skeleton shimmer on loading state (not spinner — shimmer looks more like the chart is about to appear)
- Keep all animation subtle — this is a developer tool, not a marketing page

---

## Slide Embed Mode

When the page is loaded with `?embed=dashboard` in the URL:

- Hero bar is hidden
- Right panel (feed + chat) is hidden
- Dashboard panel expands to full viewport width
- No scroll — charts reflow into a 2-column grid to fit
- Designed to be iframed at `1200×700` in a slide

This lets the presenter show the visual output full-screen in a slide after the live demo, or run the iframe live during the talk.

---

## Flue Backend

### Packages

```json
{
  "dependencies": {
    "@flue/runtime": "1.0.0-beta.6",
    "@flue/sdk": "1.0.0-beta.6",
    "@flue/react": "1.0.0-beta.6",
    "@cloudflare/sandbox": "latest",
    "agents": "^0.14.1",
    "valibot": "latest"
  },
  "devDependencies": {
    "@flue/cli": "1.0.0-beta.6",
    "wrangler": "latest"
  }
}
```

---

### Project Layout

```
.flue/
  agents/
    repo-analyzer.ts       ← persistent chat agent
  workflows/
    analyze.ts             ← one-shot analysis workflow
  cloudflare.ts            ← exports Sandbox DO class
  app.ts                   ← mounts flue() + serves static assets
src/                       ← React frontend (built by Vite)
wrangler.jsonc             ← source-root config (migrations live here)
Dockerfile                 ← container image for sandbox
```

---

### Agent: `repo-analyzer`

**File:** `.flue/agents/repo-analyzer.ts`

A persistent agent. One instance per repo URL (instance ID = URL hash). Keeps full
conversation history across the session. Can re-enter the sandbox to answer follow-up
questions that require running commands.

```ts
import { defineAgent, type AgentRouteHandler } from '@flue/runtime';
import { cloudflareSandbox } from '@flue/runtime/cloudflare';
import { getSandbox } from '@cloudflare/sandbox';
import instructions from './repo-analyzer.md' with { type: 'markdown' };

export const route: AgentRouteHandler = async (_c, next) => next();

export default defineAgent(({ id, env }) => ({
  model: 'anthropic/claude-sonnet-4-6',
  sandbox: cloudflareSandbox(getSandbox(env.Sandbox, id)),
  instructions,
}));
```

**`repo-analyzer.md` (instructions):**
```
You are a code intelligence assistant. A GitHub repository has already been
cloned to /workspace/repo. Analysis results (language breakdown, dependency
sizes, complexity scores, file sizes) are in /workspace/analysis.json.

When answering questions:
- Reference specific files, line counts, or dependency names from the analysis
- Run shell commands in the sandbox if you need data not in analysis.json
- Keep answers concise — this is a live demo context
- Format code references as `path/to/file.ts`
```

**Instance ID strategy:** SHA-256 of the normalized repo URL, truncated to 16 chars.
`github.com/cloudflare/workers-sdk` → `a3f9c1e84b720d56`. Same URL always routes to
the same agent instance and conversation history.

---

### Workflow: `analyze`

**File:** `.flue/workflows/analyze.ts`

One-shot. Triggered on URL submit. Clones the repo, runs all analysis, returns
structured JSON. The workflow `runs` export is enabled so the frontend can stream
its events into the activity feed.

```ts
import { defineAgent, defineWorkflow, type WorkflowRouteHandler, type WorkflowRunsHandler } from '@flue/runtime';
import { cloudflareSandbox } from '@flue/runtime/cloudflare';
import { getSandbox } from '@cloudflare/sandbox';
import * as v from 'valibot';

export const route: WorkflowRouteHandler = async (_c, next) => next();
export const runs: WorkflowRunsHandler = async (_c, next) => next();

const analyzer = defineAgent(({ env, id }) => ({
  model: 'anthropic/claude-sonnet-4-6',
  sandbox: cloudflareSandbox(getSandbox(env.Sandbox, id)),
}));

const AnalysisResult = v.object({
  languages: v.array(v.object({
    name: v.string(),
    percent: v.number(),
    color: v.string(),
  })),
  badges: v.object({
    license: v.string(),
    stars: v.string(),
    lastCommit: v.string(),
    openIssues: v.number(),
  }),
  dependencies: v.array(v.object({
    name: v.string(),
    version: v.string(),
    sizeKb: v.number(),
  })),
  complexity: v.array(v.object({
    file: v.string(),
    score: v.number(),
  })),
  fileTree: v.array(v.object({
    path: v.string(),
    lines: v.number(),
    directory: v.string(),
  })),
});

export default defineWorkflow({
  agent: analyzer,
  input: v.object({ repoUrl: v.string(), sandboxId: v.string() }),
  output: AnalysisResult,

  async run({ harness, input }) {
    const session = await harness.session();

    // Each shell call emits tool events — these are what the activity feed reads
    await session.shell(`git clone --depth 1 ${input.repoUrl} /workspace/repo`);
    await session.shell(`cd /workspace/repo && find . -type f | head -2000 > /workspace/filelist.txt`);
    await session.shell(`cd /workspace/repo && cat package.json 2>/dev/null || echo '{}'`);
    await session.shell(`cd /workspace/repo && npm ls --json --depth 0 2>/dev/null > /workspace/deptree.json || echo '{}'`);
    await session.shell(`npx --yes lizard /workspace/repo --csv -o /workspace/complexity.csv 2>/dev/null || true`);

    const { data } = await session.prompt(
      `The repo is cloned at /workspace/repo. filelist.txt, deptree.json, and
       complexity.csv are in /workspace. Extract all analysis data and return it
       as structured JSON matching the output schema.`,
      { result: AnalysisResult }
    );

    // Write analysis to /workspace so the agent can reference it later
    await harness.fs.writeFile('/workspace/analysis.json', JSON.stringify(data));

    return data;
  },
});
```

**Note on shell events:** Each `session.shell()` call emits `tool_call` and `tool_result`
events on the run's Durable Stream. The frontend maps these to activity feed steps by
pattern-matching the shell command text.

---

### `cloudflare.ts`

**File:** `.flue/cloudflare.ts`

```ts
export { Sandbox } from '@cloudflare/sandbox';
```

---

### `wrangler.jsonc`

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "codelens",
  "compatibility_date": "2026-06-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/_flue/*", "/agents/*", "/workflows/*", "/runs/*"]
  },
  "durable_objects": {
    "bindings": [{ "class_name": "Sandbox", "name": "Sandbox" }]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": [
        "FlueRegistry",
        "FlueRepoAnalyzerAgent",
        "FlueAnalyzeWorkflow"
      ]
    },
    { "tag": "v2", "new_sqlite_classes": ["Sandbox"] }
  ],
  "containers": [{ "class_name": "Sandbox", "image": "./Dockerfile" }]
}
```

---

### `Dockerfile`

```dockerfile
FROM docker.io/cloudflare/sandbox:0.9.2
RUN apt-get update && apt-get install -y python3 python3-pip git \
  && pip3 install lizard \
  && apt-get clean
```

`lizard` provides cyclomatic complexity analysis across TypeScript, Python, Go, and
other languages without needing a full compiler.

---

### Frontend ↔ Flue Wiring

#### Analysis workflow (activity feed + dashboard)

The frontend invokes the workflow and streams its run events. Shell tool calls are
mapped to human-readable activity feed steps.

```ts
// hooks/useAnalysis.ts
import { createFlueClient } from '@flue/sdk';

const client = createFlueClient({ baseUrl: '/' });

export function useAnalysis() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function analyze(repoUrl: string) {
    const sandboxId = hashRepoUrl(repoUrl);
    const { runId } = await client.workflows.invoke('analyze', {
      input: { repoUrl, sandboxId },
    });

    for await (const event of client.runs.stream(runId, { live: true })) {
      if (event.type === 'tool_call' && event.tool === 'shell') {
        // Map shell command to a human-readable step label
        setSteps(prev => [...prev, shellCommandToStep(event.input.command)]);
      }
      if (event.type === 'run_end' && event.status === 'completed') {
        setResult(event.result);
        break;
      }
    }
  }

  return { analyze, steps, result };
}
```

**Shell command → activity step mapping** (`lib/stepLabels.ts`):

| Shell command contains | Activity feed label |
|---|---|
| `git clone` | `Cloning repo` |
| `find . -type f` | `Scanning files` |
| `cat package.json` | `Reading package.json` |
| `npm ls` | `Resolving dependencies` |
| `lizard` | `Computing complexity` |
| prompt (no shell) | `Building report` |

#### Chat agent (chat panel)

The frontend sends messages to the persistent agent instance and streams the response
token by token.

```ts
// hooks/useChat.ts
import { createFlueClient } from '@flue/sdk';

const client = createFlueClient({ baseUrl: '/' });

export function useChat(repoUrl: string) {
  const agentId = hashRepoUrl(repoUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  async function send(text: string) {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setStreaming(true);

    // Send without waiting — stream the response as it arrives
    const { offset } = await client.agents.send('repo-analyzer', agentId, {
      message: text,
    });

    let buffer = '';
    for await (const event of client.agents.stream('repo-analyzer', agentId, {
      offset,
      live: true,
    })) {
      if (event.type === 'message_start' && event.role === 'assistant') {
        setMessages(prev => [...prev, { role: 'assistant', text: '' }]);
      }
      if (event.type === 'text_delta') {
        buffer += event.delta;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', text: buffer };
          return updated;
        });
      }
      if (event.type === 'idle') break;
    }

    setStreaming(false);
  }

  return { messages, send, streaming };
}
```

#### `FlueProvider` (root)

```tsx
// App.tsx
import { createFlueClient } from '@flue/sdk';
import { FlueProvider } from '@flue/react';

const client = createFlueClient({ baseUrl: '/' });

export function App() {
  return (
    <FlueProvider client={client}>
      <CodeLens />
    </FlueProvider>
  );
}
```

---

## Data Flow Summary

```
User submits URL
       │
       ▼
client.workflows.invoke('analyze', { repoUrl, sandboxId })
       │
       ▼
FlueAnalyzeWorkflow (Durable Object)
  └─ Cloudflare Container (Sandbox DO)
       └─ git clone → find → npm ls → lizard → structured JSON
       │
       ├──► client.runs.stream(runId)
       │      └─ tool_call events → Activity Feed steps
       │      └─ run_end result  → Dashboard panels populate
       │
       └──► /workspace/analysis.json written for agent to reference

User types in chat
       │
       ▼
client.agents.send('repo-analyzer', agentId, { message })
       │
       ▼
FlueRepoAnalyzerAgent (Durable Object, same sandbox)
  └─ Reads /workspace/analysis.json
  └─ Runs shell commands on demand for follow-ups
       │
       └──► client.agents.stream(agentId, { offset })
              └─ text_delta events → Chat panel streams token by token
```

---

## File Structure

```
.flue/
  agents/
    repo-analyzer.ts
    repo-analyzer.md       ← agent instructions
  workflows/
    analyze.ts
  cloudflare.ts
  app.ts
src/
  components/
    HeroBar.tsx
    DashboardPanel.tsx
      LanguageBar.tsx
      HealthBadges.tsx
      DependencyTreemap.tsx
      ComplexityChart.tsx
      FileSizeHeatmap.tsx
    RightPanel.tsx
      ActivityFeed.tsx
      ChatPanel.tsx
        MessageList.tsx
        MessageInput.tsx
        SuggestedQuestions.tsx
    Skeleton.tsx
  hooks/
    useAnalysis.ts
    useChat.ts
  lib/
    chartData.ts           ← transforms AnalysisResult into chart-ready shapes
    stepLabels.ts          ← maps shell commands to activity feed labels
    hashRepoUrl.ts         ← deterministic agent instance ID from URL
  App.tsx
  main.tsx
wrangler.jsonc
Dockerfile
```

---

## Charting Library

Recommended: **Recharts** (React-native, no canvas, good TypeScript support, easy to theme).

- Treemaps: `Treemap` component from Recharts
- Bar charts: `BarChart` (horizontal, `layout="vertical"`)
- Language bar: custom CSS flexbox — not a chart library component (simpler, more control)
- Tooltips: Recharts built-in `<Tooltip>` with custom renderer

Alternative if Recharts treemap is insufficient: **d3-hierarchy** for treemap layout, rendered as SVG within React — more control, more code.

---

## Out of Scope (for demo)

- Authentication / user accounts
- Saving or sharing analysis results
- Private repos
- Mobile layout
- Light mode
- Any Stripe billing UI (that's the Stripe Projects story, handled separately)
