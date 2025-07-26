// src/App.jsx
import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import SearchBar from "./components/common/SearchBar";
import UtilityCard from "./components/common/UtilityCard";
import ScrollToTop from "./components/ScrollToTop";

import { utilities } from "./data/utilities";
import { useSearch } from "./hooks/useSearch";
import SEO from "./components/SEO";
import About from "./pages/About";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */

const totalUtilities = utilities.length;

/* Lazy-load every utility component */
const utilityComponents = {};
utilities.forEach((u) => {
  utilityComponents[u.component] = lazy(() =>
    import(`./components/utilities/${u.component}.jsx`)
  );
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Utilities grid (= former home)                                    */
/* ------------------------------------------------------------------ */

const UtilitiesHome = () => {
  const navigate = useNavigate();
  const { query, setQuery, results } = useSearch(utilities, [
    "title",
    "description",
    "tags",
    "category",
  ]);

  /* clicking a card = go to /utility/:id */
  const openUtility = (u) => navigate(`/utility/${u.id}`);

  return (
    <main className="pt-16 flex-1">
      <SEO />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* search ---------------------------------------------------- */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mt-4">
            <SearchBar
              query={query}
              onChange={setQuery}
              placeholder="Search utilities..."
            />
          </div>
        </div>

        {/* header / clear search ------------------------------------- */}
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

        {/* grid / no-results block ----------------------------------- */}
        {results.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No utilities found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((u) => (
              <UtilityCard
                key={u.id}
                utility={u}
                onClick={() => openUtility(u)}
              />
            ))}
          </div>
        )}

        {/* categories overview (only when not searching) ------------- */}
        {!query && (
          <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Browse by Category
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...new Set(utilities.map((u) => u.category))].map((cat) => {
                const count = utilities.filter(
                  (u) => u.category === cat
                ).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setQuery(cat)}
                    className="
                      p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                      rounded-lg hover:border-blue-300 dark:hover:border-blue-600
                      hover:shadow-md transition-all text-left
                      focus:ring-2 focus:ring-blue-500 focus:outline-none
                    "
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {cat}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {count} tool{count !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

/* ------------------------------------------------------------------ */
/*  Individual utility page                                           */
/* ------------------------------------------------------------------ */

const UtilityPage = () => {
  const { utilityId } = useParams();
  const navigate = useNavigate();

  const utility = utilities.find((u) => u.id === utilityId);

  if (!utility) {
    return (
      <main className="pt-16 flex-1 text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Utility not found
        </h2>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Utilities
        </button>
      </main>
    );
  }

  const Component = utilityComponents[utility.component];

  return (
    <main className="pt-16 flex-1">
      <SEO
        title={`${utility.title} - Developer Utilities Suite`}
        description={utility.description}
        canonical={`/utility/${utility.id}`}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <button
          onClick={() => navigate(-1)}
          className="
            mb-6 inline-flex items-center px-4 py-2 text-sm font-medium
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

        <Suspense fallback={<LoadingSpinner />}>
          <Component />
        </Suspense>
      </div>
    </main>
  );
};

/* ------------------------------------------------------------------ */
/*  Root component with routing                                       */
/* ------------------------------------------------------------------ */

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
          <Header />

          <Routes>
            {/* utilities grid */}
            <Route path="/" element={<UtilitiesHome />} />

            {/* individual utility */}
            <Route path="/utility/:utilityId" element={<UtilityPage />} />

            {/* about page */}
            <Route
              path="/about"
              element={
                <>
                  <SEO
                    title="About - Developer Utilities Suite"
                    description="Learn more about the 31-tool DevutiliX suite."
                    canonical="/about"
                  />
                  <About />
                </>
              }
            />

            {/* legacy /utilities -> / */}
            <Route path="/utilities" element={<Navigate to="/" replace />} />

            {/* catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
