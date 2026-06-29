import { registerProvider } from "@flue/runtime";
import { flue } from "@flue/runtime/routing";
import { Hono } from "hono";
import { env } from "cloudflare:workers";

// Route binding-backed `cloudflare/...` models through our named AI Gateway.
// Runs before the generated entry's auto-registration, so this wins.
registerProvider("cloudflare", {
  api: "cloudflare-ai-binding",
  binding: env.AI,
  gateway: { id: "jkahn1" },
});

const app = new Hono();

// Mount Flue routes at root — agents, workflows, and runs are served from here
app.route("/", flue());

export default app;
