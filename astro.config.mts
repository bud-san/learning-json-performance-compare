// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://bud-san.github.io",
  base: "/learning-json-performance-compare",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    worker: { format: "es" },
  },
});
