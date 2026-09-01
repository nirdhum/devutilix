"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { utilities } from "../data/utilities";
import { useFavorites } from "../context/FavoritesContext";
import {
  ToolsIcon,
  SearchIcon,
  BoltIcon,
  CodeBracketIcon,
  RocketIcon,
} from "../components/common/Icons";

const POPULAR_TOOLS = [
  { id: "json-formatter", title: "JSON Formatter", category: "Data", desc: "Format, validate & minify JSON" },
  { id: "base64", title: "Base64 Converter", category: "Encoding", desc: "Encode & decode Base64 strings" },
  { id: "hash", title: "Hash Generator", category: "Security", desc: "Generate SHA-256, MD5, SHA-512" },
  { id: "text-diff", title: "Text Diff Checker", category: "Development", desc: "Side-by-side text diff inspection" },
  { id: "markdown-preview", title: "Markdown Preview", category: "Text Processing", desc: "Live Markdown editor with preview" },
  { id: "qr-code-generator", title: "QR Code Generator", category: "Generation", desc: "Generate customizable QR codes" },
];

export default function NotFound() {
  const { openCommandPalette } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [diagnosticStatus, setDiagnosticStatus] = useState("idle"); // idle | running | done
  const [diagnosticLogs, setDiagnosticLogs] = useState([
    "GET /requested-route HTTP/1.1",
    "STATUS: 404 NOT FOUND",
    "REGISTRY: 71 Client Utilities Online",
  ]);
  const [randomTool, setRandomTool] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  // Filter tools based on user search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return utilities
      .filter(
        (u) =>
          u.title.toLowerCase().includes(query) ||
          u.description.toLowerCase().includes(query) ||
          u.tags.some((t) => t.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [searchQuery]);

  // Interactive diagnostic simulation
  const handleRunDiagnostics = () => {
    if (diagnosticStatus === "running") return;
    setDiagnosticStatus("running");
    setDiagnosticLogs(["[INIT] Pinging in-browser WebWorker registry..."]);

    setTimeout(() => {
      setDiagnosticLogs((prev) => [
        ...prev,
        "[SCAN] Verifying 13 categories and 71 endpoints... OK (0.3ms)",
      ]);
    }, 400);

    setTimeout(() => {
      setDiagnosticLogs((prev) => [
        ...prev,
        "[STATUS] Target segment unmapped. Client security engine healthy.",
        "[ACTION] Recommended action: Return home or roll random utility.",
      ]);
      setDiagnosticStatus("done");
    }, 900);
  };

  // Roll random utility
  const handleRollRandom = () => {
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * utilities.length);
      setRandomTool(utilities[randomIndex]);
      count++;
      if (count > 6) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="ambient-glow opacity-80 dark:opacity-100" />

      {/* Background Decorative Grid Elements */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none font-mono text-[20vw] font-black">
        404
      </div>

      <div className="w-full max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide uppercase shadow-xs transition-all hover:scale-105">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="font-mono">HTTP 404 • ROUTE_UNRESOLVED</span>
        </div>

        {/* Hero 404 Title */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              404
            </span>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Lost in the Devverse?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            The requested coordinate does not exist in memory. All 71 developer utilities are running healthy in your browser—let&apos;s get you back on track.
          </p>
        </div>

        {/* Primary Action Button Hub */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Return to Workspace</span>
          </Link>

          <button
            onClick={openCommandPalette}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-sm shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <SearchIcon className="w-4 h-4 text-blue-500" />
            <span>Command Palette</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={handleRollRandom}
            type="button"
            disabled={isRolling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 hover:border-purple-300 text-purple-700 dark:text-purple-300 font-semibold text-sm shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
          >
            <RocketIcon className={`w-4 h-4 text-purple-500 ${isRolling ? "animate-spin" : ""}`} />
            <span>{isRolling ? "Rolling Coordinates..." : "Roll Random Utility"}</span>
          </button>
        </div>

        {/* Random Utility Teleport Display */}
        {randomTool && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/80 shadow-md text-left transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Random Teleport Discovered
              </span>
              <span className="px-2 py-0.5 text-[10px] rounded-md bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-semibold">
                {randomTool.category}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {randomTool.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {randomTool.description}
            </p>
            <div className="mt-3 flex justify-end">
              <Link
                href={`/utility/${randomTool.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Launch {randomTool.title}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Interactive In-Page Search Bar */}
        <div className="max-w-xl mx-auto relative text-left">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search all 71 tools (e.g., json, jwt, base64, hash)..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-30 divide-y divide-gray-100 dark:divide-gray-700/60">
              {searchResults.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/utility/${tool.id}`}
                  className="flex items-center justify-between p-3 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors"
                >
                  <div className="pr-4">
                    <span className="font-bold text-sm text-gray-900 dark:text-white block">
                      {tool.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {tool.description}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                    {tool.category}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Diagnostic Console Card */}
        <div className="max-w-xl mx-auto rounded-2xl bg-gray-950 text-gray-200 border border-gray-800 shadow-xl text-left overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-gray-400">devutilix-diagnostics.sh</span>
            </div>
            <button
              onClick={handleRunDiagnostics}
              disabled={diagnosticStatus === "running"}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
            >
              <BoltIcon className={`w-3 h-3 text-amber-400 ${diagnosticStatus === "running" ? "animate-spin" : ""}`} />
              <span>{diagnosticStatus === "running" ? "Scanning..." : "Run Diagnostic"}</span>
            </button>
          </div>
          <div className="p-4 font-mono text-xs space-y-1.5 overflow-x-auto text-gray-300">
            {diagnosticLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-gray-600 select-none">&gt;</span>
                <span className={log.includes("404") ? "text-amber-400" : log.includes("OK") ? "text-emerald-400" : "text-gray-300"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Utilities Grid */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <ToolsIcon className="w-4 h-4 text-blue-500" />
            <span>Popular Destinations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left">
            {POPULAR_TOOLS.map((tool) => (
              <Link
                key={tool.id}
                href={`/utility/${tool.id}`}
                className="group p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.25 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                    {tool.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
