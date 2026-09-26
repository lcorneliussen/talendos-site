import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://talendos.com",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
});
