import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/_flue": "http://localhost:3583",
      "/agents": "http://localhost:3583",
      "/workflows": "http://localhost:3583",
      "/runs": "http://localhost:3583",
    },
    watch: {
      // Ignore flue/wrangler runtime state so their writes don't trigger HMR reloads.
      ignored: ["**/.wrangler/**", "**/dist/**", "**/.flue-vite/**"],
    },
  },
});
