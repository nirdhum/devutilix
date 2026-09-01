"use client";

import { useState, useMemo } from "react";

const SAMPLE_HTML = `<div class="card" style="background-color: #ffffff; border-radius: 8px; padding: 20px;">
  <!-- User Profile Header -->
  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="Avatar" class="avatar">
  <h2 class="title">Jane Doe</h2>
  <p class="bio">Senior Full-Stack Developer & UI Architect.</p>
  <form action="/submit" method="POST" enctype="multipart/form-data">
    <label for="email-input">Email Address</label>
    <input type="email" id="email-input" class="form-control" placeholder="jane@example.com" autocomplete="email" required>
    <br>
    <button type="submit" class="btn btn-primary" tabindex="1">Save Profile</button>
  </form>
</div>`;

function convertHtmlToJsx(html) {
  let jsx = html;

  // 1. Comments <!-- ... --> into {/* ... */}
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}");

  // 2. Attributes replacement
  const attrMap = [
    [/\bclass=/g, "className="],
    [/\bfor=/g, "htmlFor="],
    [/\btabindex=/g, "tabIndex="],
    [/\bautocomplete=/g, "autoComplete="],
    [/\bautofocus\b/g, "autoFocus"],
    [/\breadonly\b/g, "readOnly"],
    [/\bmaxlength=/g, "maxLength="],
    [/\bminlength=/g, "minLength="],
    [/\bcolspan=/g, "colSpan="],
    [/\browspan=/g, "rowSpan="],
    [/\benctype=/g, "encType="],
    [/\bnovalidate\b/g, "noValidate"],
    [/\bsrcset=/g, "srcSet="],
    [/\bviewbox=/g, "viewBox="],
    [/\bstroke-width=/g, "strokeWidth="],
    [/\bstroke-linecap=/g, "strokeLinecap="],
    [/\bstroke-linejoin=/g, "strokeLinejoin="],
    [/\bfill-rule=/g, "fillRule="],
    [/\bclip-rule=/g, "clipRule="],
  ];

  for (const [pattern, replacement] of attrMap) {
    jsx = jsx.replace(pattern, replacement);
  }

  // 3. Inline style="prop: val; prop2: val;" -> style={{ prop: "val", prop2: "val" }}
  jsx = jsx.replace(/\bstyle="([^"]*)"/g, (match, styleContent) => {
    const rules = styleContent.split(";").map((r) => r.trim()).filter(Boolean);
    const objProps = rules.map((r) => {
      const colon = r.indexOf(":");
      if (colon === -1) return "";
      const rawKey = r.slice(0, colon).trim();
      const rawVal = r.slice(colon + 1).trim();

      // CamelCase the CSS key (e.g. background-color -> backgroundColor)
      const camelKey = rawKey.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      return `${camelKey}: "${rawVal.replace(/"/g, '\\"')}"`;
    }).filter(Boolean);

    return `style={{ ${objProps.join(", ")} }}`;
  });

  // 4. Void self-closing tags: <img ...>, <input ...>, <br>, <hr>
  const voidTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];
  for (const tag of voidTags) {
    const regex = new RegExp(`<(${tag}\\b[^>]*)(?<!/)>`, "gi");
    jsx = jsx.replace(regex, "<$1 />");
  }

  return jsx;
}

function convertHtmlToMarkdown(html) {
  let md = html;

  // Headings
  md = md.replace(/<h1>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<h4>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");

  // Bold & Italic
  md = md.replace(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  md = md.replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");

  // Links & Images
  md = md.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<img\s+[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img\s+[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, "![$1]($2)");

  // Code
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`");

  // Paragraphs & breaks
  md = md.replace(/<p>([\s\S]*?)<\/p>/gi, "\n$1\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Lists
  md = md.replace(/<li>([\s\S]*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?(?:ul|ol)>/gi, "");

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

export default function HTMLToJSX() {
  const [htmlInput, setHtmlInput] = useState(SAMPLE_HTML);
  const [outputMode, setOutputMode] = useState("jsx"); // jsx | md
  const [copied, setCopied] = useState(false);

  const convertedOutput = useMemo(() => {
    if (!htmlInput.trim()) return "";
    if (outputMode === "jsx") {
      return convertHtmlToJsx(htmlInput);
    } else {
      return convertHtmlToMarkdown(htmlInput);
    }
  }, [htmlInput, outputMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>HTML ➔ React JSX & Markdown Converter</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Transform standard HTML into valid React JSX with self-closing tags, camelCase style objects, and className props.
            </p>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setOutputMode("jsx")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                outputMode === "jsx"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              React JSX
            </button>
            <button
              onClick={() => setOutputMode("md")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                outputMode === "md"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              Markdown
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HTML Input (Left) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Raw HTML Input
            </span>
            <button
              onClick={() => setHtmlInput("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="Paste HTML markup here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* JSX / Markdown Output (Right) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {outputMode === "jsx" ? "Clean React JSX Output" : "Markdown Output"}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
          <textarea
            readOnly
            rows={18}
            value={convertedOutput}
            placeholder="Converted output will appear here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
