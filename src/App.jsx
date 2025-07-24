import { useState, lazy, Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import SearchBar from "./components/common/SearchBar";
import UtilityCard from "./components/common/UtilityCard";
import { utilities } from "./data/utilities";
import { useSearch } from "./hooks/useSearch";

const totalUtilities = utilities.length;

// Lazy load utility components
const utilityComponents = {};
utilities.forEach((utility) => {
  utilityComponents[utility.component] = lazy(() =>
    import(`./components/utilities/${utility.component}.jsx`)
  );
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const [currentUtility, setCurrentUtility] = useState(null);
  const { query, setQuery, results } = useSearch(utilities, [
    "title",
    "description",
    "tags",
    "category",
  ]);

  const handleUtilitySelect = (utility) => {
    setCurrentUtility(utility);
  };

  const handleBackToGrid = () => {
    setCurrentUtility(null);
  };

  const renderUtilityComponent = () => {
    if (!currentUtility) return null;

    const Component = utilityComponents[currentUtility.component];
    if (!Component) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Component not found: {currentUtility.component}
          </p>
        </div>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    );
  };

  return (
    <ThemeProvider>
      {/* ✅ FIXED: Added flex flex-col to make footer stick to bottom */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <Header />

        {/* ✅ FIXED: Added flex-1 to make main content expand and push footer down */}
        <main className="pt-16 flex-1">
          {currentUtility ? (
            // Individual Utility View
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={handleBackToGrid}
                  className="
                    inline-flex items-center px-4 py-2 text-sm font-medium
                    text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                    bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                    rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors
                  "
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Utilities
                </button>
              </div>

              {renderUtilityComponent()}
            </div>
          ) : (
            // Grid View
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="max-w-2xl mx-auto mt-4">
                  <SearchBar
                    query={query}
                    onChange={setQuery}
                    placeholder="Search utilities..."
                  />
                </div>
              </div>

              {/* Main Utilities Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {query
                      ? `Search Results (${results.length})`
                      : `All Utilities (${totalUtilities})`}
                  </h2>
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No utilities found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search query or browse all utilities
                    below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((utility) => (
                    <UtilityCard
                      key={utility.id}
                      utility={utility}
                      onClick={() => handleUtilitySelect(utility)}
                    />
                  ))}
                </div>
              )}

              {/* Categories Overview (when not searching) */}
              {!query && (
                <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                    Browse by Category
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...new Set(utilities.map((u) => u.category))].map(
                      (category) => {
                        const categoryCount = utilities.filter(
                          (u) => u.category === category
                        ).length;
                        return (
                          <button
                            key={category}
                            onClick={() => setQuery(category)}
                            className="
                            p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                            rounded-lg hover:border-blue-300 dark:hover:border-blue-600
                            hover:shadow-md transition-all text-left
                            focus:ring-2 focus:ring-blue-500 focus:outline-none
                          "
                          >
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {category}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {categoryCount} tool
                              {categoryCount !== 1 ? "s" : ""}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
