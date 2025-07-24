import { useState, useEffect, useCallback } from "react";
import { marked } from "marked";

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState("");
  const [html, setHtml] = useState("");
  const [viewMode, setViewMode] = useState("split"); // 'split', 'editor', 'preview'
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  // Configure marked options for security and features
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true, // GitHub Flavored Markdown
      headerIds: true,
      mangle: false,
      sanitize: false, // We'll handle sanitization if needed
    });
  }, []);

  // ✅ Fixed: Wrap processMarkdown with useCallback
  const processMarkdown = useCallback(() => {
    try {
      setError("");

      if (!markdown.trim()) {
        setHtml("");
        setStats(null);
        return;
      }

      const htmlOutput = marked(markdown);
      setHtml(htmlOutput);

      // Calculate stats
      const wordCount = markdown
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const charCount = markdown.length;
      const charCountNoSpaces = markdown.replace(/\s/g, "").length;
      const lineCount = markdown.split("\n").length;
      const headingCount = (markdown.match(/^#{1,6}\s/gm) || []).length;
      const linkCount = (markdown.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [])
        .length;
      const imageCount = (markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [])
        .length;
      const codeBlockCount = (markdown.match(/``````/g) || []).length;
      const tableCount = (markdown.match(/\|.*\|/g) || []).length > 0 ? 1 : 0;

      setStats({
        words: wordCount,
        characters: charCount,
        charactersNoSpaces: charCountNoSpaces,
        lines: lineCount,
        headings: headingCount,
        links: linkCount,
        images: imageCount,
        codeBlocks: codeBlockCount,
        tables: tableCount,
        readingTime: Math.ceil(wordCount / 200), // Average reading speed
      });
    } catch (err) {
      setError(err.message);
      setHtml("");
      setStats(null);
    }
  }, [markdown]); // ✅ Include markdown as dependency

  // ✅ Fixed: Include processMarkdown in dependency array
  useEffect(() => {
    processMarkdown();
  }, [processMarkdown]);

  const copyToClipboard = async (content, type = "text") => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error(`Failed to copy ${type}:`, err);
    }
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    const sample = `# Markdown Preview Demo

Welcome to the **Markdown Preview** utility! This tool provides live preview of your markdown content.

## Features

- ✅ **Live Preview** - See changes in real-time
- ✅ **GitHub Flavored Markdown** support
- ✅ **Syntax Highlighting** for code blocks
- ✅ **Export Options** - HTML, PDF ready
- ✅ **Statistics** - Word count, reading time, etc.

## Text Formatting

You can make text **bold**, *italic*, or ***both***. You can also ~~strikethrough~~ text.

### Code Examples

Inline code: \`console.log('Hello World!')\`

\`\`\`javascript
// Code block example
function greetUser(name) {
  return \`Hello, \${name}! Welcome to our markdown editor.\`;
}

const user = "Developer";
console.log(greetUser(user));
\`\`\`

\`\`\`python
# Python example
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(f"Fibonacci(10) = {calculate_fibonacci(10)}")
\`\`\`

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

### Task List
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

## Links and Images

[Visit our website](https://nirdhum.in) for more tools.

![Sample Image](https://via.placeholder.com/400x200/3B82F6/ffffff?text=Sample+Image)

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Live Preview | ✅ Done | High |
| Export HTML | ✅ Done | Medium |
| Statistics | ✅ Done | Low |
| Dark Mode | ✅ Done | High |

## Blockquotes

> "The best way to predict the future is to create it."
> 
> — Peter Drucker

## Horizontal Rule

---

## Math (if supported)

Inline math: $E = mc^2$

Block math:
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

---

*Happy Markdown editing!* 🚀`;

    setMarkdown(sample);
  };

  const clearAll = () => {
    setMarkdown("");
    setHtml("");
    setStats(null);
    setError("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Markdown Preview
        </h1>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            <button
              onClick={() => setViewMode("editor")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                viewMode === "editor"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-500"
          >
            Load Sample
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
          {markdown && (
            <>
              <button
                onClick={() => copyToClipboard(markdown, "markdown")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                Copy Markdown
              </button>
              <button
                onClick={() => copyToClipboard(html, "HTML")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                Copy HTML
              </button>
              <button
                onClick={() =>
                  downloadFile(markdown, "document.md", "text/markdown")
                }
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                Download MD
              </button>
              <button
                onClick={() => downloadFile(html, "document.html", "text/html")}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                Download HTML
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Editor/Preview */}
        <div
          className={`grid gap-6 ${
            viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* Editor */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Markdown Editor
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {markdown.length} characters
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your Markdown here..."
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Live Preview
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {html.length} HTML characters
                </span>
              </div>
              <div
                className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-auto prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
                style={{
                  minHeight: "24rem", // h-96 equivalent
                }}
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              Document Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm text-blue-800 dark:text-blue-300">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.words}
                </div>
                <div>Words</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.characters}
                </div>
                <div>Characters</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.lines}
                </div>
                <div>Lines</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.readingTime}
                </div>
                <div>Min Read</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.headings}
                </div>
                <div>Headings</div>
              </div>
              {stats.links > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {stats.links}
                  </div>
                  <div>Links</div>
                </div>
              )}
              {stats.images > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {stats.images}
                  </div>
                  <div>Images</div>
                </div>
              )}
              {stats.codeBlocks > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {stats.codeBlocks}
                  </div>
                  <div>Code Blocks</div>
                </div>
              )}
              {stats.tables > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {stats.tables}
                  </div>
                  <div>Tables</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Markdown Features Supported
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Headers:</strong> # ## ### #### ##### ######
              </li>
              <li>
                • <strong>Emphasis:</strong> **bold**, *italic*,
                ~~strikethrough~~
              </li>
              <li>
                • <strong>Lists:</strong> Ordered, unordered, and task lists
              </li>
              <li>
                • <strong>Links:</strong> [text](url) and reference links
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Code:</strong> Inline `code` and ``````
              </li>
              <li>
                • <strong>Tables:</strong> GitHub-style table formatting
              </li>
              <li>
                • <strong>Quotes:</strong> {">"} Blockquotes
              </li>
              <li>
                • <strong>Images:</strong> ![alt](src) image embedding
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
