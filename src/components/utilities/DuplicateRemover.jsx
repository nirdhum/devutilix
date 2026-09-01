"use client";

import { useState, useMemo } from "react";

const SAMPLE_LIST = `alice@example.com
bob@example.com
charlie@example.com
alice@example.com
david@example.com
Bob@example.com
eva@example.com
david@example.com
frank@example.com
eva@example.com`;

export default function DuplicateRemover() {
  const [inputText, setInputText] = useState(SAMPLE_LIST);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortOrder, setSortOrder] = useState("none"); // none | asc | desc | natural
  const [copied, setCopied] = useState(false);

  const { outputText, originalCount, uniqueCount, dupCount } = useMemo(() => {
    if (!inputText) {
      return { outputText: "", originalCount: 0, uniqueCount: 0, dupCount: 0 };
    }

    let lines = inputText.split("\n");
    const totalLines = lines.length;

    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }

    if (removeEmpty) {
      lines = lines.filter((l) => l.length > 0);
    }

    // Deduplicate
    const seen = new Set();
    const unique = [];

    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }

    // Sort
    if (sortOrder === "asc") {
      unique.sort((a, b) => a.localeCompare(b));
    } else if (sortOrder === "desc") {
      unique.sort((a, b) => b.localeCompare(a));
    } else if (sortOrder === "natural") {
      unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    }

    return {
      outputText: unique.join("\n"),
      originalCount: totalLines,
      uniqueCount: unique.length,
      dupCount: Math.max(0, lines.length - unique.length),
    };
  }, [inputText, caseSensitive, trimLines, removeEmpty, sortOrder]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deduplicated.txt";
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
              <span>Duplicate Line Remover & Sorter</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Eliminate duplicate lines, clean whitespace, and sort lists alphabetically or naturally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              ⬇ Download .txt
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
            >
              {copied ? "✓ Copied!" : "Copy Clean List"}
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Case-Sensitive</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Trim Whitespace</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(e) => setRemoveEmpty(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Remove Empty Lines</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-2.5 py-1 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="none">Original Order</option>
              <option value="asc">Alphabetical (A-Z)</option>
              <option value="desc">Reverse (Z-A)</option>
              <option value="natural">Natural Sort (1, 2, 10)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Lines</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{originalCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Unique Lines</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{uniqueCount}</span>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Duplicates Removed</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{dupCount}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Input Lines
            </span>
            <button
              onClick={() => setInputText("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste lines of text here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Clean Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Deduplicated & Sorted List
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
              {uniqueCount} unique lines
            </span>
          </div>
          <textarea
            readOnly
            rows={18}
            value={outputText}
            placeholder="Cleaned list will appear here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
