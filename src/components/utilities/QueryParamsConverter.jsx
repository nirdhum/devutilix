import { useState } from "react";

const QueryParamsConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      setError("");
      setOutput("");
      if (!input.trim()) throw new Error("Please enter a URL or query string");

      // Extract query string
      let qs = input.trim();
      const idx = qs.indexOf("?");
      if (idx >= 0) qs = qs.slice(idx + 1);
      // Remove leading '?'
      qs = qs.replace(/^\?/, "");

      const params = new URLSearchParams(qs);
      const obj = {};
      for (const key of new Set(params.keys())) {
        const values = params.getAll(key);
        // If multiple values, keep array; else single string
        obj[key] = values.length > 1 ? values : values[0];
      }

      setOutput(JSON.stringify(obj, null, 2));
    } catch (e) {
      setError(e.message);
    }
  };

  const loadSample = () => {
    setInput("https://example.com/page?foo=1&foo=2&bar=baz&empty=");
    setError("");
    setOutput("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      /* ignore */
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query-params.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Query Params → JSON
        </h1>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL or Query String
          </label>
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. https://.../?foo=1&bar=two"
            className="w-full font-mono text-sm p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={convert}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Convert
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

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                JSON Output
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyOutput}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="font-mono text-sm p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryParamsConverter;
