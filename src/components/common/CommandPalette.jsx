"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { utilities } from "../../data/utilities";
import { useFavorites } from "../../context/FavoritesContext";
import { getCategoryIcon, StarIcon } from "./Icons";

export default function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    favorites = [],
    recents = [],
    addRecent,
  } = useFavorites();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Filtered utilities list
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    const favList = favorites || [];
    const recentList = recents || [];

    if (!q) {
      // Prioritize pinned and recent tools when query is empty
      const pinned = utilities.filter((u) => favList.includes(u.id));
      const recentItems = recentList
        .map((id) => utilities.find((u) => u.id === id))
        .filter(Boolean);
      const others = utilities.filter(
        (u) => !favList.includes(u.id) && !recentList.includes(u.id)
      );
      return [...pinned, ...recentItems, ...others].slice(0, 12);
    }

    return utilities
      .filter((tool) => {
        return (
          tool.title.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q) ||
          tool.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 20);
  }, [query, favorites, recents]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev >= filteredList.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredList.length - 1) : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredList[selectedIndex]) {
        handleSelect(filteredList[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeCommandPalette();
    }
  };

  const handleSelect = (tool) => {
    addRecent(tool.id);
    closeCommandPalette();
    router.push(`/utility/${tool.id}`);
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      onClick={closeCommandPalette}
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 lg:pt-24 px-3 sm:px-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-gray-100 dark:border-gray-700 gap-2.5 sm:gap-3 shrink-0">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search all 71 developer tools..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none"
          />

          <button
            onClick={closeCommandPalette}
            className="px-2 py-0.5 text-[11px] font-mono text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 divide-y-0"
        >
          {filteredList.length === 0 ? (
            <div className="py-10 text-center text-xs sm:text-sm text-gray-400">
              No developer tools found matching &quot;{query}&quot;
            </div>
          ) : (
            filteredList.map((tool, index) => {
              const isSelected = index === selectedIndex;
              const isPinned = favorites.includes(tool.id);

              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="shrink-0">
                      {isPinned ? (
                        <StarIcon filled className="w-4 h-4 text-amber-500" />
                      ) : (
                        <span className={isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"}>
                          {getCategoryIcon(tool.category, "w-4 h-4")}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected
                            ? "text-white"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {tool.title}
                      </div>
                      <div
                        className={`text-[11px] sm:text-xs truncate ${
                          isSelected
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {tool.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? "bg-blue-700 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {tool.category}
                    </span>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-white" : "text-gray-400"
                      }`}
                    >
                      ↵
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts legend */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px] text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">
                ↑
              </kbd>{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">
                ↓
              </kbd>{" "}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">
                ↵
              </kbd>{" "}
              to select
            </span>
          </div>
          <span>DevutiliX Suite</span>
        </div>
      </div>
    </div>
  );
}
