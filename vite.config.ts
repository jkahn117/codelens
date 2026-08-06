import { defineConfig } from "vite";
import { flue, flueWorkerConfig } from "@flue/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [flue(), cloudflare({ config: flueWorkerConfig() }), react(), tailwindcss()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
});
