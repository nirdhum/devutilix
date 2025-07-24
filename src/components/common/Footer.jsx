import { utilities, categories } from "../../data/utilities";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Dynamic calculations
  const totalUtilities = utilities.length;
  const totalCategories = categories.length;

  // Calculate utilities per category
  const categoryStats = categories.map((category) => ({
    name: category,
    count: utilities.filter((utility) => utility.category === category).length,
  }));

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Copyright Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            © {currentYear}. Made by{" "}
            <a
              href="https://nirdhum.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              Nirdhum.
            </a>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>A product of{" "}
            <a
              href="https://veridicuslab.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              Veridicus Lab.
            </a>
          </div>

          {/* Optional Links */}
          <div className="flex items-center space-x-4 text-sm">
            <a
              href="https://github.com/nirdhum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center space-y-2">
            {/* Main Stats Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              🛠️ {totalUtilities} Developer Utilities • {totalCategories}{" "}
              Categories
            </span>

            {/* Category Breakdown (Optional - shows on hover or always visible) */}
            <div className="hidden sm:flex flex-wrap justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              {categoryStats.map((category, index) => (
                <span key={category.name}>
                  {category.name} ({category.count})
                  {index < categoryStats.length - 1 && " • "}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
