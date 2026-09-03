import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages project site (demo build): serve from /trimstack/
  base: mode === "demo" ? "/trimstack/" : "/",
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
}));
