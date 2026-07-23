import {
  defineAgent,
  defineWorkflow,
  type WorkflowRouteHandler,
  type WorkflowRunsHandler,
} from "@flue/runtime";
import {
  cloudflareSandbox,
  getCloudflareContext,
  getDurableObjectIdentity,
} from "@flue/runtime/cloudflare";
import { getSandbox } from "@cloudflare/sandbox";
import * as v from "valibot";
import repoAnalysis from "../../sandbox/skills/repo-analysis/SKILL.md" with { type: "skill" };
import { fetchGitHubBadges, parseGitHubRepo } from "../lib/github.ts";

export const route: WorkflowRouteHandler = async (_c, next) => next();
export const runs: WorkflowRunsHandler = async (_c, next) => next();

// The workflow agent uses the run ID for its sandbox — a fresh container per run.
const analyzer = defineAgent(({ env, id }) => ({
  model: "cloudflare/openai/gpt-4.1",
  sandbox: cloudflareSandbox(getSandbox(env.Sandbox, id)),
  skills: [repoAnalysis],
}));

const AnalysisResult = v.object({
  languages: v.array(v.object({ name: v.string(), percent: v.number(), color: v.string() })),
  badges: v.object({
    license: v.string(),
    stars: v.string(),
    lastCommit: v.string(),
    openIssues: v.number(),
  }),
  dependencies: v.array(v.object({ name: v.string(), version: v.string(), sizeKb: v.number() })),
  complexity: v.array(v.object({ file: v.string(), score: v.number() })),
  fileTree: v.array(v.object({ path: v.string(), lines: v.number(), directory: v.string() })),
});

interface StepPayload {
  label: string;
  status: "in-progress" | "complete";
}

export default defineWorkflow({
  agent: analyzer,
  input: v.object({ repoUrl: v.string(), sandboxId: v.string() }),
  output: AnalysisResult,

  async run({ harness, log, input }) {
    const parsed = parseGitHubRepo(input.repoUrl);
    if (!parsed) {
      throw new Error("Only public github.com/owner/repo URLs are supported");
    }

    const session = await harness.session();
    const cfCtx = getCloudflareContext();
    // Workflow sandbox is keyed by the Durable Object instance name (run id).
    const workflowSandboxId = getDurableObjectIdentity().name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workflowSandbox = getSandbox((cfCtx.env as any).Sandbox, workflowSandboxId);

    // Use log events for step tracking — emitData was removed in beta.8.
    const step = (label: string, status: "in-progress" | "complete") =>
      log.info(label, { status } satisfies Omit<StepPayload, "label">);

    // Live GitHub metadata (stars, issues, last push) — not LLM estimates.
    step("Fetching GitHub stats", "in-progress");
    const badges = await fetchGitHubBadges(parsed.owner, parsed.repo);
    step("Fetching GitHub stats", "complete");

    // Clone inside the sandbox via the Sandbox SDK (not a raw shell git).
    step("Cloning repo", "in-progress");
    await workflowSandbox.gitCheckout(parsed.cloneUrl, {
      targetDir: "/workspace/repo",
      depth: 1,
      cloneTimeoutMs: 120_000,
    });
    step("Cloning repo", "complete");

    // Run the skill — analyze.sh does the heavy lifting, model maps to schema
    step("Analyzing repo", "in-progress");
    const { data } = await session.skill(repoAnalysis, {
      args: { repoUrl: parsed.cloneUrl },
      result: AnalysisResult,
    });
    step("Analyzing repo", "complete");

    // Prefer API badges; keep package.json license if API has none.
    const merged = {
      ...data,
      badges: {
        ...badges,
        license:
          badges.license !== "Unknown"
            ? badges.license
            : data.badges.license || "Unknown",
      },
    };

    // Write analysis.json into the chat agent's sandbox (keyed by sandboxId)
    // so the persistent chat agent can read it directly from its container.
    step("Preparing chat", "in-progress");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSandbox = getSandbox((cfCtx.env as any).Sandbox, input.sandboxId);
    await chatSandbox.writeFile("/workspace/analysis.json", JSON.stringify(merged));
    step("Preparing chat", "complete");

    return merged;
  },
});
