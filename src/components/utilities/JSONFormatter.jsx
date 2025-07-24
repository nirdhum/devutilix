import { useState } from "react";

const JSONFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("prettify"); // 'prettify' or 'minify'
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [validationInfo, setValidationInfo] = useState(null);

  const validateJSON = (text) => {
    if (!text.trim()) {
      throw new Error("Please enter JSON to validate");
    }

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      // Extract line and column info from error message
      const match = e.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : 0;

      // Calculate line and column
      const lines = text.substring(0, position).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      throw new Error(
        `JSON Parse Error at line ${line}, column ${column}: ${e.message}`
      );
    }
  };

  const sortObjectKeys = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
          result[key] = sortObjectKeys(obj[key]);
          return result;
        }, {});
    }
    return obj;
  };

  const analyzeJSON = (obj) => {
    const analyze = (value, depth = 0) => {
      const info = { depth, type: typeof value };

      if (Array.isArray(value)) {
        info.type = "array";
        info.length = value.length;
        info.maxDepth = Math.max(
          depth,
          ...value.map((item) => analyze(item, depth + 1).maxDepth)
        );
      } else if (value !== null && typeof value === "object") {
        info.type = "object";
        info.keys = Object.keys(value).length;
        info.maxDepth = Math.max(
          depth,
          ...Object.values(value).map((val) => analyze(val, depth + 1).maxDepth)
        );
      } else {
        info.maxDepth = depth;
      }

      return info;
    };

    const analysis = analyze(obj);
    const jsonString = JSON.stringify(obj);

    return {
      type: analysis.type,
      size: new Blob([jsonString]).size,
      characters: jsonString.length,
      maxDepth: analysis.maxDepth,
      keys: analysis.keys || 0,
      length: analysis.length || 0,
    };
  };

  const processJSON = () => {
    try {
      setError("");

      const parsed = validateJSON(input);
      const processedData = sortKeys ? sortObjectKeys(parsed) : parsed;

      let result;
      if (mode === "prettify") {
        result = JSON.stringify(processedData, null, indent);
      } else {
        result = JSON.stringify(processedData);
      }

      setOutput(result);
      setValidationInfo(analyzeJSON(parsed));
    } catch (err) {
      setError(err.message);
      setOutput("");
      setValidationInfo(null);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadSample = () => {
    const sample = `{
  "name": "Dev Utilities Suite",
  "version": "1.0.0",
  "description": "A comprehensive collection of developer tools",
  "author": {
    "name": "Nirdhum",
    "website": "https://nirdhum.in",
    "company": "Veridicus Lab"
  },
  "features": [
    "JSON formatting",
    "Text conversion",
    "Password generation",
    "Base64 encoding",
    "Color conversion"
  ],
  "stats": {
    "totalUtilities": 31,
    "categories": 9,
    "completionRate": "74%"
  },
  "settings": {
    "darkMode": true,
    "autoSave": false,
    "notifications": {
      "enabled": true,
      "types": ["success", "error"]
    }
  },
  "metadata": {
    "created": "2025-01-24",
    "lastUpdated": "2025-01-24T11:21:00Z",
    "isOpenSource": true,
    "license": "MIT"
  }
}`;
    setInput(sample);
    setOutput("");
    setError("");
    setValidationInfo(null);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setValidationInfo(null);
  };

  const swapInputOutput = () => {
    if (output) {
      setInput(output);
      setOutput("");
      setValidationInfo(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          JSON Formatter / Validator
        </h1>

        {/* Mode Selection */}
        <div className="mb-4">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            <button
              onClick={() => setMode("prettify")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "prettify"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Prettify
            </button>
            <button
              onClick={() => setMode("minify")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "minify"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Minify
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4 mb-6">
          {mode === "prettify" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Indent Size
              </label>
              <input
                type="number"
                min="0"
                max="8"
                value={indent}
                onChange={(e) => setIndent(parseInt(e.target.value) || 2)}
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
              />
            </div>
          )}

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sort object keys
              </span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={processJSON}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {mode === "prettify" ? "Format JSON" : "Minify JSON"}
          </button>
          <button
            onClick={swapInputOutput}
            disabled={!output}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⇄ Swap
          </button>
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
        </div>

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Input JSON
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Formatted JSON
              </label>
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {output.length} characters
                </span>
                {output && (
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm font-mono">
              {error}
            </p>
          </div>
        )}

        {/* Validation Info */}
        {validationInfo && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
              ✅ Valid JSON
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-800 dark:text-green-300">
              <div>
                <strong>Type:</strong> {validationInfo.type}
              </div>
              <div>
                <strong>Size:</strong> {validationInfo.size} bytes
              </div>
              <div>
                <strong>Characters:</strong> {validationInfo.characters}
              </div>
              <div>
                <strong>Max Depth:</strong> {validationInfo.maxDepth}
              </div>
              {validationInfo.keys > 0 && (
                <div>
                  <strong>Object Keys:</strong> {validationInfo.keys}
                </div>
              )}
              {validationInfo.length > 0 && (
                <div>
                  <strong>Array Length:</strong> {validationInfo.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            JSON Formatter Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Validation:</strong> Real-time JSON syntax checking
              </li>
              <li>
                • <strong>Formatting:</strong> Pretty-print with custom
                indentation
              </li>
              <li>
                • <strong>Minification:</strong> Remove whitespace for compact
                JSON
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Key Sorting:</strong> Alphabetically sort object keys
              </li>
              <li>
                • <strong>Analysis:</strong> JSON structure and size information
              </li>
              <li>
                • <strong>Error Details:</strong> Line and column error
                reporting
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONFormatter;
