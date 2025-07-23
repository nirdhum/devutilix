import { useState } from "react";
import { json2csv, csv2json } from "json-2-csv";

const CSVJSONConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("csv-to-json"); // csv-to-json or json-to-csv
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    delimiter: ",",
    quote: '"',
    escape: '"',
    header: true,
  });

  const convert = async () => {
    try {
      setError("");

      if (!input.trim()) {
        setError("Please provide input to convert");
        return;
      }

      let result;

      if (mode === "csv-to-json") {
        result = await csv2json(input, {
          delimiter: { field: options.delimiter },
          quote: options.quote,
          escape: options.escape,
        });
        setOutput(JSON.stringify(result, null, 2));
      } else {
        const jsonData = JSON.parse(input);
        result = await json2csv(jsonData, {
          delimiter: { field: options.delimiter },
          quote: options.quote,
          escape: options.escape,
        });
        setOutput(result);
      }
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([output], {
      type: mode === "csv-to-json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "csv-to-json" ? "converted.json" : "converted.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CSV ↔ JSON Converter
          </h1>

          <div className="flex items-center space-x-4">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="
                px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            >
              <option value="csv-to-json">CSV → JSON</option>
              <option value="json-to-csv">JSON → CSV</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delimiter
              </label>
              <select
                value={options.delimiter}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, delimiter: e.target.value }))
                }
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                "
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quote Character
              </label>
              <input
                type="text"
                value={options.quote}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, quote: e.target.value }))
                }
                maxLength={1}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                "
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "csv-to-json" ? "CSV Input" : "JSON Input"}
              </label>
              <button
                onClick={() => setInput("")}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "csv-to-json"
                  ? "name,age,city\nJohn,30,New York\nJane,25,London"
                  : '[{"name": "John", "age": 30, "city": "New York"}]'
              }
              rows={15}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                font-mono text-sm resize-none
              "
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "csv-to-json" ? "JSON Output" : "CSV Output"}
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
              rows={15}
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
      </div>
    </div>
  );
};

export default CSVJSONConverter;
