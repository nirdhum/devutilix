import { utilities, categories } from "../../data/utilities";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devutilix.com";

  let content = `# DevutiliX

> Fast, privacy-focused collection of ${utilities.length}+ developer utilities running 100% locally in your browser.

DevutiliX is an open-source suite of developer tools built with Next.js and React 19. All operations—including cryptography, image processing, code formatting, hashing, and conversions—execute purely inside client-side browser memory. No source code, secrets, or inputs are ever transmitted to or stored on any server.

## Overview & Architecture
- Website: ${baseUrl}
- Total Utilities: ${utilities.length}
- Categories: ${categories.length}
- Execution: 100% Client-Side Web APIs & WebAssembly
- Privacy: Zero server processing, zero tracking of user inputs

## Utilities by Category
`;

  categories.forEach((cat) => {
    const catTools = utilities.filter((u) => u.category === cat);
    content += `\n### ${cat}\n`;
    catTools.forEach((tool) => {
      content += `- [${tool.title}](${baseUrl}/utility/${tool.id}): ${tool.description}\n`;
    });
  });

  content += `
## Key Documents & Additional Context
- [Full LLM Inventory](${baseUrl}/llms-full.txt): Comprehensive inventory with search tags and component descriptors.
- [About DevutiliX](${baseUrl}/about): Information on mission, technology stack, and open-source foundation.
- [Privacy Policy](${baseUrl}/privacy): Complete breakdown of client-side privacy architecture.
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
