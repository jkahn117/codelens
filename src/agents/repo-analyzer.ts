"use agent";

import { type AgentProps, useModel, useSandbox } from "@flue/runtime";
import { cloudflareSandbox } from "@flue/runtime/cloudflare";
import { getSandbox, type Sandbox } from "@cloudflare/sandbox";
import { env } from "cloudflare:workers";
import instructions from "./repo-analyzer.md";

// Chat agent — mounted at /agents/repo-analyzer for browser access.
export function RepoAnalyzer({ id }: AgentProps) {
  useModel("cloudflare/@cf/zai-org/glm-4.7-flash");
  useSandbox(cloudflareSandbox(getSandbox(env.Sandbox as unknown as DurableObjectNamespace<Sandbox<any>>, id)), { cwd: "/workspace" });
  return instructions;
}
