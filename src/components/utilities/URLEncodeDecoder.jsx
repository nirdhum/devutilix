import { useState } from "react";

const URLEncodeDecoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode"); // 'encode' or 'decode'
  const [error, setError] = useState("");
  const [encoding, setEncoding] = useState("standard"); // 'standard' or 'component'

  const encodeURL = (text, encodingType) => {
    if (encodingType === "component") {
      // encodeURIComponent - encodes all special characters
      return encodeURIComponent(text);
    } else {
      // encodeURI - preserves :/?#[]@!$&'()*+,;= characters
      return encodeURI(text);
    }
  };

  const decodeURL = (text) => {
    try {
      // Try decodeURIComponent first (more comprehensive)
      return decodeURIComponent(text);
    } catch {
      try {
        // Fallback to decodeURI
        return decodeURI(text);
      } catch {
        throw new Error("Invalid URL encoding");
      }
    }
  };

  const processInput = () => {
    try {
      setError("");

      if (!input.trim()) {
        setError("Please enter text to process");
        setOutput("");
        return;
      }

      let result;
      if (mode === "encode") {
        result = encodeURL(input, encoding);
      } else {
        result = decodeURL(input);
      }

      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadSample = () => {
    if (mode === "encode") {
      setInput(
        "https://example.com/search?q=hello world&category=tech&special=@#$%"
      );
    } else {
      setInput(
        "https%3A//example.com/search%3Fq%3Dhello%20world%26category%3Dtech%26special%3D%40%23%24%25"
      );
    }
    setError("");
    setOutput("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const swapMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          URL Encode/Decode
        </h1>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            <button
              onClick={() => setMode("encode")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "encode"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "decode"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        {/* Encoding Type (only for encode mode) */}
        {mode === "encode" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Encoding Type
            </label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">
                encodeURI (preserves URL structure)
              </option>
              <option value="component">
                encodeURIComponent (encodes all special chars)
              </option>
            </select>
          </div>
        )}

        {/* Input Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {mode === "encode" ? "Text to Encode" : "URL to Decode"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter URL or text to encode..."
                : "Enter encoded URL to decode..."
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={processInput}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
          <button
            onClick={swapMode}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            ⇄ Swap Mode
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
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "encode" ? "Encoded URL" : "Decoded Text"}
              </label>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {input.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Input Length
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {output.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Output Length
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {((output.length / input.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Size Ratio
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            URL Encoding Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>encodeURI:</strong> Preserves URL structure (:/?#[]@)
              </li>
              <li>
                • <strong>encodeURIComponent:</strong> Encodes all special
                characters
              </li>
              <li>
                • <strong>Use cases:</strong> Query parameters, form data, API
                calls
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Common chars:</strong> Space becomes %20
              </li>
              <li>
                • <strong>Special chars:</strong> @#$%^&*() get encoded
              </li>
              <li>
                • <strong>Safe chars:</strong> A-Z, a-z, 0-9, -_.~ stay
                unchanged
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLEncodeDecoder;
