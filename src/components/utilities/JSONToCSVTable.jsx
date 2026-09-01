"use client";

import { useState, useMemo } from "react";

const SAMPLE_JSON = JSON.stringify(
  [
    {
      id: 101,
      name: "Acme Corp",
      contact: { email: "contact@acme.com", phone: "+1-555-0100" },
      plan: "Enterprise",
      mrr: 2400,
      active: true,
    },
    {
      id: 102,
      name: "Global Tech",
      contact: { email: "hello@globaltech.io", phone: "+1-555-0101" },
      plan: "Pro",
      mrr: 490,
      active: true,
    },
    {
      id: 103,
      name: "Starlight Labs",
      contact: { email: "info@starlight.dev", phone: "+1-555-0102" },
      plan: "Starter",
      mrr: 99,
      active: false,
    },
  ],
  null,
  2
);

function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k]) &&
      Object.keys(obj[k]).length > 0
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k];
    }
    return acc;
  }, {});
}

function escapeCsvCell(val, delimiter) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function JSONToCSVTable() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [delimiter, setDelimiter] = useState(",");
  const [activeTab, setActiveTab] = useState("table"); // table | raw
  const [copied, setCopied] = useState(false);

  const { rows, headers, csvText, error } = useMemo(() => {
    try {
      const clean = jsonInput.trim();
      if (!clean) return { rows: [], headers: [], csvText: "", error: null };

      let parsed = JSON.parse(clean);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
      if (parsed.length === 0) {
        return { rows: [], headers: [], csvText: "", error: null };
      }

      // Flatten every object in the array
      const flatRows = parsed.map((item) =>
        typeof item === "object" && item !== null ? flattenObject(item) : { value: item }
      );

      // Collect all unique column keys
      const headerSet = new Set();
      for (const r of flatRows) {
        Object.keys(r).forEach((k) => headerSet.add(k));
      }
      const allHeaders = Array.from(headerSet);

      // Build CSV text
      const csvLines = [
        allHeaders.map((h) => escapeCsvCell(h, delimiter)).join(delimiter),
      ];

      for (const r of flatRows) {
        const line = allHeaders
          .map((h) => escapeCsvCell(r[h], delimiter))
          .join(delimiter);
        csvLines.push(line);
      }

      return {
        rows: flatRows,
        headers: allHeaders,
        csvText: csvLines.join("\n"),
        error: null,
      };
    } catch (err) {
      return { rows: [], headers: [], csvText: "", error: err.message || "Invalid JSON array" };
    }
  }, [jsonInput, delimiter]);

  const handleCopy = () => {
    navigator.clipboard.writeText(csvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>JSON to CSV & Spreadsheet Table</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Flatten nested JSON objects, preview in an interactive spreadsheet grid, and export to CSV.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!csvText}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer disabled:opacity-50"
            >
              ⬇ Download .csv
            </button>
            <button
              onClick={handleCopy}
              disabled={!csvText}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm disabled:opacity-50"
            >
              {copied ? "✓ Copied!" : "Copy CSV"}
            </button>
          </div>
        </div>

        {/* Delimiter & Tabs Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold">Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-2.5 py-1 font-semibold rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="&#9;">Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                activeTab === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              }`}
            >
              Grid View ({rows.length})
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                activeTab === "raw"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              }`}
            >
              Raw CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* JSON Input (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              JSON Array Input
            </span>
            <button
              onClick={() => setJsonInput("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste JSON array..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col overflow-hidden">
          {activeTab === "table" ? (
            /* Table View */
            <div className="w-full h-full min-h-[420px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="px-3.5 py-2.5 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headers.length || 1}
                        className="p-8 text-center text-gray-400 italic"
                      >
                        Paste valid JSON on the left to render the spreadsheet table.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        {headers.map((h) => (
                          <td
                            key={h}
                            className="px-3.5 py-2 font-mono text-gray-800 dark:text-gray-200 whitespace-nowrap"
                          >
                            {row[h] !== undefined ? String(row[h]) : ""}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Raw CSV View */
            <textarea
              readOnly
              rows={18}
              value={csvText}
              placeholder="CSV text will appear here..."
              className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
