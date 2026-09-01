import { utilities, categories } from "../../data/utilities";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devutilix.com";

  let content = `# DevutiliX - Comprehensive LLM Knowledge Base

> Complete directory of all ${utilities.length} developer utilities across ${categories.length} categories. Running 100% locally in browser memory.

## Architectural Model
Every utility in DevutiliX is designed to run purely on the client side using standard Web APIs, Web Cryptography API, Web Workers, and WebAssembly. No sensitive keys, JWT tokens, certificates, passwords, database credentials, or proprietary source code leave the client's device.

---

## Complete Tools Directory
`;

  categories.forEach((cat) => {
    const catTools = utilities.filter((u) => u.category === cat);
    content += `\n### Category: ${cat} (${catTools.length} tools)\n\n`;

    catTools.forEach((tool) => {
      content += `#### ${tool.title}\n`;
      content += `- URL: ${baseUrl}/utility/${tool.id}\n`;
      content += `- Slug: ${tool.id}\n`;
      content += `- Description: ${tool.description}\n`;
      content += `- Tags: ${tool.tags.join(", ")}\n`;
      content += `- Component: ${tool.component}\n\n`;
    });
  });

  content += `---
## Site Navigation
- Home: ${baseUrl}/
- About: ${baseUrl}/about
- Privacy Policy: ${baseUrl}/privacy
- Standard LLMs Manifest: ${baseUrl}/llms.txt
- Sitemap: ${baseUrl}/sitemap.xml
- Robots: ${baseUrl}/robots.txt
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
