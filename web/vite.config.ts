import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages demo build (VITE_DEMO=1): serve from /trimstack/.
  // Env-var driven (not mode) so one flag controls base + client.ts demo facade.
  base: process.env.VITE_DEMO === "1" || mode === "demo" ? "/trimstack/" : "/",
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
}));
