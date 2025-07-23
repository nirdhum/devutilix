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
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
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
          block w-full pl-12 pr-16 py-4 border-2 border-gray-300 dark:border-gray-600 
          rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg
          placeholder-gray-500 dark:placeholder-gray-400
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 shadow-sm hover:shadow-md
        "
      />

      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <div className="flex items-center space-x-2">
          {query && (
            <button
              onClick={() => onChange("")}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded pointer-events-auto"
            >
              <svg
                className="w-4 h-4 text-gray-400"
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
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            ⌘ K
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
