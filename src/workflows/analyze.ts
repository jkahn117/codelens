import {
  defineAgent,
  defineWorkflow,
  type WorkflowRouteHandler,
  type WorkflowRunsHandler,
} from "@flue/runtime";
import { cloudflareSandbox, getCloudflareContext } from "@flue/runtime/cloudflare";
import { getSandbox } from "@cloudflare/sandbox";
import * as v from "valibot";
import repoAnalysis from "../../sandbox/skills/repo-analysis/SKILL.md" with { type: "skill" };

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
    const session = await harness.session();

    // Use log events for step tracking — emitData was removed in beta.8.
    const step = (label: string, status: "in-progress" | "complete") =>
      log.info(label, { status } satisfies Omit<StepPayload, "label">);

    // Clone the repo into the workflow sandbox
    step("Cloning repo", "in-progress");
    await session.shell(`git clone --depth 1 ${input.repoUrl} /workspace/repo`);
    step("Cloning repo", "complete");

    // Run the skill — analyze.sh does the heavy lifting, model maps to schema
    step("Analyzing repo", "in-progress");
    const { data } = await session.skill(repoAnalysis, {
      args: { repoUrl: input.repoUrl },
      result: AnalysisResult,
    });
    step("Analyzing repo", "complete");

    // Write analysis.json into the chat agent's sandbox (keyed by sandboxId)
    // so the persistent chat agent can read it directly from its container.
    const cfCtx = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSandbox = getSandbox((cfCtx.env as any).Sandbox, input.sandboxId);
    await chatSandbox.writeFile("/workspace/analysis.json", JSON.stringify(data));

    return data;
  },
});
