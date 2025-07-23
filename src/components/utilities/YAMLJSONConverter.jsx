import { useState } from "react";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";

const YAMLJSONConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("yaml-to-json"); // yaml-to-json or json-to-yaml
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    indent: 2,
    sortKeys: false,
    lineWidth: 80,
    minify: false,
  });

  const convert = () => {
    try {
      setError("");

      if (!input.trim()) {
        setError("Please provide input to convert");
        return;
      }

      let result;

      if (mode === "yaml-to-json") {
        // Parse YAML to JavaScript object, then stringify to JSON
        const yamlObject = parseYAML(input);
        result = JSON.stringify(
          yamlObject,
          null,
          options.minify ? 0 : options.indent
        );
      } else {
        // Parse JSON to JavaScript object, then stringify to YAML
        const jsonObject = JSON.parse(input);
        result = stringifyYAML(jsonObject, {
          indent: options.indent,
          sortKeys: options.sortKeys,
          lineWidth: options.lineWidth,
        });
      }

      setOutput(result);
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
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

  const downloadAsFile = () => {
    const blob = new Blob([output], {
      type: mode === "yaml-to-json" ? "application/json" : "text/yaml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "yaml-to-json" ? "converted.json" : "converted.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    if (mode === "yaml-to-json") {
      setInput(`# Sample YAML configuration
app:
  name: "Dev Utilities"
  version: "1.0.0"
  features:
    - "CSV/JSON Converter"
    - "Hash Generator"
    - "UUID Generator"
  settings:
    theme: "auto"
    port: 3000
    debug: true
database:
  host: "localhost"
  port: 5432
  name: "myapp"
  ssl: false`);
    } else {
      setInput(`{
  "app": {
    "name": "Dev Utilities",
    "version": "1.0.0",
    "features": [
      "CSV/JSON Converter",
      "Hash Generator",
      "UUID Generator"
    ],
    "settings": {
      "theme": "auto",
      "port": 3000,
      "debug": true
    }
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "ssl": false
  }
}`);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const formatInput = () => {
    try {
      if (mode === "yaml-to-json") {
        // Re-parse and re-stringify YAML for consistent formatting
        const parsed = parseYAML(input);
        const formatted = stringifyYAML(parsed, {
          indent: options.indent,
          sortKeys: options.sortKeys,
          lineWidth: options.lineWidth,
        });
        setInput(formatted);
      } else {
        // Format JSON with proper indentation
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, options.indent);
        setInput(formatted);
      }
      setError("");
    } catch (err) {
      setError(`Formatting failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            YAML ↔ JSON Converter
          </h1>

          <div className="flex items-center space-x-4">
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setOutput("");
                setError("");
              }}
              className="
                px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            >
              <option value="yaml-to-json">YAML → JSON</option>
              <option value="json-to-yaml">JSON → YAML</option>
            </select>
          </div>
        </div>

        {/* Options Panel */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Conversion Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Indentation
              </label>
              <select
                value={options.indent}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    indent: parseInt(e.target.value),
                  }))
                }
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                "
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Line Width
              </label>
              <select
                value={options.lineWidth}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    lineWidth: parseInt(e.target.value),
                  }))
                }
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                "
              >
                <option value={60}>60 chars</option>
                <option value={80}>80 chars</option>
                <option value={120}>120 chars</option>
                <option value={0}>No limit</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.sortKeys}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      sortKeys: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sort Keys
                </span>
              </label>
            </div>

            {mode === "yaml-to-json" && (
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.minify}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        minify: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Minify JSON
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "yaml-to-json" ? "YAML Input" : "JSON Input"}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={loadSampleData}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Load Sample
                </button>
                <button
                  onClick={formatInput}
                  disabled={!input.trim()}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 disabled:opacity-50"
                >
                  Format
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "yaml-to-json"
                  ? `# Enter YAML here
name: "Example"
items:
  - value: 1
  - value: 2`
                  : `{
  "name": "Example",
  "items": [
    {"value": 1},
    {"value": 2}
  ]
}`
              }
              rows={18}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                font-mono text-sm resize-none
              "
            />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "yaml-to-json" ? "JSON Output" : "YAML Output"}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!output}
                  className="
                    px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 
                    text-gray-700 dark:text-gray-300 rounded
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  disabled={!output}
                  className="
                    px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 
                    text-gray-700 dark:text-gray-300 rounded
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              rows={18}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                font-mono text-sm resize-none
              "
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={convert}
            disabled={!input.trim()}
            className="
              px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Convert
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            YAML vs JSON Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>YAML:</strong> Human-readable data serialization
              </li>
              <li>
                • <strong>Indentation:</strong> Uses spaces (not tabs)
              </li>
              <li>
                • <strong>Comments:</strong> Supports # comments
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>JSON:</strong> Lightweight data interchange format
              </li>
              <li>
                • <strong>Syntax:</strong> JavaScript object notation
              </li>
              <li>
                • <strong>Parsing:</strong> Faster to parse than YAML
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YAMLJSONConverter;
