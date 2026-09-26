import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: process.env.SITE_URL || "https://lcorneliussen.github.io",
  base: process.env.BASE_PATH || "/talendos-site",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
});
