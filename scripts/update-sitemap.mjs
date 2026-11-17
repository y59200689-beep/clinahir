#!/usr/bin/env node
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const programmaticUrls = JSON.parse(
  readFileSync(path.join(publicDir, "programmatic-urls.json"), "utf-8")
);

const today = new Date().toISOString().split("T")[0];

// Generated location pages are noindex pending editorial review. Medical guides
// also require clinical/legal review before inclusion in the business sitemap.
const allUrls = [{ loc: "https://clinahir.tech/", priority: "1.0", changefreq: "weekly" }];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls
  .map(
    entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf-8");
console.log(`Updated sitemap.xml with ${allUrls.length} total URLs!`);

