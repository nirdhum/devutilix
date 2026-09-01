"use client";

import { useState, useMemo } from "react";
import SearchBar from "../common/SearchBar";
import UtilityCard from "../common/UtilityCard";
import Link from "next/link";
import { utilities, categories } from "../../data/utilities";
import { useSearch } from "../../hooks/useSearch";
import { useFavorites } from "../../context/FavoritesContext";
import {
  getCategoryIcon,
  ShieldCheckIcon,
  BoltIcon,
  CloudSlashIcon,
  CodeBracketIcon,
  StarIcon,
  SearchIcon,
} from "../common/Icons";

const totalUtilities = utilities.length;

const POPULAR_PICKS = [
  "JSON Formatter",
  "JWT Debugger",
  "Regex Tester",
  "Base64",
  "Tailwind Converter",
  "CIDR Calculator",
  "SQL Inserts",
  "NanoID",
];

export default function HomeContent() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // grid | compact
  const { favorites } = useFavorites();

  const { query, setQuery, results } = useSearch(utilities, [
    "title",
    "description",
    "tags",
    "category",
  ]);

  // Filter results by selected category if not ALL
  const filteredUtilities = useMemo(() => {
    let list = results;
    if (selectedCategory !== "ALL") {
      list = list.filter((u) => u.category === selectedCategory);
    }
    return list;
  }, [results, selectedCategory]);

  // Pinned tools
  const pinnedUtilities = useMemo(() => {
    return utilities.filter((u) => favorites.includes(u.id));
  }, [favorites]);

  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="ambient-glow" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 relative z-10 space-y-6 sm:space-y-10">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto pt-1 sm:pt-4 space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Developer Utilities. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Fast, Local & Private.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed px-2">
            {totalUtilities} essential developer utilities running 100% client-side in your browser. Zero server uploads, zero trackers, instant sub-millisecond execution.
          </p>

          {/* Trust Badges with Custom SVG Icons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 pt-1 sm:pt-2 text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-500" />
              100% Client-Side
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
              <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
              Instant Execution
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
              <CloudSlashIcon className="w-3.5 h-3.5 text-purple-500" />
              Offline Ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
              <CodeBracketIcon className="w-3.5 h-3.5 text-emerald-500" />
              Free & Open Source
            </span>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-2 sm:pt-4">
            <SearchBar
              query={query}
              onChange={(val) => {
                setQuery(val);
                if (val && selectedCategory !== "ALL") {
                  setSelectedCategory("ALL");
                }
              }}
              placeholder={`Search ${totalUtilities} developer tools (e.g. JSON, JWT, Regex, Docker)...`}
            />

            {/* Popular Query Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 sm:mt-3 px-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-0.5">
                Popular:
              </span>
              {POPULAR_PICKS.map((pick) => (
                <button
                  key={pick}
                  onClick={() => setQuery(pick)}
                  className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer shadow-2xs"
                >
                  {pick}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Top Interactive Category Filter Pills */}
        <div className="sticky top-16 z-20 py-2 sm:py-2.5 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-y border-gray-200/70 dark:border-gray-800/70 flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              All ({totalUtilities})
            </button>

            {categories.map((cat) => {
              const count = utilities.filter((u) => u.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <span className={isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"}>
                    {getCategoryIcon(cat, "w-3.5 h-3.5")}
                  </span>
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-blue-700 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View mode toggle (Grid vs Compact) */}
          <div className="hidden sm:flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-700"
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "compact"
                  ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-700"
              }`}
              title="Compact View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pinned / Favorites Shelf (Shown when not actively searching) */}
        {!query && pinnedUtilities.length > 0 && selectedCategory === "ALL" && (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <StarIcon filled className="w-4 h-4 text-amber-500" />
                <span>Pinned Utilities</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold">
                  {pinnedUtilities.length}
                </span>
              </h2>
              <span className="text-[11px] sm:text-xs text-gray-400">Stored locally in browser</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
              {pinnedUtilities.map((u) => (
                <UtilityCard key={`pinned-${u.id}`} utility={u} />
              ))}
            </div>
          </section>
        )}

        {/* Main Grid / Compact View */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-1 sm:pb-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              {query
                ? `Search Results (${filteredUtilities.length})`
                : selectedCategory === "ALL"
                ? `All Developer Utilities (${totalUtilities})`
                : `${selectedCategory} Tools (${filteredUtilities.length})`}
            </h2>

            {(query || selectedCategory !== "ALL") && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("ALL");
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {filteredUtilities.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 my-4 shadow-xs">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/60 text-gray-400">
                <SearchIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                No developer tools found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4 max-w-sm mx-auto">
                We couldn&apos;t find any tool matching &quot;{query}&quot;.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Show all tools
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
              {filteredUtilities.map((u) => (
                <UtilityCard key={u.id} utility={u} />
              ))}
            </div>
          ) : (
            /* Compact List View */
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden shadow-xs">
              {filteredUtilities.map((u) => (
                <Link
                  key={u.id}
                  href={`/utility/${u.id}`}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-300">
                      {getCategoryIcon(u.category, "w-4 h-4")}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {u.title}
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        {u.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                    <span className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                      {u.category}
                    </span>
                    <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all text-xs sm:text-sm">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
