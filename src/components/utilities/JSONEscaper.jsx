"use client";

import { useState, useMemo } from "react";

const SAMPLE_RAW = JSON.stringify(
  {
    database: {
      host: "localhost",
      port: 5432,
      ssl: true,
    },
    message: "Welcome to DevutiliX!\nEnjoy fast local utilities.",
    tags: ["security", "developer", "offline"],
  },
  null,
  2
);

export default function JSONEscaper() {
  const [mode, setMode] = useState("escape"); // escape | unescape | b64encode | b64decode
  const [inputVal, setInputVal] = useState(SAMPLE_RAW);
  const [copied, setCopied] = useState(false);

  const { outputVal, error } = useMemo(() => {
    try {
      const clean = inputVal.trim();
      if (!clean) return { outputVal: "", error: null };

      if (mode === "escape") {
        // Stringify JSON string representation
        const escaped = JSON.stringify(clean);
        // Remove surrounding outer quotes for convenient embedding
        return { outputVal: escaped.slice(1, -1), error: null };
      } else if (mode === "unescape") {
        // Wrap in quotes and parse
        let unwrapped = clean;
        if (!unwrapped.startsWith('"')) unwrapped = `"${unwrapped}"`;
        const unescapedStr = JSON.parse(unwrapped);

        // Pretty print if valid JSON
        try {
          const parsedJson = JSON.parse(unescapedStr);
          return { outputVal: JSON.stringify(parsedJson, null, 2), error: null };
        } catch {
          return { outputVal: unescapedStr, error: null };
        }
      } else if (mode === "b64encode") {
        const b64 = btoa(unescape(encodeURIComponent(clean)));
        return { outputVal: b64, error: null };
      } else if (mode === "b64decode") {
        const decodedStr = decodeURIComponent(escape(atob(clean)));
        try {
          const parsed = JSON.parse(decodedStr);
          return { outputVal: JSON.stringify(parsed, null, 2), error: null };
        } catch {
          return { outputVal: decodedStr, error: null };
        }
      }
      return { outputVal: "", error: null };
    } catch (err) {
      return { outputVal: "", error: err.message || "Failed to process text" };
    }
  }, [mode, inputVal]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputVal);
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
              <span>JSON String Escaper & Unescaper</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Escape JSON payloads for .env files and Docker CMD strings, or unescape double-escaped logs into formatted JSON.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 dark:border-gray-600 p-1 text-xs font-semibold bg-gray-50 dark:bg-gray-900">
            {[
              { id: "escape", label: "Escape JSON" },
              { id: "unescape", label: "Unescape JSON" },
              { id: "b64encode", label: "Base64 Encode" },
              { id: "b64decode", label: "Base64 Decode" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Input String
            </span>
            <button
              onClick={() => setInputVal("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Paste text or JSON here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Processed Output
            </span>
            <button
              onClick={handleCopy}
              disabled={!outputVal}
              className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors disabled:opacity-50"
            >
              {copied ? "✓ Copied!" : "Copy Result"}
            </button>
          </div>
          <textarea
            readOnly
            rows={18}
            value={outputVal}
            placeholder="Processed output will appear here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
