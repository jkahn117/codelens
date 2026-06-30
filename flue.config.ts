import { defineConfig } from "@flue/cli/config";

export default defineConfig({
  target: "cloudflare",
});

// Pre-declare all Worker-environment deps so Vite's optimizer runs a single
// pass instead of two rounds (which causes a race where files are referenced
// before they exist on disk).
export const vite = {
  environments: {
    codelens: {
      optimizeDeps: {
        include: [
          "@cloudflare/sandbox",
          "@flue/runtime",
          "@flue/runtime/cloudflare",
          "@flue/runtime/cloudflare/internal",
          "@flue/runtime/internal",
          "agents",
          "valibot",
        ],
      },
    },
  },
};
