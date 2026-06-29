import { defineAgent, type AgentRouteHandler } from "@flue/runtime";
import { cloudflareSandbox } from "@flue/runtime/cloudflare";
import { getSandbox } from "@cloudflare/sandbox";
import instructions from "./repo-analyzer.md" with { type: "markdown" };

// Expose HTTP prompt + event streaming for the chat panel
export const route: AgentRouteHandler = async (_c, next) => next();

export default defineAgent(({ id, env }) => ({
  model: "cloudflare/openai/gpt-4.1",
  sandbox: cloudflareSandbox(getSandbox(env.Sandbox, id)),
  instructions,
}));
