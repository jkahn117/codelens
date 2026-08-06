import { setProvider } from "@flue/runtime";
import { cloudflareBindingProvider } from "@flue/runtime/cloudflare/workers-ai";
import { createAgentRouter } from "@flue/runtime/routing";
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { getSandbox, type Sandbox } from "@cloudflare/sandbox";
import { parseGitHubRepo, fetchGitHubBadges } from "./lib/github.ts";
import { RepoAnalyzer } from "./agents/repo-analyzer.ts";
import type { AnalysisResult } from "./types.ts";

// Register Cloudflare Workers AI provider with named AI Gateway.
setProvider(cloudflareBindingProvider({ binding: env.AI, gateway: { id: "jkahn1" } }));

const app = new Hono();

// Chat agent mounted for browser access
app.route("/agents/repo-analyzer", createAgentRouter(RepoAnalyzer));

// SSE helper: encode an event as `data: {...}\n\n`
function sseData(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Language hex colors for the dashboard
const LANG_COLORS: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f7df1e",
  python: "#3572A5",
  go: "#00ADD8",
  rust: "#dea584",
  css: "#264de4",
  scss: "#c69",
  html: "#e34c26",
  markdown: "#083fa1",
  json: "#264de4",
  yaml: "#cb171e",
  yml: "#cb171e",
  sh: "#89e051",
  bash: "#89e051",
  sql: "#e38c00",
  java: "#b07219",
  kotlin: "#A97BFF",
  swift: "#F05138",
  ruby: "#701516",
  php: "#4F5D95",
  c: "#555555",
  cpp: "#f34b7d",
  "c++": "#f34b7d",
  csharp: "#178600",
  "c#": "#178600",
  vue: "#41b883",
  svelte: "#ff3e00",
  toml: "#9c4221",
  dockerfile: "#384d54",
  svg: "#dea584",
};

// Skip these extensions — not real languages
const SKIP_EXTS = new Set(["lock", "map", "git", "gitignore", "gitattributes", "ds_store"]);

// Rough size estimates by package name pattern (KB)
function estimateSizeKb(name: string): number {
  if (/react|vue|svelte|solid|angular/.test(name)) return 150;
  if (/next|nuxt|remix|astro/.test(name)) return 400;
  if (/typescript|babel|esbuild|swc|vite|webpack|rollup|turbo/.test(name)) return 300;
  if (/eslint|prettier|biome|stylelint|rustfmt/.test(name)) return 100;
  if (/tailwind|postcss|sass|less/.test(name)) return 200;
  if (/drizzle|prisma|kysely|typeorm|sequelize/.test(name)) return 250;
  if (/hono|express|fastify|koa/.test(name)) return 80;
  if (/valibot|zod|yup/.test(name)) return 50;
  if (/cloudflare|wrangler/.test(name)) return 200;
  if (/test|vitest|jest|mocha|playwright|cypress/.test(name)) return 200;
  return 30;
}

// Transform raw analyze.sh output into the AnalysisResult schema
function transformAnalysis(raw: {
  langCounts: { ext: string; count: number }[];
  packageJson: { license?: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  topFiles: { path: string; lines: number; directory: string }[];
  complexity: { file: string; score: number }[];
}): Omit<AnalysisResult, "badges"> {
  // Languages with percentages
  const filtered = raw.langCounts.filter((l) => !SKIP_EXTS.has(l.ext.toLowerCase()));
  const total = filtered.reduce((sum, l) => sum + l.count, 0) || 1;
  const languages = filtered
    .map((l) => ({
      name: l.ext.charAt(0).toUpperCase() + l.ext.slice(1),
      percent: Math.round((l.count / total) * 100 * 100) / 100,
      color: LANG_COLORS[l.ext.toLowerCase()] || "#8b949e",
    }))
    .sort((a, b) => b.percent - a.percent);

  // Dependencies from package.json
  const allDeps = { ...(raw.packageJson.dependencies || {}), ...(raw.packageJson.devDependencies || {}) };
  const dependencies = Object.entries(allDeps).map(([name, version]) => ({
    name,
    version,
    sizeKb: estimateSizeKb(name),
  }));

  // Complexity — use script output, or derive from topFiles
  const complexity = raw.complexity.length > 0
    ? raw.complexity
    : raw.topFiles
        .filter((f) => !f.path.endsWith(".d.ts"))
        .slice(0, 10)
        .map((f) => ({ file: f.path, score: Math.round(f.lines / 10) }));

  // File tree — use topFiles directly
  const fileTree = raw.topFiles.filter((f) => !f.path.endsWith(".d.ts"));

  return { languages, dependencies, complexity, fileTree };
}

// Analysis endpoint — deterministic steps, no model needed for analysis.
app.post("/api/analyze", async (c) => {
  const body = await c.req.json<{ repoUrl: string; sandboxId: string }>();
  const { repoUrl, sandboxId } = body;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => controller.enqueue(encoder.encode(sseData(data)));

      try {
        const parsed = parseGitHubRepo(repoUrl);
        if (!parsed) {
          send({ type: "error", message: "Only public github.com/owner/repo URLs are supported" });
          controller.close();
          return;
        }

        // Step 1: Fetch GitHub stats
        send({ type: "step", label: "Fetching GitHub stats", status: "in-progress" });
        const badges = await fetchGitHubBadges(parsed.owner, parsed.repo);
        send({ type: "step", label: "Fetching GitHub stats", status: "complete" });

        // Step 2: Clone repo into the sandbox
        send({ type: "step", label: "Cloning repo", status: "in-progress" });
        const sandbox = getSandbox(env.Sandbox as unknown as DurableObjectNamespace<Sandbox<any>>, sandboxId);
        await sandbox.gitCheckout(parsed.cloneUrl, {
          targetDir: "/workspace/repo",
          depth: 1,
          cloneTimeoutMs: 120_000,
        });
        send({ type: "step", label: "Cloning repo", status: "complete" });

        // Step 3: Run analyze.sh directly in the sandbox
        send({ type: "step", label: "Analyzing repo", status: "in-progress" });
        const result = await sandbox.exec("bash /workspace/.agents/skills/repo-analysis/analyze.sh /workspace/repo", {
          timeout: 60_000,
        });
        if (!result.success) {
          send({ type: "error", message: `Analysis script failed: ${result.stderr || result.stdout}` });
          controller.close();
          return;
        }
        const raw = JSON.parse(result.stdout);
        const analysis = transformAnalysis(raw);
        send({ type: "step", label: "Analyzing repo", status: "complete" });

        // Step 4: Merge live badges and write analysis.json
        send({ type: "step", label: "Preparing chat", status: "in-progress" });
        const merged: AnalysisResult = {
          ...analysis,
          badges: {
            ...badges,
            license: badges.license !== "Unknown" ? badges.license : (raw.packageJson.license || "Unknown"),
          },
        };
        await sandbox.writeFile("/workspace/analysis.json", JSON.stringify(merged));
        send({ type: "step", label: "Preparing chat", status: "complete" });

        send({ type: "result", result: merged });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export default app;
