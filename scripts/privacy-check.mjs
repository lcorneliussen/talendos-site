import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const allowedOrigins = new Set(["https://talendos.com"]);
const forbiddenElements = ["script", "iframe", "form"];
const trackerPatterns = [
  /googletagmanager/i,
  /google-analytics/i,
  /doubleclick/i,
  /facebook\.net/i,
  /connect\.facebook/i,
  /hotjar/i,
  /matomo/i,
  /plausible\.io/i,
  /\b(?:localStorage|sessionStorage|document\.cookie)\b/i,
];

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    }),
  );
  return nested.flat();
}

const errors = [];
for (const path of await files(root)) {
  if (![".html", ".css"].includes(extname(path))) continue;
  const content = await readFile(path, "utf8");
  const name = relative(root, path);

  if (extname(path) === ".html") {
    if (
      !/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i.test(
        content,
      ) ||
      !content.includes("script-src 'none'") ||
      !content.includes("form-action 'none'")
    ) {
      errors.push(`${name}: missing restrictive Content Security Policy`);
    }

    for (const element of forbiddenElements) {
      if (new RegExp(`<${element}\\b`, "i").test(content)) {
        errors.push(`${name}: contains <${element}>`);
      }
    }

    const resourceURLs = [
      ...content.matchAll(/\b(?:src|srcset|action)=["']([^"']+)["']/gi),
      ...content.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi),
    ].map((match) => match[1]);
    for (const url of resourceURLs) {
      if (/^(?:https?:)?\/\//i.test(url)) {
        const absolute = new URL(url, "https://talendos.com");
        if (allowedOrigins.has(absolute.origin)) continue;
        errors.push(`${name}: loads external resource ${url}`);
      }
    }
  }

  for (const pattern of trackerPatterns) {
    if (pattern.test(content)) errors.push(`${name}: matches ${pattern}`);
  }
}

if (errors.length > 0) {
  console.error(
    "Privacy check failed:\n" + errors.map((e) => `- ${e}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  "Privacy check passed: no scripts, embeds, forms, browser storage, trackers, or external resources.",
);
