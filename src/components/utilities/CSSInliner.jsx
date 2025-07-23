import { useState } from "react";
import juice from "juice";

const CSSInliner = () => {
  const [htmlInput, setHtmlInput] = useState("");
  const [cssInput, setCssInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    preserveMediaQueries: true,
    preserveKeyframes: true,
    removeStyleTags: true,
    preservePseudos: false,
    xmlMode: false,
  });

  const inlineCSS = () => {
    try {
      setError("");

      if (!htmlInput.trim()) {
        throw new Error("Please provide HTML input");
      }

      let html = htmlInput;

      // If separate CSS is provided, combine it
      if (cssInput.trim()) {
        html = `<style>${cssInput}</style>${htmlInput}`;
      }

      const inlined = juice(html, {
        preserveMediaQueries: options.preserveMediaQueries,
        preserveKeyframes: options.preserveKeyframes,
        removeStyleTags: options.removeStyleTags,
        preservePseudos: options.preservePseudos,
        xmlMode: options.xmlMode,
        webResources: {
          relativeTo: "",
        },
      });

      setOutput(inlined);
    } catch (err) {
      setError(`Inlining failed: ${err.message}`);
      setOutput("");
    }
  };

  const loadSample = () => {
    setHtmlInput(`<!DOCTYPE html>
<html>
<head>
    <style>
        .header { background-color: #f0f0f0; padding: 20px; }
        .content { font-family: Arial, sans-serif; color: #333; }
        .button { background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        @media (max-width: 600px) {
            .header { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Email Newsletter</h1>
    </div>
    <div class="content">
        <p>This is a sample email template.</p>
        <a href="#" class="button">Click Here</a>
    </div>
</body>
</html>`);
    setCssInput("");
    setError("");
    setOutput("");
  };

  const loadSeparateExample = () => {
    setHtmlInput(`<div class="container">
    <h1 class="title">Welcome!</h1>
    <p class="description">This is an email with external CSS.</p>
    <a href="#" class="cta-button">Get Started</a>
</div>`);

    setCssInput(`.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.title { color: #2c3e50; font-size: 24px; margin-bottom: 10px; }
.description { color: #7f8c8d; line-height: 1.6; }
.cta-button { 
    display: inline-block; 
    background: #3498db; 
    color: white; 
    padding: 12px 24px; 
    text-decoration: none; 
    border-radius: 4px; 
}`);
    setError("");
    setOutput("");
  };

  const clearAll = () => {
    setHtmlInput("");
    setCssInput("");
    setOutput("");
    setError("");
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inlined-email.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewEmail = () => {
    const newWindow = window.open("", "_blank");
    newWindow.document.write(output);
    newWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          CSS Inliner for Email
        </h1>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Inlining Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "preserveMediaQueries", label: "Preserve Media Queries" },
              { key: "preserveKeyframes", label: "Preserve Keyframes" },
              { key: "removeStyleTags", label: "Remove Style Tags" },
              { key: "preservePseudos", label: "Preserve Pseudo Selectors" },
              { key: "xmlMode", label: "XML Mode" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* HTML Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              HTML Input
            </label>
            <textarea
              rows={15}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Enter HTML with embedded CSS or just HTML..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CSS Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CSS Input (Optional)
            </label>
            <textarea
              rows={15}
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              placeholder="Enter external CSS to inline..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={inlineCSS}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Inline CSS
          </button>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-500"
          >
            Load Embedded Sample
          </button>
          <button
            onClick={loadSeparateExample}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            Load Separate CSS Sample
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            Clear All
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Inlined HTML Output
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyOutput}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Download
                </button>
                <button
                  onClick={previewEmail}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Preview
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={output}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {output.length}
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">
                  Characters
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {Math.round((output.length / 1024) * 100) / 100}KB
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">
                  Size
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {(output.match(/style="/g) || []).length}
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">
                  Inline Styles
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Email CSS Best Practices
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>• Use table-based layouts for better compatibility</li>
              <li>• Inline styles work best across email clients</li>
              <li>• Keep media queries in &lt;style&gt; tags</li>
            </ul>
            <ul className="space-y-1">
              <li>• Avoid CSS Grid and Flexbox in emails</li>
              <li>• Use web-safe fonts and fallbacks</li>
              <li>• Test across multiple email clients</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSInliner;
