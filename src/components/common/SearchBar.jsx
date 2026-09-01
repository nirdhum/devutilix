"use client";

import { useRef, useEffect } from "react";

const SearchBar = ({
  query,
  onChange,
  placeholder = "Search utilities...",
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key === "Escape") {
        inputRef.current?.blur();
        onChange("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onChange]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
        <svg
          className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-gray-400"
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
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          block w-full pl-10 sm:pl-12 pr-12 sm:pr-20 py-3 sm:py-3.5 border-2 border-gray-300 dark:border-gray-600 
          rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base
          placeholder-gray-500 dark:placeholder-gray-400
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 shadow-xs hover:shadow-sm
        "
      />

      <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-4 flex items-center">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {query && (
            <button
              onClick={() => onChange("")}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-600 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
